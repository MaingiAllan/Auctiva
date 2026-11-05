package com.auctiva.backend.orders;

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

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    @Column(name = "seller_id", nullable = false)
    private UUID sellerId;

    @Column(name = "listing_id", nullable = false)
    private UUID listingId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private OrderStatus status = OrderStatus.PENDING_PAYMENT;

    @Column(name = "idempotency_key", nullable = false, length = 64)
    private String idempotencyKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected Order() {
        // JPA
    }

    public Order(UUID buyerId, UUID sellerId, UUID listingId, BigDecimal amount, String currency,
                 String idempotencyKey) {
        this.buyerId = buyerId;
        this.sellerId = sellerId;
        this.listingId = listingId;
        this.amount = amount;
        this.currency = currency;
        this.idempotencyKey = idempotencyKey;
    }

    public void markPaid() {
        this.status = OrderStatus.PAID;
        this.updatedAt = Instant.now();
    }

    public void requirePaymentReview() {
        this.status = OrderStatus.PAYMENT_REVIEW;
        this.updatedAt = Instant.now();
    }

    public void cancel() {
        this.status = OrderStatus.CANCELLED;
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getBuyerId() { return buyerId; }
    public UUID getSellerId() { return sellerId; }
    public UUID getListingId() { return listingId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public OrderStatus getStatus() { return status; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public Instant getCreatedAt() { return createdAt; }
}
