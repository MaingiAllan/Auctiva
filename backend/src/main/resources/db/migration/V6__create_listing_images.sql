CREATE TABLE listing_images (
    id           UUID PRIMARY KEY,
    listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    storage_key  VARCHAR(255) NOT NULL UNIQUE,
    content_type VARCHAR(64) NOT NULL,
    sort_order   INTEGER NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (listing_id, sort_order)
);

CREATE INDEX idx_listing_images_listing ON listing_images (listing_id, sort_order);