package com.auctiva.backend.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * Canonical brand/model reference data used for listing autocomplete and future
 * AI brand/model detection — not a specific physical device (that's a `listings`/future
 * `devices` concern, with its own IMEI, condition, etc.).
 */
@Entity
@Table(name = "device_models")
public class DeviceModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // EAGER is deliberate: Brand is tiny reference data, and every DeviceModel response
    // (catalog AND listings, which resolves this via CatalogService) needs brand.name.
    // LAZY here would proxy the association and risk LazyInitializationException once
    // accessed outside the loading transaction (e.g. from another module's DTO mapping).
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(nullable = false)
    private String name;

    private String variant;

    @Column(name = "release_year")
    private Integer releaseYear;

    // Constrained to "SMARTPHONE" at the DB level (see V3 migration) per the MVP's
    // smartphone-only scope. Do not widen this without updating that CHECK constraint.
    @Column(nullable = false)
    private String category = "SMARTPHONE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected DeviceModel() {
        // JPA
    }

    public DeviceModel(Brand brand, String name, String variant, Integer releaseYear) {
        this.brand = brand;
        this.name = name;
        this.variant = variant;
        this.releaseYear = releaseYear;
    }

    public UUID getId() {
        return id;
    }

    public Brand getBrand() {
        return brand;
    }

    public String getName() {
        return name;
    }

    public String getVariant() {
        return variant;
    }

    public Integer getReleaseYear() {
        return releaseYear;
    }

    public String getCategory() {
        return category;
    }
}
