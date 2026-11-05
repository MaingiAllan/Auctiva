ALTER TABLE listings
    ADD CONSTRAINT chk_listings_reservation_consistency
    CHECK ((status = 'RESERVED' AND reserved_order_id IS NOT NULL)
        OR (status <> 'RESERVED' AND reserved_order_id IS NULL));

CREATE UNIQUE INDEX idx_listings_reserved_order ON listings (reserved_order_id)
    WHERE reserved_order_id IS NOT NULL;
