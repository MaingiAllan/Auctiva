package com.auctiva.backend.payments.dto;

import com.auctiva.backend.payments.Payment;
import com.auctiva.backend.payments.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(UUID id, UUID listingId, UUID orderId, BigDecimal amount, String currency, PaymentStatus status,
                              String mpesaReceipt, String message, Instant createdAt) {

    public static PaymentResponse from(Payment p) {
        return new PaymentResponse(p.getId(), p.getListingId(), p.getOrderId(), p.getAmount(), p.getCurrency(), p.getStatus(),
                p.getMpesaReceipt(), p.getResultDesc(), p.getCreatedAt());
    }
}
