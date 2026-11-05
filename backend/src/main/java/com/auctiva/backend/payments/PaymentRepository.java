package com.auctiva.backend.payments;

import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByUserIdAndIdempotencyKey(UUID userId, String idempotencyKey);

    Optional<Payment> findByCheckoutRequestId(String checkoutRequestId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Payment p where p.checkoutRequestId = :checkoutRequestId")
    Optional<Payment> findByCheckoutRequestIdForUpdate(@Param("checkoutRequestId") String checkoutRequestId);
}
