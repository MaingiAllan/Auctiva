package com.auctiva.backend.payments;

import com.auctiva.backend.orders.Order;
import com.auctiva.backend.orders.OrderStatus;
import com.auctiva.backend.orders.OrderService;
import com.auctiva.backend.listings.ListingService;
import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository payments;
    private final OrderService orders;
    private final ListingService listings;
    private final MpesaClient mpesa;
    private final String callbackToken;

    public PaymentService(PaymentRepository payments, OrderService orders, ListingService listings, MpesaClient mpesa,
                          @Value("${auctiva.mpesa.callback-token:}") String callbackToken) {
        this.payments = payments;
        this.orders = orders;
        this.listings = listings;
        this.mpesa = mpesa;
        this.callbackToken = callbackToken;
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    static String normalisePhone(String raw) {
        String digits = raw.replaceAll("[\\s\\-+]", "");
        if (digits.startsWith("0")) {
            digits = "254" + digits.substring(1);
        }
        if (!digits.matches("254[17]\\d{8}")) {
            throw bad("Enter a valid Safaricom number, e.g. 0712345678");
        }
        return digits;
    }

    /**
     * Starts an STK Push. The amount comes from the order snapshot, never from the client. Repeating the
     * same idempotency key returns the original payment instead of charging twice; to retry after a
     * failure the client must send a new key. No DB transaction is held open during the HTTP call.
     */
    public Payment startMpesaPayment(UUID userId, UUID orderId, String rawPhone, String key) {
        Optional<Payment> existing = payments.findByUserIdAndIdempotencyKey(userId, key);
        if (existing.isPresent()) {
            return existing.get();
        }
        Order order = orders.getOrderOrThrow(orderId);
        if (!order.getBuyerId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not your order");
        }
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw bad("This order is no longer awaiting payment");
        }
        BigDecimal amount;
        String phone;
        try {
            if (!"KES".equals(order.getCurrency())) {
                throw bad("M-Pesa supports KES listings only");
            }
            amount = order.getAmount();
            if (amount.stripTrailingZeros().scale() > 0) {
                throw bad("Price must be a whole number of shillings for M-Pesa");
            }
            phone = normalisePhone(rawPhone);
        } catch (RuntimeException ex) {
            orders.cancelAfterPaymentFailure(order.getId());
            throw ex;
        }
        Payment payment = new Payment(userId, order.getListingId(), order.getId(), amount, "KES", "MPESA",
                phone, key);
        payment = payments.saveAndFlush(payment);
        try {
            MpesaClient.StkResponse res = mpesa.stkPush(payment.getPhone(), amount.longValueExact(), payment.getId());
            payment.markPushed(res.merchantRequestId(), res.checkoutRequestId());
        } catch (MpesaException ex) {
            log.warn("STK push failed for payment {}: {}", payment.getId(), ex.getMessage());
            if (ex.isOutcomeUnknown()) {
                payment.finish(PaymentStatus.REQUIRES_REVIEW, null, ex.getMessage());
                orders.markPaymentReview(order.getId());
            } else {
                payment.finish(PaymentStatus.FAILED, null, ex.getMessage());
                orders.cancelAfterPaymentFailure(order.getId());
            }
            payments.save(payment);
            String message = ex.isOutcomeUnknown()
                    ? "M-Pesa may have received the request. Don't retry this payment; it needs manual review."
                    : "Couldn't start the M-Pesa payment. Please try again.";
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, message);
        }
        return payments.save(payment);
    }

    public Payment getPayment(UUID id) {
        return payments.findById(id).orElseThrow(() -> new java.util.NoSuchElementException("Payment not found: " + id));
    }

    /** The callback URL carries a secret token because Daraja callbacks are not signed. */
    public boolean isValidCallbackToken(String supplied) {
        return !callbackToken.isBlank()
                && MessageDigest.isEqual(callbackToken.getBytes(StandardCharsets.UTF_8), supplied.getBytes(StandardCharsets.UTF_8));
    }

    /** Idempotent: only a PENDING payment can change, so repeated callbacks are harmless. */
    @Transactional
    public void handleCallback(JsonNode body) {
        JsonNode cb = body.path("Body").path("stkCallback");
        String checkoutId = cb.path("CheckoutRequestID").asText("");
        Optional<Payment> found = payments.findByCheckoutRequestIdForUpdate(checkoutId);
        if (found.isEmpty()) {
            log.warn("M-Pesa callback for unknown CheckoutRequestID {}", checkoutId);
            return;
        }
        Payment payment = found.get();
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return;
        }
        int code = cb.path("ResultCode").asInt(-1);
        String desc = cb.path("ResultDesc").asText("");
        payment.recordCallback(code, body.toString());
        if (code != 0) {
            payment.finish(code == 1032 ? PaymentStatus.CANCELLED : PaymentStatus.FAILED, null, desc);
            if (payment.getOrderId() != null) {
                orders.cancelAfterPaymentFailure(payment.getOrderId());
            }
            return;
        }
        String receipt = null;
        BigDecimal paid = null;
        for (JsonNode item : cb.path("CallbackMetadata").path("Item")) {
            String name = item.path("Name").asText();
            if ("MpesaReceiptNumber".equals(name)) {
                receipt = item.path("Value").asText(null);
            } else if ("Amount".equals(name)) {
                paid = item.path("Value").decimalValue();
            }
        }
        if (paid == null || paid.compareTo(payment.getAmount()) != 0 || receipt == null) {
            log.error("M-Pesa amount/receipt mismatch for payment {}: paid={} expected={}", payment.getId(), paid, payment.getAmount());
            payment.finish(PaymentStatus.REQUIRES_REVIEW, null, "Amount or receipt mismatch; needs manual review");
            if (payment.getOrderId() != null) {
                orders.markPaymentReview(payment.getOrderId());
            }
            return;
        }
        if (payment.getOrderId() != null) {
            orders.markPaid(payment.getOrderId());
        } else {
            if (!listings.completeLegacyPayment(payment.getListingId())) {
                log.error("Successful legacy payment {} could not be matched to an available listing; manual review required",
                        payment.getId());
                payment.finish(PaymentStatus.REQUIRES_REVIEW, null,
                        "Payment received but listing is unavailable; needs manual review");
                return;
            }
        }
        payment.finish(PaymentStatus.SUCCEEDED, receipt, desc);
    }
}
