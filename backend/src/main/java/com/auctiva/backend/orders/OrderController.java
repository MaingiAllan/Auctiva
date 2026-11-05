package com.auctiva.backend.orders;

import com.auctiva.backend.identity.UserPrincipal;
import com.auctiva.backend.orders.dto.CreateOrderRequest;
import com.auctiva.backend.orders.dto.OrderResponse;
import com.auctiva.backend.payments.Payment;
import com.auctiva.backend.payments.PaymentService;
import com.auctiva.backend.payments.dto.CheckoutResponse;
import com.auctiva.backend.payments.dto.PaymentResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orders;
    private final PaymentService payments;

    public OrderController(OrderService orders, PaymentService payments) {
        this.orders = orders;
        this.payments = payments;
    }

    @PostMapping
    public ResponseEntity<CheckoutResponse> create(@AuthenticationPrincipal UserPrincipal me,
                                                   @RequestHeader("Idempotency-Key") String key,
                                                   @Valid @RequestBody CreateOrderRequest request) {
        if (key.isBlank() || key.length() > 64) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Idempotency-Key must be 1-64 characters");
        }
        Order order = orders.createPendingOrder(me.getId(), request.listingId(), key);
        Payment payment = payments.startMpesaPayment(me.getId(), order.getId(), request.phone(), key);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new CheckoutResponse(OrderResponse.from(order), PaymentResponse.from(payment)));
    }

    @GetMapping("/{id}")
    public OrderResponse get(@AuthenticationPrincipal UserPrincipal me, @PathVariable UUID id) {
        Order order = orders.getOrderOrThrow(id);
        if (!order.getBuyerId().equals(me.getId())) {
            throw new AccessDeniedException("Not your order");
        }
        return OrderResponse.from(order);
    }

    @GetMapping("/pending")
    public ResponseEntity<OrderResponse> getPending(@AuthenticationPrincipal UserPrincipal me,
                                                     @RequestParam UUID listingId) {
        return orders.findPendingForBuyer(me.getId(), listingId)
                .map(order -> ResponseEntity.ok(OrderResponse.from(order)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
