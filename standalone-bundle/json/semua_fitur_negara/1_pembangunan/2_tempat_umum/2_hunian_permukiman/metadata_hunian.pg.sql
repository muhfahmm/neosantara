-- SECTION: json\\semua_fitur_negara\\1_pembangunan\\2_tempat_umum\\2_hunian_permukiman\\metadata_hunian.pg.sql
CREATE TABLE IF NOT EXISTS database_building_metadata (
source_file VARCHAR(500) NOT NULL,
file_order INT NOT NULL,
entry_key VARCHAR(200) NOT NULL,
entry_order INT NOT NULL,
metadata JSONB NOT NULL,
PRIMARY KEY (source_file, entry_key)
);
INSERT INTO database_building_metadata (source_file, file_order, entry_key, entry_order, metadata) VALUES
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/2_hunian_permukiman/metadata_hunian.pg.sql', 14, 'rumah_subsidi', 1, '{"biaya_pembangunan":500,"waktu_pembangunan":4,"konsumsi_listrik":0.0009,"kapasitas":5,"label":"Perumahan Subsidi Rakyat","deskripsi":"Hunian Terpadu Masyarakat Terjangkau"}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/2_hunian_permukiman/metadata_hunian.pg.sql', 14, 'apartemen', 2, '{"biaya_pembangunan":2500,"waktu_pembangunan":7,"konsumsi_listrik":0.0022,"kapasitas":6000,"label":"Apartemen Modern & High-Rise","deskripsi":"Hunian Vertikal Kepadatan Tinggi"}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/2_hunian_permukiman/metadata_hunian.pg.sql', 14, 'mansion', 3, '{"biaya_pembangunan":5000,"waktu_pembangunan":14,"konsumsi_listrik":0.0055,"kapasitas":10,"label":"Kompleks Mansion Mewah","deskripsi":"Hunian Eksklusif Kelas Atas"}'::jsonb);
