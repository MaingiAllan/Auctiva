# Architecture Overview

## Style: modular monolith

One Spring Boot deployable. Each business capability is a Java package under
`com.auctiva.backend.<module>` with:

- its own package-private internals (repositories, entities),
- a small public surface (services/DTOs other modules are allowed to call),
- no direct database access into another module's tables,
- domain events for anything another module needs to react to (outbox pattern, not
  direct method calls across module boundaries where consistency isn't required).

Modules scaffolded so far (empty — logic comes later, in the order in `ROADMAP.md`):

`common` (shared config/security/event-outbox), `identity`, `users`, `businesses`,
`catalog`, `listings`, `search`, `auctions`, `orders`, `payments`, `escrow`, `ledger`,
`logistics`, `inspections`, `tradeins`, `disputes`, `reviews`, `fraud`, `notifications`,
`admin`.

## Source of truth rules

- **PostgreSQL** is the source of truth for auctions, orders, payments, escrow, and the
  ledger. Never Redis, WebSocket state, or Kafka ordering.
- **Redis** is cache/coordination only: sessions, rate limiting, hot listings, countdown
  display, temporary locks. Nothing financial or auction-authoritative lives there
  permanently.
- **Kafka** carries durable domain events via the outbox pattern, partitioned by
  aggregate id (e.g. `auction_id`) so per-entity ordering holds.
- **OpenSearch** is a read-optimized, eventually-consistent projection. Transactional
  pages (checkout, bidding) always read Postgres directly, never search.

## Auction bid path (the one part worth getting right early)

1. Begin a DB transaction.
2. `SELECT ... FOR UPDATE` the auction row.
3. Validate: auction active, bid ≥ min increment, bidder eligible, idempotency key unseen.
4. Insert bid, update current price/bid count, apply time extension if applicable.
5. Write an outbox event.
6. Commit.
7. Publish the real-time update over WebSocket only after commit succeeds.

## Deployment

Docker Compose for local dev (`infra/docker-compose.yml`): Postgres, Redis, Kafka,
OpenSearch. Kubernetes is deliberately deferred until operational scale justifies it —
see spec section 24.
