package com.auctiva.backend.catalog.dto;

import com.auctiva.backend.catalog.Brand;
import java.util.UUID;

public record BrandResponse(UUID id, String name) {

    public static BrandResponse from(Brand brand) {
        return new BrandResponse(brand.getId(), brand.getName());
    }
}
