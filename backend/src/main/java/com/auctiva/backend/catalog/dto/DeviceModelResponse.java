package com.auctiva.backend.catalog.dto;

import com.auctiva.backend.catalog.DeviceModel;
import java.util.UUID;

public record DeviceModelResponse(
        UUID id,
        UUID brandId,
        String brandName,
        String name,
        String variant,
        Integer releaseYear,
        String category
) {

    public static DeviceModelResponse from(DeviceModel model) {
        return new DeviceModelResponse(
                model.getId(),
                model.getBrand().getId(),
                model.getBrand().getName(),
                model.getName(),
                model.getVariant(),
                model.getReleaseYear(),
                model.getCategory()
        );
    }
}
