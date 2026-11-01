package com.auctiva.backend.payments.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/** The amount is deliberately NOT accepted from the client: it is read from the listing server-side. */
public record StkPushRequest(@NotNull UUID listingId, @NotBlank String phone) {
}
