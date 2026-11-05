ALTER TABLE device_models
    DROP CONSTRAINT device_models_category_check;

ALTER TABLE device_models
    DROP CONSTRAINT device_models_brand_id_name_variant_key;

ALTER TABLE device_models
    ADD CONSTRAINT uq_device_model_brand_name_variant_category
    UNIQUE (brand_id, name, variant, category);

ALTER TABLE listings
    ADD COLUMN listing_type VARCHAR(24) NOT NULL DEFAULT 'FAIRLY_USED',
    ALTER COLUMN condition_grade DROP NOT NULL;

UPDATE listings
SET listing_type = 'PARTS_ONLY'
WHERE condition_grade = 'PARTS_ONLY';

ALTER TABLE listings
    ADD CONSTRAINT chk_listing_type_condition_grade CHECK (
        (listing_type = 'BRAND_NEW' AND condition_grade IS NULL)
        OR (listing_type = 'PARTS_ONLY' AND condition_grade = 'PARTS_ONLY')
        OR (listing_type IN ('REFURBISHED', 'FAIRLY_USED')
            AND condition_grade IN ('A_PLUS', 'A', 'B_PLUS', 'B', 'C', 'D'))
    );

INSERT INTO brands (id, name)
SELECT gen_random_uuid(), brand_name
FROM (VALUES
    ('Samsung'), ('Itel'), ('Oppo'), ('Vivo'), ('Huawei'), ('Nokia'),
    ('Dell'), ('HP'), ('Lenovo'), ('Asus'), ('Acer'), ('Microsoft'), ('MSI'),
    ('Amazon'), ('Amazfit'), ('Fitbit'), ('Garmin'),
    ('JBL'), ('Sony'), ('Bose'), ('Anker'), ('Marshall'), ('Baseus'), ('Oraimo'), ('Romoss')
) AS new_brands(brand_name)
ON CONFLICT (name) DO NOTHING;

INSERT INTO device_models (id, brand_id, name, variant, category)
SELECT gen_random_uuid(), brands.id, 'Other', 'Other',
       category_brands.category
FROM (VALUES
    ('SMARTPHONE', 'Apple'), ('SMARTPHONE', 'Samsung'), ('SMARTPHONE', 'Tecno'),
    ('SMARTPHONE', 'Infinix'), ('SMARTPHONE', 'Itel'), ('SMARTPHONE', 'Xiaomi'),
    ('SMARTPHONE', 'Oppo'), ('SMARTPHONE', 'Vivo'), ('SMARTPHONE', 'Huawei'),
    ('SMARTPHONE', 'Nokia'),
    ('LAPTOP', 'Apple'), ('LAPTOP', 'Dell'), ('LAPTOP', 'HP'), ('LAPTOP', 'Lenovo'),
    ('LAPTOP', 'Asus'), ('LAPTOP', 'Acer'), ('LAPTOP', 'Microsoft'), ('LAPTOP', 'MSI'),
    ('TABLET', 'Apple'), ('TABLET', 'Samsung'), ('TABLET', 'Lenovo'), ('TABLET', 'Huawei'),
    ('TABLET', 'Amazon'), ('TABLET', 'Xiaomi'),
    ('WATCH', 'Apple'), ('WATCH', 'Samsung'), ('WATCH', 'Huawei'), ('WATCH', 'Amazfit'),
    ('WATCH', 'Fitbit'), ('WATCH', 'Garmin'),
    ('BLUETOOTH_SPEAKER', 'JBL'), ('BLUETOOTH_SPEAKER', 'Sony'), ('BLUETOOTH_SPEAKER', 'Bose'),
    ('BLUETOOTH_SPEAKER', 'Anker'), ('BLUETOOTH_SPEAKER', 'Marshall'),
    ('POWERBANK', 'Anker'), ('POWERBANK', 'Baseus'), ('POWERBANK', 'Oraimo'),
    ('POWERBANK', 'Xiaomi'), ('POWERBANK', 'Romoss')
) AS category_brands(category, brand_name)
JOIN brands ON brands.name = category_brands.brand_name
ON CONFLICT (brand_id, name, variant, category) DO NOTHING;
