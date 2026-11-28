-- SECTION: json\\semua_fitur_negara\\1_pembangunan\\1_produksi\\2_sektor_mineral_kritis\\2_metadata_ekstraksi.pg.sql
CREATE TABLE IF NOT EXISTS database_building_metadata (
source_file VARCHAR(500) NOT NULL,
file_order INT NOT NULL,
entry_key VARCHAR(200) NOT NULL,
entry_order INT NOT NULL,
metadata JSONB NOT NULL,
PRIMARY KEY (source_file, entry_key)
);
INSERT INTO database_building_metadata (source_file, file_order, entry_key, entry_order, metadata) VALUES
('json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/2_metadata_ekstraksi.pg.sql', 2, 'emas', 1, '{"key":"1_tambang_emas","dataKey":"emas","label":"Tambang Emas","deskripsi":"Tambang Emas","produksi":20,"satuan":"KG","waktu_pembangunan":120,"biaya_pembangunan":6000,"konsumsi_listrik":0.0075}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/2_metadata_ekstraksi.pg.sql', 2, 'uranium', 2, '{"key":"2_tambang_uranium","dataKey":"uranium","label":"Tambang Uranium","deskripsi":"Tambang Uranium","produksi":10,"satuan":"KG","waktu_pembangunan":240,"biaya_pembangunan":7500,"konsumsi_listrik":0.0095}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/2_metadata_ekstraksi.pg.sql', 2, 'batu_bara', 3, '{"key":"3_tambang_batu_bara","dataKey":"batu_bara","label":"Tambang Batu Bara","deskripsi":"Tambang Batu Bara","produksi":200,"satuan":"TON","waktu_pembangunan":90,"biaya_pembangunan":1500,"konsumsi_listrik":0.0028}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/2_metadata_ekstraksi.pg.sql', 2, 'minyak_bumi', 4, '{"key":"4_sumur_minyak","dataKey":"minyak_bumi","label":"Sumur Minyak Bumi","deskripsi":"Sumur Minyak Bumi","produksi":20,"satuan":"BARREL","waktu_pembangunan":150,"biaya_pembangunan":4500,"konsumsi_listrik":0.006}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/2_metadata_ekstraksi.pg.sql', 2, 'gas_alam', 5, '{"key":"5_sumur_gas","dataKey":"gas_alam","label":"Sumur Gas Alam","deskripsi":"Sumur Gas Alam","produksi":20,"satuan":"MMSCFD","waktu_pembangunan":120,"biaya_pembangunan":4000,"konsumsi_listrik":0.0055}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/2_metadata_ekstraksi.pg.sql', 2, 'garam', 6, '{"key":"6_tambang_garam","dataKey":"garam","label":"Tambang Garam","deskripsi":"Tambang Garam","produksi":5,"satuan":"TON","waktu_pembangunan":45,"biaya_pembangunan":500,"konsumsi_listrik":0.0012}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/2_metadata_ekstraksi.pg.sql', 2, 'litium', 7, '{"key":"8_tambang_litium","dataKey":"litium","label":"Tambang Litium","deskripsi":"Tambang Litium","produksi":1,"satuan":"TON","waktu_pembangunan":210,"biaya_pembangunan":5500,"konsumsi_listrik":0.007}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/2_metadata_ekstraksi.pg.sql', 2, 'logam_tanah_jarang', 8, '{"key":"11_tambang_ltj","dataKey":"logam_tanah_jarang","label":"Tambang Logam Tanah Jarang","deskripsi":"Tambang Logam Tanah Jarang","produksi":5,"satuan":"KG","waktu_pembangunan":360,"biaya_pembangunan":9000,"konsumsi_listrik":0.012}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/2_metadata_ekstraksi.pg.sql', 2, 'bijih_besi', 9, '{"key":"12_tambang_bijih_besi","dataKey":"bijih_besi","label":"Tambang Bijih Besi","deskripsi":"Tambang Bijih Besi","produksi":10,"satuan":"TON","waktu_pembangunan":90,"biaya_pembangunan":2500,"konsumsi_listrik":0.0038}'::jsonb);
