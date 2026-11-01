package com.auctiva.backend.payments;

import com.auctiva.backend.listings.Listing;
import com.auctiva.backend.listings.ListingService;
import com.auctiva.backend.listings.ListingStatus;
import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository payments;
    private final ListingService listings;
    private final MpesaClient mpesa;
    private final String callbackToken;

    public PaymentService(PaymentRepository payments, ListingService listings, MpesaClient mpesa,
                          @Value("${auctiva.mpesa.callback-token:}") String callbackToken) {
        this.payments = payments;
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
     * Starts an STK Push. The amount comes from the listing, never from the client. Repeating the
     * same idempotency key returns the original payment instead of charging twice; to retry after a
     * failure the client must send a new key. No DB transaction is held open during the HTTP call.
     */
    public Payment startMpesaPayment(UUID userId, UUID listingId, String rawPhone, String key) {
        Optional<Payment> existing = payments.findByUserIdAndIdempotencyKey(userId, key);
        if (existing.isPresent()) {
            return existing.get();
        }
        Listing listing = listings.getListingOrThrow(listingId);
        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw bad("This listing is no longer available");
        }
        if (listing.getSellerId().equals(userId)) {
            throw bad("You can't buy your own listing");
        }
        if (!"KES".equals(listing.getCurrency())) {
            throw bad("M-Pesa supports KES listings only");
        }
        BigDecimal amount = listing.getPrice();
        if (amount.stripTrailingZeros().scale() > 0) {
            throw bad("Price must be a whole number of shillings for M-Pesa");
        }
        Payment payment = new Payment(userId, listing.getId(), amount, "KES", "MPESA", normalisePhone(rawPhone), key);
        try {
            payment = payments.saveAndFlush(payment);
        } catch (DataIntegrityViolationException ex) {
            return payments.findByUserIdAndIdempotencyKey(userId, key).orElseThrow(() -> ex);
        }
        try {
            MpesaClient.StkResponse res = mpesa.stkPush(payment.getPhone(), amount.longValueExact(), payment.getId());
            payment.markPushed(res.merchantRequestId(), res.checkoutRequestId());
        } catch (MpesaException ex) {
            log.warn("STK push failed for payment {}: {}", payment.getId(), ex.getMessage());
            payment.finish(PaymentStatus.FAILED, null, ex.getMessage());
            payments.save(payment);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Couldn't start the M-Pesa payment. Please try again.");
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
        Optional<Payment> found = payments.findByCheckoutRequestId(checkoutId);
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
            payment.finish(PaymentStatus.FAILED, null, "Amount or receipt mismatch; needs manual review");
            return;
        }
        payment.finish(PaymentStatus.SUCCEEDED, receipt, desc);
    }
}
