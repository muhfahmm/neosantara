-- SECTION: json\\semua_fitur_negara\\1_pembangunan\\2_tempat_umum\\1_Layanan Publik\\6_komersial\\metadata_komersial.pg.sql
CREATE TABLE IF NOT EXISTS database_building_metadata (
source_file VARCHAR(500) NOT NULL,
file_order INT NOT NULL,
entry_key VARCHAR(200) NOT NULL,
entry_order INT NOT NULL,
metadata JSONB NOT NULL,
PRIMARY KEY (source_file, entry_key)
);
INSERT INTO database_building_metadata (source_file, file_order, entry_key, entry_order, metadata) VALUES
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/6_komersial/metadata_komersial.pg.sql', 13, 'mall', 1, '{"key":"23_pusat_belanja","dataKey":"mall","label":"Pusat Perbelanjaan / Mall","produksi":15,"pendapatan":15,"satuan":"NEO","deskripsi":"Pusat Perbelanjaan & Mall Nasional","waktu_pembangunan":50,"biaya_pembangunan":48750,"konsumsi_listrik":0.015,"efek":"Meningkatkan kas negara"}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/6_komersial/metadata_komersial.pg.sql', 13, 'pusat_belanja', 2, '{"key":"23_pusat_belanja","dataKey":"pusat_belanja","label":"Pusat Perbelanjaan / Mall","produksi":15,"pendapatan":15,"satuan":"NEO","deskripsi":"Pusat Perbelanjaan & Mall Nasional","waktu_pembangunan":50,"biaya_pembangunan":48750,"konsumsi_listrik":0.015,"efek":"Meningkatkan kas negara"}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/6_komersial/metadata_komersial.pg.sql', 13, 'hotel', 3, '{"key":"24_hotel","dataKey":"hotel","label":"Hotel & Resort","produksi":10,"pendapatan":10,"satuan":"NEO","deskripsi":"Kompleks Hotel & Resort Internasional","waktu_pembangunan":35,"biaya_pembangunan":63750,"konsumsi_listrik":0.012,"efek":"Meningkatkan kas negara"}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/6_komersial/metadata_komersial.pg.sql', 13, 'pusat_grosir_tekstil', 4, '{"key":"25_pusat_grosir_tekstil","dataKey":"pusat_grosir_tekstil","label":"Pusat Grosir","produksi":15,"pendapatan":15,"satuan":"NEO","deskripsi":"Pusat Perdagangan & Logistik Tekstil","waktu_pembangunan":30,"biaya_pembangunan":26250,"konsumsi_listrik":0.01,"efek":"Meningkatkan kas negara"}'::jsonb);
