package com.auctiva.backend.orders.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateOrderRequest(@NotNull UUID listingId, @NotBlank String phone) {
}
