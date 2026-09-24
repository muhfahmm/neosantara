const fs = require('fs');
const path = require('path');

// Skrip ini akan menyinkronkan 4 tabel sektor pangan dari file modul spesifik ke master SQL dump `db_presiden_simulator.sql`
const masterDumpPath = path.join(__dirname, '../db_presiden_simulator.sql');

const peternakanPath = path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/database_sektor_peternakan.sql');
const agrikulturPath = path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/5_sektor_agrikultur/database_sektor_agrikultur.sql');
const perikananPath = path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/database_sektor_perikanan.sql');
const olahanPath = path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/7_sektor_olahan_pangan/database_sektor_olahan_pangan.sql');

const peternakanSql = fs.readFileSync(peternakanPath, 'utf8').trim();
const agrikulturSql = fs.readFileSync(agrikulturPath, 'utf8').trim();
const perikananSql = fs.readFileSync(perikananPath, 'utf8').trim();
const olahanSql = fs.readFileSync(olahanPath, 'utf8').trim();

let masterSql = fs.readFileSync(masterDumpPath, 'utf8');

// Function untuk replace or append section
const replaceOrAppendSection = (sqlText, tableName, sectionTitle, newSectionContent) => {
  const sectionHeader = `-- ========================================================\n-- SECTION: ${sectionTitle}\n-- ========================================================`;
  const pattern = new RegExp(`-- ========================================================\\s*-- SECTION: [^\\n]*${tableName}[^\\n]*\\s*-- ========================================================([\\s\\S]*?)(?=(-- ========================================================|$))`, 'i');

  const formattedNewContent = `\n${sectionHeader}\n\n${newSectionContent.trim()}\n\n`;

  if (pattern.test(sqlText)) {
    return sqlText.replace(pattern, formattedNewContent);
  } else {
    // Append at the end of file before foreign key checks if any or at the very end
    return sqlText.trim() + `\n\n${formattedNewContent}`;
  }
};

masterSql = replaceOrAppendSection(masterSql, 'database_sektor_peternakan', 'semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/database_sektor_peternakan.sql', peternakanSql);
masterSql = replaceOrAppendSection(masterSql, 'database_sektor_agrikultur', 'semua_fitur_negara/1_pembangunan/1_produksi/5_sektor_agrikultur/database_sektor_agrikultur.sql', agrikulturSql);
masterSql = replaceOrAppendSection(masterSql, 'database_sektor_perikanan', 'semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/database_sektor_perikanan.sql', perikananSql);
masterSql = replaceOrAppendSection(masterSql, 'database_sektor_olahan_pangan', 'semua_fitur_negara/1_pembangunan/1_produksi/7_sektor_olahan_pangan/database_sektor_olahan_pangan.sql', olahanSql);

fs.writeFileSync(masterDumpPath, masterSql, 'utf8');
console.log('Successfully updated master SQL dump file db_presiden_simulator.sql');
