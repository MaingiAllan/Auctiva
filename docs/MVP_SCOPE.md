# MVP Scope

Distilled from the master project prompt. Single job: prove that smartphone buying,
selling, auctioning, and trade-in can be done *safely and transparently* in Kenya.

## In scope

- **Category**: smartphones only (new, used, refurbished, certified pre-owned).
- **Commerce modes**: fixed-price listings + standard English auctions (anti-sniping,
  no reserve/proxy/sealed bids yet).
- **Verification**: IMEI/serial OCR + blacklist screening, partner-based inspection
  (2–3 partners, not a proprietary inspection network).
- **Trust**: buyer/seller/device/listing trust scores, verified reviews.
- **Payments**: M-PESA + cards, subject to legal review before any escrow/custodial claim.
- **Fraud**: rule-based 0–100 risk score, human review above threshold — no ML fraud yet.
- **AI**: OCR + brand/model detection + damage flagging only, always labeled as an
  estimate; a technician makes final calls.
- **Pricing**: manually curated grids + internal transaction data — no ML pricing until
  ≥10k completed transactions / 12 months of data.
- **Logistics**: existing courier partners, not a proprietary fleet.
- **Liquidity**: a seeded-supply plan (~500–1,000 devices) before public buyer marketing.

## Explicitly out of MVP

- Laptops, tablets, and all other electronics categories (Phase 1.5+).
- Reserve prices, proxy bidding, buy-now-plus-auction, sealed bids, live/flash auctions.
- Proprietary inspection centers.
- ML-based fraud, pricing, or personalized recommendations.
- Multi-currency / multi-country support.
- Microservices — this stays a modular monolith until scale genuinely justifies a split.

## Target for closed beta (Phase 3)

~100 initial users, a controlled seller group, seeded inventory, one geographic area,
manual operational support. See `ROADMAP.md` for the full phase sequence.
