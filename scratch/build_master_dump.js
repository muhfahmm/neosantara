const fs = require('fs');
const path = require('path');

const sqlModules = [
  'json/database_SDA/database_sda.sql',
  'json/database_doktrin_keterbukaan/database_doktrin_keterbukaan.sql',
  'json/database_harga_barang/database_harga_barang.sql',
  'json/database_hubungan_antar_negara/database_hubungan_antar_negara.sql',
  'json/database_kedutaan_besar/database_kedutaan_besar.sql',
  'json/database_level_kabinet/database_level_kabinet.sql',
  'json/database_mitra_perdagangan/database_mitra_perdagangan.sql',
  'json/database_pajak_negara/database_pajak_negara.sql',
  'json/database_tempat_wisata/database_tempat_wisata.sql',
  'json/semua_fitur_negara/0_profiles/database_profiles_negara.sql',
  'json/semua_fitur_negara/1_pembangunan/1_produksi/1_sektor_listrik_nasional/database_sektor_listrik_nasional.sql',
  'json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/database_sektor_mineral_kritis.sql',
  'json/semua_fitur_negara/1_pembangunan/1_produksi/3_manufaktur/database_manufaktur.sql',
  'json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/database_sektor_peternakan.sql',
  'json/semua_fitur_negara/1_pembangunan/1_produksi/5_sektor_agrikultur/database_sektor_agrikultur.sql',
  'json/semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/database_sektor_perikanan.sql',
  'json/semua_fitur_negara/1_pembangunan/1_produksi/7_sektor_olahan_pangan/database_sektor_olahan_pangan.sql',
  'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/1_infrastruktur/database_infrastruktur.sql',
  'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/2_pendidikan/database_pendidikan.sql',
  'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/3_kesehatan/database_kesehatan.sql',
  'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/4_hukum/database_hukum.sql',
  'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/5_olahraga/database_olahraga.sql',
  'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/6_komersial/database_komersial.sql',
  'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/7_hiburan/database_hiburan.sql',
  'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/2_hunian_permukiman/database_hunian_permukiman.sql',
  'json/semua_fitur_negara/2_pertahanan/1_armada_militer/database_armada_militer.sql',
  'json/semua_fitur_negara/2_pertahanan/2_armada_polisi/database_armada_polisi.sql',
  'json/semua_fitur_negara/2_pertahanan/3_manajemen_pertahanan/database_manajemen_pertahanan.sql',
];

// Ensure each module file has DROP TABLE IF EXISTS
const rootDir = path.join(__dirname, '..');

sqlModules.forEach((modPath) => {
  const fullPath = path.join(rootDir, modPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    const tblMatch = content.match(/CREATE TABLE IF NOT EXISTS ([a-zA-Z0-9_]+)/);
    if (tblMatch) {
      const tblName = tblMatch[1];
      if (!content.includes(`DROP TABLE IF EXISTS ${tblName}`)) {
        content = content.replace(`CREATE TABLE IF NOT EXISTS ${tblName}`, `DROP TABLE IF EXISTS ${tblName};\nCREATE TABLE IF NOT EXISTS ${tblName}`);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Added DROP TABLE IF EXISTS to ${modPath}`);
      }
    }
  }
});

// Build db_presiden_simulator.sql
let masterContent = `-- ========================================================
-- MASTER SQL DUMP FOR PRESIDEN SIMULATOR
-- Database: db_presiden_simulator (XAMPP MySQL / phpMyAdmin)
-- Total 28 Modul Data Negara
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

CREATE DATABASE IF NOT EXISTS db_presiden_simulator;
USE db_presiden_simulator;

-- --------------------------------------------------------
-- Table structure for table \`game_saves\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS game_saves;
CREATE TABLE IF NOT EXISTS game_saves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    save_name VARCHAR(255) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    country_iso VARCHAR(10) NOT NULL,
    game_date VARCHAR(50) NOT NULL,
    capital VARCHAR(100) DEFAULT NULL,
    jumlah_penduduk BIGINT DEFAULT 0,
    anggaran BIGINT DEFAULT 0,
    ideology VARCHAR(100) DEFAULT NULL,
    religion VARCHAR(100) DEFAULT NULL,
    un_vote INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

`;

sqlModules.forEach((modPath) => {
  const fullPath = path.join(rootDir, modPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8').trim();
    masterContent += `\n\n-- ========================================================\n-- SECTION: ${modPath}\n-- ========================================================\n\n${content}\n`;
  } else {
    console.warn(`Module missing: ${modPath}`);
  }
});

fs.writeFileSync(path.join(rootDir, 'db_presiden_simulator.sql'), masterContent, 'utf8');
console.log("Rebuilt db_presiden_simulator.sql successfully with DROP TABLE IF EXISTS for all 28 modules!");
