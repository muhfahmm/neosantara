const fs = require('fs');
const path = require('path');

const masterDumpPath = path.join(__dirname, '../db_presiden_simulator.sql');

const peternakanPath = path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/database_sektor_peternakan.sql');
const agrikulturPath = path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/5_sektor_agrikultur/database_sektor_agrikultur.sql');
const perikananPath = path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/database_sektor_perikanan.sql');
const olahanPath = path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/7_sektor_olahan_pangan/database_sektor_olahan_pangan.sql');

const peternakanSql = fs.readFileSync(peternakanPath, 'utf8').trim();
const agrikulturSql = fs.readFileSync(agrikulturPath, 'utf8').trim();
const perikananSql = fs.readFileSync(perikananPath, 'utf8').trim();
const olahanSql = fs.readFileSync(olahanPath, 'utf8').trim();

let masterSql = fs.readFileSync(masterDumpPath, 'utf8').trim();

const makeSection = (title, sqlContent) => {
  return `\n\n-- ========================================================\n-- SECTION: ${title}\n-- ========================================================\n\n${sqlContent}`;
};

masterSql += makeSection('semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/database_sektor_peternakan.sql', peternakanSql);
masterSql += makeSection('semua_fitur_negara/1_pembangunan/1_produksi/5_sektor_agrikultur/database_sektor_agrikultur.sql', agrikulturSql);
masterSql += makeSection('semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/database_sektor_perikanan.sql', perikananSql);
masterSql += makeSection('semua_fitur_negara/1_pembangunan/1_produksi/7_sektor_olahan_pangan/database_sektor_olahan_pangan.sql', olahanSql);

fs.writeFileSync(masterDumpPath, masterSql, 'utf8');
console.log('Successfully appended 4 food sectors to master SQL dump db_presiden_simulator.sql');
