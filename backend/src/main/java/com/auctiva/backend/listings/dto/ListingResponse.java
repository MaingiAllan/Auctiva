package com.auctiva.backend.listings.dto;

import com.auctiva.backend.catalog.dto.DeviceModelSummary;
import com.auctiva.backend.listings.ConditionGrade;
import com.auctiva.backend.listings.Listing;
import com.auctiva.backend.listings.ListingStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ListingResponse(
        UUID id,
        UUID sellerId,
        DeviceModelSummary deviceModel,
        String title,
        String description,
        ConditionGrade conditionGrade,
        BigDecimal price,
        String currency,
        String location,
        ListingStatus status,
        Instant createdAt
) {

    public static ListingResponse from(Listing listing, DeviceModelSummary deviceModel) {
        return new ListingResponse(
                listing.getId(),
                listing.getSellerId(),
                deviceModel,
                listing.getTitle(),
                listing.getDescription(),
                listing.getConditionGrade(),
                listing.getPrice(),
                listing.getCurrency(),
                listing.getLocation(),
                listing.getStatus(),
                listing.getCreatedAt()
        );
    }
}
