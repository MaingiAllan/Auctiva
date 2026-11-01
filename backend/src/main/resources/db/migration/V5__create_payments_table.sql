CREATE TABLE payments (
    id                  UUID PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES users(id),
    listing_id          UUID NOT NULL REFERENCES listings(id),
    amount              NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency            VARCHAR(3)  NOT NULL DEFAULT 'KES',
    method              VARCHAR(16) NOT NULL,
    status              VARCHAR(16) NOT NULL,
    phone               VARCHAR(15),
    idempotency_key     VARCHAR(64) NOT NULL,
    merchant_request_id VARCHAR(64),
    checkout_request_id VARCHAR(64) UNIQUE,
    mpesa_receipt       VARCHAR(32) UNIQUE,
    result_code         INTEGER,
    result_desc         VARCHAR(255),
    callback_payload    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, idempotency_key)
);
CREATE INDEX idx_payments_user ON payments (user_id);
CREATE INDEX idx_payments_listing ON payments (listing_id);
