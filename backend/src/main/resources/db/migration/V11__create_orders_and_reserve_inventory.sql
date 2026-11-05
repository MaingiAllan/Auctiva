CREATE TABLE orders (
    id              UUID PRIMARY KEY,
    buyer_id        UUID NOT NULL REFERENCES users(id),
    seller_id       UUID NOT NULL REFERENCES users(id),
    listing_id      UUID NOT NULL REFERENCES listings(id),
    amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency        VARCHAR(3) NOT NULL,
    status          VARCHAR(24) NOT NULL,
    idempotency_key VARCHAR(64) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (buyer_id, idempotency_key)
);

CREATE INDEX idx_orders_listing ON orders (listing_id);
CREATE INDEX idx_orders_buyer ON orders (buyer_id);

ALTER TABLE listings
    ADD COLUMN reserved_order_id UUID REFERENCES orders(id);

ALTER TABLE payments
    ADD COLUMN order_id UUID REFERENCES orders(id);

CREATE INDEX idx_payments_order ON payments (order_id);
