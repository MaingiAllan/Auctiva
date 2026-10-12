package com.auctiva.backend.catalog.dto;

import com.auctiva.backend.catalog.DeviceModel;
import java.util.UUID;

/**
 * The read-only view other modules (e.g. listings) are allowed to depend on. Modules
 * outside `catalog` should never import {@link DeviceModel} or its repository directly
 * — go through {@code CatalogService.findSummary(...)} instead.
 */
public record DeviceModelSummary(UUID id, String brandName, String name, String variant, Integer releaseYear) {

    public static DeviceModelSummary from(DeviceModel model) {
        return new DeviceModelSummary(
                model.getId(),
                model.getBrand().getName(),
                model.getName(),
                model.getVariant(),
                model.getReleaseYear()
        );
    }
}
