package com.auctiva.backend.orders.dto;

import com.auctiva.backend.orders.Order;
import com.auctiva.backend.orders.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderResponse(UUID id, UUID listingId, BigDecimal amount, String currency,
                            OrderStatus status, Instant createdAt) {

    public static OrderResponse from(Order order) {
        return new OrderResponse(order.getId(), order.getListingId(), order.getAmount(), order.getCurrency(),
                order.getStatus(), order.getCreatedAt());
    }
}
