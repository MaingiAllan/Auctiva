package com.auctiva.backend.listings;

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

/**
 * seller_id and device_model_id are plain UUID columns, not JPA @ManyToOne relations —
 * this module doesn't import identity.User or catalog.DeviceModel. Cross-module lookups
 * go through those modules' service DTOs instead (see CatalogService.findSummary).
 */
@Entity
@Table(name = "listings")
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "seller_id", nullable = false)
    private UUID sellerId;

    @Column(name = "device_model_id", nullable = false)
    private UUID deviceModelId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_grade", nullable = false)
    private ConditionGrade conditionGrade;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 3)
    private String currency;

    private String location;

    @Column(name = "imei_1")
    private String imei1;

    @Column(name = "imei_2")
    private String imei2;

    @Column(name = "serial_number")
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingStatus status = ListingStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected Listing() {
        // JPA
    }

    public Listing(UUID sellerId, UUID deviceModelId, String title, String description,
                    ConditionGrade conditionGrade, BigDecimal price, String currency,
                    String location, String imei1, String imei2, String serialNumber) {
        this.sellerId = sellerId;
        this.deviceModelId = deviceModelId;
        this.title = title;
        this.description = description;
        this.conditionGrade = conditionGrade;
        this.price = price;
        this.currency = (currency == null || currency.isBlank()) ? "KES" : currency;
        this.location = location;
        this.imei1 = imei1;
        this.imei2 = imei2;
        this.serialNumber = serialNumber;
    }

    public void updateDetails(String title, String description, BigDecimal price, String location) {
        if (title != null) this.title = title;
        if (description != null) this.description = description;
        if (price != null) this.price = price;
        if (location != null) this.location = location;
        this.updatedAt = Instant.now();
    }

    public void markSold() {
        this.status = ListingStatus.SOLD;
        this.updatedAt = Instant.now();
    }

    public void remove() {
        this.status = ListingStatus.REMOVED;
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getSellerId() {
        return sellerId;
    }

    public UUID getDeviceModelId() {
        return deviceModelId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public ConditionGrade getConditionGrade() {
        return conditionGrade;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getCurrency() {
        return currency;
    }

    public String getLocation() {
        return location;
    }

    public ListingStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
