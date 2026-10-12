package com.auctiva.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Auctiva backend — a modular monolith.
 *
 * Each business capability lives in its own top-level package under
 * {@code com.auctiva.backend} (identity, users, catalog, listings, auctions, orders,
 * payments, escrow, ledger, logistics, inspections, tradeins, disputes, reviews, fraud,
 * notifications, admin) with {@code common} holding shared config, security, and the
 * event-outbox infrastructure. See /docs/ARCHITECTURE.md at the repo root for the
 * module-boundary rules.
 */
@SpringBootApplication
public class AuctivaBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuctivaBackendApplication.class, args);
    }
}
