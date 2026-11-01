package com.auctiva.backend.payments;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** One payment attempt. user/listing are plain UUIDs (module boundary), not JPA relations. */
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(name = "listing_id", nullable = false)
    private UUID listingId;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    @Column(nullable = false)
    private String currency;
    @Column(nullable = false)
    private String method;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;
    private String phone;
    @Column(name = "idempotency_key", nullable = false)
    private String idempotencyKey;
    @Column(name = "merchant_request_id")
    private String merchantRequestId;
    @Column(name = "checkout_request_id")
    private String checkoutRequestId;
    @Column(name = "mpesa_receipt")
    private String mpesaReceipt;
    @Column(name = "result_code")
    private Integer resultCode;
    @Column(name = "result_desc")
    private String resultDesc;
    @Column(name = "callback_payload", columnDefinition = "text")
    private String callbackPayload;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected Payment() {
        // JPA
    }

    public Payment(UUID userId, UUID listingId, BigDecimal amount, String currency, String method, String phone, String idempotencyKey) {
        this.userId = userId;
        this.listingId = listingId;
        this.amount = amount;
        this.currency = currency;
        this.method = method;
        this.phone = phone;
        this.idempotencyKey = idempotencyKey;
    }

    public void markPushed(String merchantRequestId, String checkoutRequestId) {
        this.merchantRequestId = merchantRequestId;
        this.checkoutRequestId = checkoutRequestId;
        this.updatedAt = Instant.now();
    }

    public void recordCallback(int code, String payload) {
        this.resultCode = code;
        this.callbackPayload = payload;
        this.updatedAt = Instant.now();
    }

    public void finish(PaymentStatus status, String receipt, String description) {
        this.status = status;
        this.mpesaReceipt = receipt;
        this.resultDesc = description == null ? null : description.substring(0, Math.min(description.length(), 255));
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getListingId() { return listingId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public PaymentStatus getStatus() { return status; }
    public String getPhone() { return phone; }
    public String getMpesaReceipt() { return mpesaReceipt; }
    public String getResultDesc() { return resultDesc; }
    public Instant getCreatedAt() { return createdAt; }
}
