-- SECTION: json\\semua_fitur_negara\\1_pembangunan\\1_produksi\\6_sektor_perikanan\\6_metadata_perikanan.pg.sql
CREATE TABLE IF NOT EXISTS database_building_metadata (
source_file VARCHAR(500) NOT NULL,
file_order INT NOT NULL,
entry_key VARCHAR(200) NOT NULL,
entry_order INT NOT NULL,
metadata JSONB NOT NULL,
PRIMARY KEY (source_file, entry_key)
);
INSERT INTO database_building_metadata (source_file, file_order, entry_key, entry_order, metadata) VALUES
('json/semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/6_metadata_perikanan.pg.sql', 6, 'udang', 1, '{"key":"1_tambak_udang","dataKey":"udang","label":"Tambak Udang","deskripsi":"Tambang Udang Intensif","produksi":25,"satuan":"KG","waktu_pembangunan":15,"biaya_pembangunan":2500,"konsumsi_listrik":0.0065}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/6_metadata_perikanan.pg.sql', 6, 'ikan', 2, '{"key":"2_budidaya_ikan_tawar","dataKey":"ikan","label":"Budidaya Ikan","deskripsi":"Budidaya Ikan Air Tawar","produksi":30,"satuan":"KG","waktu_pembangunan":10,"biaya_pembangunan":1500,"konsumsi_listrik":0.0045}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/6_metadata_perikanan.pg.sql', 6, 'mutiara', 3, '{"key":"3_budidaya_mutiara","dataKey":"mutiara","label":"Budidaya Mutiara","deskripsi":"Budidaya Kerang & Mutiara","produksi":15,"satuan":"GRAM","waktu_pembangunan":30,"biaya_pembangunan":4500,"konsumsi_listrik":0.0055}'::jsonb);
