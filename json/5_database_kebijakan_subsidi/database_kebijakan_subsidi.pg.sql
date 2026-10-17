-- ========================================================
-- DATABASE MASTER KEBIJAKAN SUBSIDI (18 KARTU SUBSIDI)
-- File: json/database_kebijakan_subsidi/database_kebijakan_subsidi.pg.sql
-- Description: Menyimpan master data rincian 18 kartu kebijakan subsidi (PostgreSQL)
-- ========================================================

DROP TABLE IF EXISTS database_kebijakan_subsidi;
CREATE TABLE IF NOT EXISTS database_kebijakan_subsidi (
    id SERIAL PRIMARY KEY,
    item_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    is_subsidized_default BOOLEAN NOT NULL DEFAULT true,
    budget_cost INT NOT NULL,
    approval_impact INT NOT NULL,
    inflation_reduction INT NOT NULL,
    demo_risk VARCHAR(20) NOT NULL
);

INSERT INTO database_kebijakan_subsidi 
(id, item_id, name, category, description, is_subsidized_default, budget_cost, approval_impact, inflation_reduction, demo_risk) 
VALUES
(1, 'sub_bbm', 'Subsidi Bahan Bakar & Energi Transportasi', 'Energi', 'Menjaga harga bahan bakar tetap terjangkau untuk kendaraan armada publik, distribusi logistik, dan masyarakat.', true, 50, 25, 4, 'Kritis'),
(2, 'sub_listrik', 'Subsidi Tarif Listrik Rumah Tangga', 'Energi', 'Bantuan tarif tenaga listrik khusus rumah tangga berpenghasilan rendah dan fasilitas pelayanan publik.', true, 25, 18, 2, 'Tinggi'),
(3, 'sub_lpg', 'Subsidi Gas Memasak Rumah Tangga', 'Energi', 'Menjamin ketersediaan tabung gas bersubsidi untuk kebutuhan memasak keluarga kurang mampu dan usaha mikro.', true, 30, 20, 2, 'Kritis'),
(4, 'sub_pdam', 'Subsidi Layanan Air Bersih', 'Energi', 'Tarif suplai air minum bersubsidi untuk kawasan pemukiman padat dan daerah rawan krisis air.', true, 5, 10, 1, 'Sedang'),
(5, 'sub_pupuk', 'Subsidi Pupuk & Saprodi Pertanian', 'Pangan', 'Alokasi pupuk dan benih bersubsidi untuk memangkas biaya produksi tani dan menjaga pasokan pangan nasional.', true, 10, 15, 2, 'Tinggi'),
(6, 'sub_sembako', 'Operasi Stabilisasi Harga Pangan Pokok', 'Pangan', 'Intervensi pasar pasokan gandum, beras, minyak masak, dan gula saat terjadi lonjakan inflasi.', true, 10, 16, 2, 'Tinggi'),
(7, 'sub_bantuan_pangan', 'Bantuan Pasokan Pangan Darurat', 'Pangan', 'Distribusi paket bahan pangan pokok bulanan secara gratis untuk keluarga penerima manfaat sosial.', true, 5, 14, 1, 'Sedang'),
(8, 'sub_pendidikan', 'Subsidi Biaya Pendidikan & Beasiswa Pelajar', 'Pendidikan & Kesehatan', 'Pembebasan uang sekolah negeri dan beasiswa penuh bagi pelajar serta mahasiswa berprestasi kurang mampu.', true, 20, 22, 1, 'Kritis'),
(9, 'sub_bpjs', 'Jaminan Layanan Kesehatan Nasional', 'Pendidikan & Kesehatan', 'Pembayaran iuran asuransi kesehatan publik gratis bagi masyarakat tidak mampu dan pekerja sektor informal.', true, 15, 24, 1, 'Kritis'),
(10, 'sub_vaksin', 'Program Immunisasi & Vaksinasi Publik', 'Pendidikan & Kesehatan', 'Program imunisasi dasar anak dan vaksinasi kesehatan publik bebas biaya di seluruh klinik dan rumah sakit daerah.', false, 5, 12, 1, 'Sedang'),
(11, 'sub_transport_publik', 'Subsidi Layanan Transportasi Publik', 'Transportasi & Perumahan', 'Diskon tarif komuter kereta api publik dan armada bus kota untuk menekan emisi & beban pengeluaran warga.', true, 5, 14, 1, 'Tinggi'),
(12, 'sub_perumahan', 'Subsidi Perumahan & Pemukiman Rakyat', 'Transportasi & Perumahan', 'Bantuan suku bunga rendah dan insentif hunian bersubsidi bagi keluarga berpenghasilan rendah.', true, 10, 16, 1, 'Sedang'),
(13, 'sub_ev', 'Insentif Transisi Transportasi Ramah Lingkungan', 'Transportasi & Perumahan', 'Potongan harga dan insentif pajak untuk adopsi kendaraan bermotor berbasis energi ramah lingkungan.', false, 5, 6, 1, 'Rendah'),
(14, 'sub_kur', 'Subsidi Bunga Kredit Usaha Mikro', 'UMKM & Ekonomi', 'Bantuan suku bunga ringan untuk pinjaman modal usaha kecil, pedagang mandiri, dan kewirausahaan lokal.', true, 10, 19, 1, 'Tinggi'),
(15, 'sub_pajak_umkm', 'Insentif Bebas Pajak Pengusaha Mikro', 'UMKM & Ekonomi', 'Pembebasan kewajiban pajak penghasilan bagi usaha skala mikro yang baru berkembang.', true, 5, 15, 1, 'Sedang'),
(16, 'sub_blt', 'Bantuan Langsung Tunai (BLT)', 'Perlindungan Sosial', 'Transfer dana tunai langsung bagi masyarakat kelompok terbawah untuk menjaga daya beli.', true, 15, 26, 0, 'Kritis'),
(17, 'sub_pensiun', 'Tunjangan Jaminan Sosial Lansia', 'Perlindungan Sosial', 'Bantuan santunan dana pensiun dan jaminan sosial bulanan bagi lansia serta pejuang veteran.', true, 5, 11, 0, 'Sedang'),
(18, 'sub_bencana', 'Dana Tanggap Bencana & Krisis', 'Perlindungan Sosial', 'Dana tak terduga untuk pemulihan infrastruktur publik dan jaringan pengaman sosial saat krisis/bencana.', true, 5, 13, 0, 'Sedang');
