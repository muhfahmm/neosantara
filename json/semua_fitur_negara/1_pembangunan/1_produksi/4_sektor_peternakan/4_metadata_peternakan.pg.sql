-- SECTION: json\\semua_fitur_negara\\1_pembangunan\\1_produksi\\4_sektor_peternakan\\4_metadata_peternakan.pg.sql
CREATE TABLE IF NOT EXISTS database_building_metadata (
source_file VARCHAR(500) NOT NULL,
file_order INT NOT NULL,
entry_key VARCHAR(200) NOT NULL,
entry_order INT NOT NULL,
metadata JSONB NOT NULL,
PRIMARY KEY (source_file, entry_key)
);
INSERT INTO database_building_metadata (source_file, file_order, entry_key, entry_order, metadata) VALUES
('json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/4_metadata_peternakan.pg.sql', 4, 'ayam_unggas', 1, '{"key":"1_peternakan_unggas","dataKey":"ayam_unggas","label":"Peternakan Unggas","deskripsi":"Peternakan Unggas","produksi":150,"satuan":"EKOR","waktu_pembangunan":7,"biaya_pembangunan":1000,"konsumsi_listrik":0.0025}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/4_metadata_peternakan.pg.sql', 4, 'sapi_perah', 2, '{"key":"2_peternakan_sapi_perah","dataKey":"sapi_perah","label":"Peternakan Sapi Perah","deskripsi":"Peternakan Sapi Perah","produksi":150,"satuan":"LITER","waktu_pembangunan":15,"biaya_pembangunan":2500,"konsumsi_listrik":0.0035}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/4_metadata_peternakan.pg.sql', 4, 'sapi_potong', 3, '{"key":"3_peternakan_sapi_potong","dataKey":"sapi_potong","label":"Peternakan Sapi Potong","deskripsi":"Peternakan Sapi Potong","produksi":120,"satuan":"EKOR","waktu_pembangunan":20,"biaya_pembangunan":3000,"konsumsi_listrik":0.003}'::jsonb),
('json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/4_metadata_peternakan.pg.sql', 4, 'domba_kambing', 4, '{"key":"4_peternakan_domba_kambing","dataKey":"domba_kambing","label":"Peternakan Domba & Kambing","deskripsi":"Peternakan Domba & Kambing","produksi":180,"satuan":"EKOR","waktu_pembangunan":10,"biaya_pembangunan":1500,"konsumsi_listrik":0.0025}'::jsonb);
