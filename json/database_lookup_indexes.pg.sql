CREATE INDEX IF NOT EXISTS idx_database_pajak_negara_country_lower
ON database_pajak_negara (LOWER(country));
CREATE INDEX IF NOT EXISTS idx_database_pajak_negara_country_slug_lower
ON database_pajak_negara (LOWER(country_slug));

CREATE INDEX IF NOT EXISTS idx_database_doktrin_keterbukaan_country_lower
ON database_doktrin_keterbukaan (LOWER(country));
CREATE INDEX IF NOT EXISTS idx_database_doktrin_keterbukaan_name_en_lower
ON database_doktrin_keterbukaan (LOWER(name_en));

CREATE INDEX IF NOT EXISTS idx_database_sda_country_lower
ON database_sda (LOWER(country));
CREATE INDEX IF NOT EXISTS idx_database_sda_country_slug_lower
ON database_sda (LOWER(country_slug));
CREATE INDEX IF NOT EXISTS idx_database_sda_country_slug_normalized
ON database_sda (REPLACE(LOWER(country_slug), '_', ' '));

CREATE INDEX IF NOT EXISTS idx_database_harga_barang_country_lower
ON database_harga_barang (LOWER(country));
CREATE INDEX IF NOT EXISTS idx_database_harga_barang_country_slug_lower
ON database_harga_barang (LOWER(country_slug));
CREATE INDEX IF NOT EXISTS idx_database_harga_barang_country_slug_normalized
ON database_harga_barang (REPLACE(LOWER(country_slug), '_', ' '));
