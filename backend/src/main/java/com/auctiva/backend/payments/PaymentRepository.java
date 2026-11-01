package com.auctiva.backend.payments;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByUserIdAndIdempotencyKey(UUID userId, String idempotencyKey);

    Optional<Payment> findByCheckoutRequestId(String checkoutRequestId);
}
