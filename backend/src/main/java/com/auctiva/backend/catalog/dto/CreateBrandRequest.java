package com.auctiva.backend.catalog.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateBrandRequest(@NotBlank String name) {
}
