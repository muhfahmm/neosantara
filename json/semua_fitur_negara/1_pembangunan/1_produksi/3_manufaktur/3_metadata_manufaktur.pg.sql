-- SECTION: json\\semua_fitur_negara\\1_pembangunan\\1_produksi\\3_manufaktur\\3_metadata_manufaktur.pg.sql
CREATE TABLE IF NOT EXISTS database_building_metadata (
source_file VARCHAR(500) NOT NULL,
file_order INT NOT NULL,
entry_key VARCHAR(200) NOT NULL,
entry_order INT NOT NULL,
metadata JSONB NOT NULL,
PRIMARY KEY (source_file, entry_key)
);
INSERT INTO database_building_metadata (source_file, file_order, entry_key, entry_order, metadata) VALUES
('json/semua_fitur_negara/1_pembangunan/1_produksi/3_manufaktur/3_metadata_manufaktur.pg.sql', 3, 'pabrik_semikonduktor', 1, '{"key":"1_pabrik_elektronik","dataKey":"pabrik_semikonduktor","label":"Pabrik Semikonduktor","deskripsi":"Memproduksi chip semikonduktor & komponen kontrol canggih untuk alutsista militer (radar, drone, rudal, jet)","produksi":50,"satuan":"UNIT","waktu_pembangunan":360,"biaya_pembangunan":9500,"konsumsi_listrik":0.025}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/3_manufaktur/3_metadata_manufaktur.pg.sql', 3, 'pabrik_mesin', 2, '{"key":"2_pabrik_mesin","dataKey":"pabrik_mesin","label":"Pabrik Mesin","deskripsi":"Memproduksi mesin untuk kebutuhan industri dan kendaraan.","produksi":50,"satuan":"UNIT","waktu_pembangunan":120,"biaya_pembangunan":5000,"konsumsi_listrik":0.015}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/3_manufaktur/3_metadata_manufaktur.pg.sql', 3, 'pabrik_besi', 3, '{"key":"4_pabrik_besi","dataKey":"pabrik_besi","label":"Pabrik Besi","deskripsi":"Mengolah bijih besi menjadi besi untuk kebutuhan pembangunan dan industri.","produksi":50,"satuan":"UNIT","waktu_pembangunan":120,"biaya_pembangunan":5000,"konsumsi_listrik":0.015}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/3_manufaktur/3_metadata_manufaktur.pg.sql', 3, 'semen_beton', 4, '{"key":"5_pabrik_semen","dataKey":"semen_beton","label":"Pabrik Beton & Semen","deskripsi":"Pabrik Beton & Semen","produksi":100,"satuan":"TON","waktu_pembangunan":90,"biaya_pembangunan":2800,"konsumsi_listrik":0.01}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/3_manufaktur/3_metadata_manufaktur.pg.sql', 3, 'kayu', 5, '{"key":"6_penggergajian_kayu","dataKey":"kayu","label":"Penggergajian Kayu","deskripsi":"Penggergajian Kayu","produksi":300,"satuan":"M3","waktu_pembangunan":60,"biaya_pembangunan":1500,"konsumsi_listrik":0.0075}'::jsonb);
