package com.auctiva.backend.payments.dto;

import com.auctiva.backend.orders.dto.OrderResponse;

public record CheckoutResponse(OrderResponse order, PaymentResponse payment) {
}
