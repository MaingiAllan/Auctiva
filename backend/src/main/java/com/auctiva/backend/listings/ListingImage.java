package com.auctiva.backend.listings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "listing_images")
public class ListingImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "listing_id", nullable = false)
    private UUID listingId;

    @Column(name = "storage_key", nullable = false, unique = true)
    private String storageKey;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected ListingImage() {
    }

    public ListingImage(UUID listingId, String storageKey, String contentType, int sortOrder) {
        this.listingId = listingId;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.sortOrder = sortOrder;
    }

    public UUID getId() { return id; }
    public String getStorageKey() { return storageKey; }
    public String getContentType() { return contentType; }
}