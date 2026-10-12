package com.auctiva.backend.listings.dto;

import com.auctiva.backend.listings.ConditionGrade;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateListingRequest(
        @NotNull UUID deviceModelId,
        @NotBlank String title,
        String description,
        @NotNull ConditionGrade conditionGrade,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal price,
        String currency,
        String location,
        String imei1,
        String imei2,
        String serialNumber
) {
}
