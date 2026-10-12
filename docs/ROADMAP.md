# Roadmap

Condensed from the master spec's Phase 0–11 plan and implementation order. This is the
build sequence, not a feature wishlist — resist adding later-phase items early.

## Phase 0 — Research & validation
Customer/seller/buyer interviews, competitor research, regulatory review, payment- and
inspection-partner validation, seeded-inventory commitments. Exit only once there's a
confirmed problem, partner interest, a supply plan, and a legal risk register.

## Phase 1 — Architecture & design (this scaffold)
Domain model, DB schema, API design, threat model, payment/auction/ledger design, UX
prototypes. *You are here.*

## Phase 2 — MVP build (implementation order)
1. Repo, coding standards, CI/CD, secrets management
2. Auth + authorization
3. User profiles + verification
4. Smartphone catalog / device model data
5. Listing creation + moderation, image upload
6. Search & discovery
7. Seller profiles & trust indicators
8. Checkout & order creation
9. Payment-provider integration (M-PESA) + reconciliation
10. Protected-payment/escrow workflow *(pending legal sign-off)*
11. Logistics & tracking
12. Disputes & returns
13. Notifications & messaging
14. English auction engine + WebSocket bidding
15. Auction recovery / concurrency testing
16. Admin platform + basic fraud rules
17. Inspection-partner workflow
18. Certification & digital device passport
19. Trade-in valuation

## Phase 3 — Closed beta
~100 users, seeded inventory, one geography, manual ops support. Measure: listing
completion, search→purchase conversion, payment success, dispute rate, inspection
turnaround, fraud incidents, unit economics.

## Phase 4+ (only after beta thresholds are met)
4: Kenya launch → 5: trust/verification expansion → 6: trade-in & refurbishment →
7: laptops/tablets → 8: advanced AI & ML pricing → 9: advanced auctions/B2B →
10: African expansion → 11: international expansion.

## Non-negotiables regardless of phase
- No microservices split without a concrete scaling/ownership reason.
- No escrow/wallet claims before Kenyan legal & regulatory confirmation.
- No ML pricing before ≥10k transactions / 12 months of clean data.
- No proprietary inspection network before partner-based inspection is validated.
