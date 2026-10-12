package com.auctiva.backend.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateDeviceModelRequest(
        @NotNull UUID brandId,
        @NotBlank String name,
        String variant,
        Integer releaseYear
) {
}
