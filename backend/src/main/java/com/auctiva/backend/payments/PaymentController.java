package com.auctiva.backend.payments;

import com.auctiva.backend.identity.Role;
import com.auctiva.backend.identity.UserPrincipal;
import com.auctiva.backend.payments.dto.PaymentResponse;
import com.auctiva.backend.payments.dto.StkPushRequest;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @PostMapping("/mpesa/stk-push")
    public ResponseEntity<PaymentResponse> stkPush(@AuthenticationPrincipal UserPrincipal me,
                                                   @RequestHeader("Idempotency-Key") String key,
                                                   @Valid @RequestBody StkPushRequest request) {
        if (key.isBlank() || key.length() > 64) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Idempotency-Key must be 1-64 characters");
        }
        Payment payment = service.startMpesaPayment(me.getId(), request.listingId(), request.phone(), key);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(PaymentResponse.from(payment));
    }

    /** Poll this after the STK push to see whether the customer approved on their phone. */
    @GetMapping("/{id}")
    public PaymentResponse get(@AuthenticationPrincipal UserPrincipal me, @PathVariable UUID id) {
        Payment payment = service.getPayment(id);
        if (!payment.getUserId().equals(me.getId()) && me.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Not your payment");
        }
        return PaymentResponse.from(payment);
    }

    /** Public endpoint called by Safaricom; protected by the secret token in the path. */
    @PostMapping("/mpesa/callback/{token}")
    public Map<String, Object> callback(@PathVariable String token, @RequestBody JsonNode body) {
        if (!service.isValidCallbackToken(token)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
        }
        try {
            service.handleCallback(body);
        } catch (RuntimeException ex) {
            log.error("Failed to process M-Pesa callback", ex);
        }
        return Map.of("ResultCode", 0, "ResultDesc", "Accepted");
    }
}
