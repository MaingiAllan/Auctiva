CREATE TABLE listings (
    id              UUID PRIMARY KEY,
    seller_id       UUID NOT NULL REFERENCES users(id),
    device_model_id UUID NOT NULL REFERENCES device_models(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    condition_grade VARCHAR(16)  NOT NULL,
    price           NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    currency        VARCHAR(3)   NOT NULL DEFAULT 'KES',
    location        VARCHAR(255),
    imei_1          VARCHAR(32),
    imei_2          VARCHAR(32),
    serial_number   VARCHAR(64),
    status          VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_status ON listings (status);
CREATE INDEX idx_listings_device_model ON listings (device_model_id);
CREATE INDEX idx_listings_seller ON listings (seller_id);
