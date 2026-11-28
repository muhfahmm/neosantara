-- SECTION: json\\semua_fitur_negara\\1_pembangunan\\2_tempat_umum\\1_Layanan Publik\\5_olahraga\\metadata_olahraga.pg.sql
CREATE TABLE IF NOT EXISTS database_building_metadata (
source_file VARCHAR(500) NOT NULL,
file_order INT NOT NULL,
entry_key VARCHAR(200) NOT NULL,
entry_order INT NOT NULL,
metadata JSONB NOT NULL,
PRIMARY KEY (source_file, entry_key)
);
INSERT INTO database_building_metadata (source_file, file_order, entry_key, entry_order, metadata) VALUES
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/5_olahraga/metadata_olahraga.pg.sql', 12, 'kolam_renang', 1, '{"key":"16_kolam_renang","dataKey":"kolam_renang","label":"Kolam Renang","produksi":1,"satuan":"Unit","deskripsi":"Pusat Akuatik Nasional","waktu_pembangunan":7,"biaya_pembangunan":9000,"konsumsi_listrik":0.0045,"efek":"Meningkatkan kas negara"}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/5_olahraga/metadata_olahraga.pg.sql', 12, 'sirkuit_balap', 2, '{"key":"17_sirkuit_balap","dataKey":"sirkuit_balap","label":"Sirkuit Balap","produksi":1,"satuan":"Unit","deskripsi":"Sirkuit Balap Internasional","waktu_pembangunan":40,"biaya_pembangunan":71250,"konsumsi_listrik":0.0095,"efek":"Meningkatkan kas negara"}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/5_olahraga/metadata_olahraga.pg.sql', 12, 'stadium_int', 3, '{"key":"18_stadium_int","dataKey":"stadium_int","label":"Stadion (Nas/Int)","produksi":1,"satuan":"Unit","deskripsi":"Stadion Utama Internasional","waktu_pembangunan":60,"biaya_pembangunan":97500,"konsumsi_listrik":0.012,"efek":"Meningkatkan kas negara"}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/5_olahraga/metadata_olahraga.pg.sql', 12, 'gym_center', 4, '{"key":"19_gym_center","dataKey":"gym_center","label":"Pusat Kebugaran","produksi":1,"satuan":"Unit","deskripsi":"Pusat Kebugaran & Olahraga Terpadu","waktu_pembangunan":15,"biaya_pembangunan":18750,"konsumsi_listrik":0.0035,"efek":"Meningkatkan kas negara"}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/5_olahraga/metadata_olahraga.pg.sql', 12, 'lapangan_golf', 5, '{"key":"20_lapangan_golf","dataKey":"lapangan_golf","label":"Lapangan Golf","produksi":1,"satuan":"Unit","deskripsi":"Fasilitas Golf Nasional","waktu_pembangunan":25,"biaya_pembangunan":41250,"konsumsi_listrik":0.0075,"efek":"Meningkatkan kas negara"}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/5_olahraga/metadata_olahraga.pg.sql', 12, 'esports_arena', 6, '{"key":"21_esports_arena","dataKey":"esports_arena","label":"Arena E-Sports","produksi":1,"satuan":"Unit","deskripsi":"Arena E-Sports Global","waktu_pembangunan":30,"biaya_pembangunan":56250,"konsumsi_listrik":0.01,"efek":"Meningkatkan kas negara"}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/5_olahraga/metadata_olahraga.pg.sql', 12, 'gokart_circuit', 7, '{"key":"22_gokart_circuit","dataKey":"gokart_circuit","label":"Sirkuit Gokart","produksi":1,"satuan":"Unit","deskripsi":"Sirkuit Gokart Profesional","waktu_pembangunan":10,"biaya_pembangunan":13500,"konsumsi_listrik":0.006,"efek":"Meningkatkan kas negara"}'::jsonb);
