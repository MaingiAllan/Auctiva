INSERT INTO brands (id, name) VALUES
    ('a0000000-0000-4000-8000-000000000001', 'Apple'),
    ('a0000000-0000-4000-8000-000000000002', 'Tecno'),
    ('a0000000-0000-4000-8000-000000000003', 'Infinix'),
    ('a0000000-0000-4000-8000-000000000004', 'Xiaomi')
ON CONFLICT (name) DO NOTHING;

INSERT INTO device_models (id, brand_id, name, variant, release_year, category)
SELECT models.id, brands.id, models.name, models.variant, models.release_year, 'SMARTPHONE'
FROM (VALUES
    ('a5000000-0000-4000-8000-000000000001'::UUID, 'Samsung', 'Galaxy A15', '128GB', 2024),
    ('a5000000-0000-4000-8000-000000000002'::UUID, 'Samsung', 'Galaxy A55', '256GB', 2024),
    ('a5000000-0000-4000-8000-000000000003'::UUID, 'Samsung', 'Galaxy S23', '128GB', 2023),
    ('a5000000-0000-4000-8000-000000000004'::UUID, 'Apple', 'iPhone 13', '128GB', 2021),
    ('a5000000-0000-4000-8000-000000000005'::UUID, 'Apple', 'iPhone 14', '128GB', 2022),
    ('a5000000-0000-4000-8000-000000000006'::UUID, 'Apple', 'iPhone 15', '128GB', 2023),
    ('a5000000-0000-4000-8000-000000000007'::UUID, 'Tecno', 'Spark 20', '128GB', 2023),
    ('a5000000-0000-4000-8000-000000000008'::UUID, 'Tecno', 'Camon 30', '256GB', 2024),
    ('a5000000-0000-4000-8000-000000000009'::UUID, 'Infinix', 'Hot 40', '128GB', 2023),
    ('a5000000-0000-4000-8000-000000000010'::UUID, 'Infinix', 'Note 40', '256GB', 2024),
    ('a5000000-0000-4000-8000-000000000011'::UUID, 'Xiaomi', 'Redmi Note 13', '256GB', 2024)
) AS models(id, brand_name, name, variant, release_year)
JOIN brands ON brands.name = models.brand_name
ON CONFLICT (brand_id, name, variant) DO NOTHING;