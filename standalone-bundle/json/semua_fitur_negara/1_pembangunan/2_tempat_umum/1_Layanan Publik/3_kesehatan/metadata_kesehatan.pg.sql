-- SECTION: json\\semua_fitur_negara\\1_pembangunan\\2_tempat_umum\\1_Layanan Publik\\3_kesehatan\\metadata_kesehatan.pg.sql
CREATE TABLE IF NOT EXISTS database_building_metadata (
source_file VARCHAR(500) NOT NULL,
file_order INT NOT NULL,
entry_key VARCHAR(200) NOT NULL,
entry_order INT NOT NULL,
metadata JSONB NOT NULL,
PRIMARY KEY (source_file, entry_key)
);
INSERT INTO database_building_metadata (source_file, file_order, entry_key, entry_order, metadata) VALUES
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/3_kesehatan/metadata_kesehatan.pg.sql', 10, 'rumah_sakit_besar', 1, '{"key":"11_rumah_sakit_besar","dataKey":"rumah_sakit_besar","label":"Rumah Sakit Umum","produksi":1,"satuan":"Unit","deskripsi":"Rumah Sakit Umum Pusat (RSUP)","waktu_pembangunan":45,"biaya_pembangunan":82500,"konsumsi_listrik":0.012,"efek":"Mengurangi jumlah kematian akibat pandemi dan epidemi sebesar 0.05%"}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/3_kesehatan/metadata_kesehatan.pg.sql', 10, 'rumah_sakit_kecil', 2, '{"key":"12_rumah_sakit_kecil","dataKey":"rumah_sakit_kecil","label":"Rumah Sakit Daerah","produksi":1,"satuan":"Unit","deskripsi":"Rumah Sakit Daerah (RSUD)","waktu_pembangunan":30,"biaya_pembangunan":33750,"konsumsi_listrik":0.0075,"efek":"Mengurangi jumlah kematian akibat pandemi dan epidemi sebesar 0.03%"}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/3_kesehatan/metadata_kesehatan.pg.sql', 10, 'pusat_diagnostik', 3, '{"key":"13_pusat_diagnostik","dataKey":"pusat_diagnostik","label":"Laboratorium Medik & Diagnostik Nasional","produksi":1,"satuan":"Unit","deskripsi":"Laboratorium Medik & Diagnostik Nasional","waktu_pembangunan":15,"biaya_pembangunan":18750,"konsumsi_listrik":0.004,"efek":"Mengurangi jumlah kematian akibat pandemi dan epidemi sebesar 0.01%"}'::jsonb);
