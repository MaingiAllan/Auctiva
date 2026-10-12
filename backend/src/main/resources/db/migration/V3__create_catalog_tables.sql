CREATE TABLE brands (
    id         UUID PRIMARY KEY,
    name       VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- category is constrained to SMARTPHONE for now per docs/MVP_SCOPE.md. Widen this
-- CHECK (and add the corresponding Category values) only when Phase 1.5 is approved.
CREATE TABLE device_models (
    id           UUID PRIMARY KEY,
    brand_id     UUID NOT NULL REFERENCES brands(id),
    name         VARCHAR(255) NOT NULL,
    variant      VARCHAR(255),
    release_year INTEGER,
    category     VARCHAR(32) NOT NULL DEFAULT 'SMARTPHONE' CHECK (category = 'SMARTPHONE'),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (brand_id, name, variant)
);

CREATE INDEX idx_device_models_brand ON device_models (brand_id);
