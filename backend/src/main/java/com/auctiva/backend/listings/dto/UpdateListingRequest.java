package com.auctiva.backend.listings.dto;

import java.math.BigDecimal;

public record UpdateListingRequest(
        String title,
        String description,
        BigDecimal price,
        String location
) {
}
