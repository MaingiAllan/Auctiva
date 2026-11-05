package com.auctiva.backend.orders;

import com.auctiva.backend.listings.Listing;
import com.auctiva.backend.listings.ListingService;
import java.util.NoSuchElementException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {

    private final OrderRepository orders;
    private final ListingService listings;

    public OrderService(OrderRepository orders, ListingService listings) {
        this.orders = orders;
        this.listings = listings;
    }

    @Transactional
    public Order createPendingOrder(UUID buyerId, UUID listingId, String idempotencyKey) {
        var existing = orders.findByBuyerIdAndIdempotencyKey(buyerId, idempotencyKey);
        if (existing.isPresent()) {
            Order order = existing.get();
            if (!order.getListingId().equals(listingId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "This idempotency key was already used for another item");
            }
            if (order.getStatus() == OrderStatus.CANCELLED) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "This checkout was cancelled; start a new checkout");
            }
            return order;
        }

        Listing listing = listings.getAvailableListingForPurchase(listingId, buyerId);
        Order order = new Order(buyerId, listing.getSellerId(), listing.getId(), listing.getPrice(),
                listing.getCurrency(), idempotencyKey);
        try {
            order = orders.saveAndFlush(order);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This checkout request was already used; retry with a new key", ex);
        }
        listings.reserveForOrder(listingId, order.getId());
        return order;
    }

    public Order getOrderOrThrow(UUID id) {
        return orders.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Order not found: " + id));
    }

    public Optional<Order> findPendingForBuyer(UUID buyerId, UUID listingId) {
        return orders.findFirstByBuyerIdAndListingIdAndStatusInOrderByCreatedAtDesc(
                buyerId, listingId, List.of(OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_REVIEW));
    }

    @Transactional
    public Order markPaid(UUID id) {
        Order order = orders.findByIdForUpdate(id)
                .orElseThrow(() -> new NoSuchElementException("Order not found: " + id));
        if (order.getStatus() == OrderStatus.PAID) {
            return order;
        }
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalStateException("Only a pending order can be marked paid");
        }
        listings.completeOrderReservation(order.getListingId(), order.getId());
        order.markPaid();
        return order;
    }

    @Transactional
    public void cancelAfterPaymentFailure(UUID id) {
        Order order = orders.findByIdForUpdate(id)
                .orElseThrow(() -> new NoSuchElementException("Order not found: " + id));
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            return;
        }
        listings.releaseOrderReservation(order.getListingId(), order.getId());
        order.cancel();
    }

    @Transactional
    public void markPaymentReview(UUID id) {
        Order order = orders.findByIdForUpdate(id)
                .orElseThrow(() -> new NoSuchElementException("Order not found: " + id));
        if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
            order.requirePaymentReview();
        }
    }
}
