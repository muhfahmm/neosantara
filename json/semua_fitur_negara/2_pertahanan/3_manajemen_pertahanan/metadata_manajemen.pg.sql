-- SECTION: json\\semua_fitur_negara\\2_pertahanan\\3_manajemen_pertahanan\\metadata_manajemen.pg.sql
CREATE TABLE IF NOT EXISTS database_building_metadata (
source_file VARCHAR(500) NOT NULL,
file_order INT NOT NULL,
entry_key VARCHAR(200) NOT NULL,
entry_order INT NOT NULL,
metadata JSONB NOT NULL,
PRIMARY KEY (source_file, entry_key)
);
INSERT INTO database_building_metadata (source_file, file_order, entry_key, entry_order, metadata) VALUES
('json/semua_fitur_negara/2_pertahanan/3_manajemen_pertahanan/metadata_manajemen.pg.sql', 16, 'barak', 1, '{"key":"1_barak","dataKey":"barak","groupId":"darat","label":"Barak Militer","deskripsi":"Kompleks Hunian & Pelatihan Tentara","biaya_pembangunan":13125,"waktu_pembangunan":15,"kapasitas":10000,"satuan_kapasitas":"Pasukan Infanteri","konsumsi_listrik":0.006}'::jsonb),
('json/semua_fitur_negara/2_pertahanan/3_manajemen_pertahanan/metadata_manajemen.pg.sql', 16, 'gudang_senjata', 2, '{"key":"2_gudang_senjata","dataKey":"gudang_senjata","groupId":"pertahanan","label":"Gudang Senjata","deskripsi":"Penyimpanan Amunisi & Persenjataan","biaya_pembangunan":13125,"waktu_pembangunan":30,"kapasitas":2500,"satuan_kapasitas":"Unit Persenjataan","konsumsi_listrik":0.0045}'::jsonb),
('json/semua_fitur_negara/2_pertahanan/3_manajemen_pertahanan/metadata_manajemen.pg.sql', 16, 'hangar_tank', 3, '{"key":"3_hangar_tank","dataKey":"hangar_tank","groupId":"pertahanan","label":"Hangar Tank","deskripsi":"Garasi Tempur Lapis Baja","biaya_pembangunan":31875,"waktu_pembangunan":30,"kapasitas":3000,"satuan_kapasitas":"Unit Kendaraan Tempur Lapis Baja","konsumsi_listrik":0.0075}'::jsonb),
('json/semua_fitur_negara/2_pertahanan/3_manajemen_pertahanan/metadata_manajemen.pg.sql', 16, 'pangkalan_udara', 4, '{"key":"6_pangkalan_udara","dataKey":"pangkalan_udara","groupId":"pertahanan","label":"Pangkalan Udara","deskripsi":"Fasilitas Dirgantara & Armada Udara","biaya_pembangunan":67500,"waktu_pembangunan":60,"kapasitas":500,"satuan_kapasitas":"Unit Armada Udara","konsumsi_listrik":0.025}'::jsonb),
('json/semua_fitur_negara/2_pertahanan/3_manajemen_pertahanan/metadata_manajemen.pg.sql', 16, 'pangkalan_laut', 5, '{"key":"7_pangkalan_laut","dataKey":"pangkalan_laut","groupId":"pertahanan","label":"Pangkalan Laut","deskripsi":"Fasilitas Maritim & Kapal Perang","biaya_pembangunan":82500,"waktu_pembangunan":120,"kapasitas":50,"satuan_kapasitas":"Unit Kapal Perang","konsumsi_listrik":0.03}'::jsonb);
