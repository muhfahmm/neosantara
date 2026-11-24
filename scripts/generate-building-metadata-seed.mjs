import fs from 'node:fs';
import path from 'node:path';

export function generateBuildingMetadataSeed(rootDir = process.cwd()) {
  const targetSql = path.join(rootDir, 'json/database_building_metadata/database_building_metadata.pg.sql');
  const categoryFiles = [
    'json/semua_fitur_negara/1_pembangunan/1_produksi/1_sektor_listrik_nasional/1_metadata_listrik.pg.sql',
    'json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/2_metadata_ekstraksi.pg.sql',
    'json/semua_fitur_negara/1_pembangunan/1_produksi/3_manufaktur/3_metadata_manufaktur.pg.sql',
    'json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/4_metadata_peternakan.pg.sql',
    'json/semua_fitur_negara/1_pembangunan/1_produksi/5_sektor_agrikultur/5_metadata_agrikultur.pg.sql',
    'json/semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/6_metadata_perikanan.pg.sql',
    'json/semua_fitur_negara/1_pembangunan/1_produksi/7_sektor_olahan_pangan/7_metadata_olahan_pangan.pg.sql',
    'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/1_infrastruktur/metadata_infrastruktur.pg.sql',
    'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/2_pendidikan/metadata_pendidikan.pg.sql',
    'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/3_kesehatan/metadata_kesehatan.pg.sql',
    'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/4_hukum/metadata_hukum.pg.sql',
    'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/5_olahraga/metadata_olahraga.pg.sql',
    'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/6_komersial/metadata_komersial.pg.sql',
    'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/2_hunian_permukiman/metadata_hunian.pg.sql',
    'json/semua_fitur_negara/2_pertahanan/1_armada_militer/metadata_armada_militer.pg.sql',
    'json/semua_fitur_negara/2_pertahanan/2_manajemen_pertahanan/metadata_manajemen.pg.sql',
  ];

  let header = `CREATE TABLE IF NOT EXISTS database_building_metadata (
source_file VARCHAR(500) NOT NULL,
file_order INT NOT NULL,
entry_key VARCHAR(200) NOT NULL,
entry_order INT NOT NULL,
metadata JSONB NOT NULL,
PRIMARY KEY (source_file, entry_key)
);\n\n`;

  let totalFiles = 0;
  let totalRows = 0;
  let body = '';

  for (const relPath of categoryFiles) {
    const fullPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    const insertIdx = content.indexOf('INSERT INTO database_building_metadata');
    if (insertIdx !== -1) {
      const sqlSection = content.substring(insertIdx).trim();
      const rowCount = (sqlSection.match(/\('json\//g) || []).length;
      totalRows += rowCount;
      totalFiles++;
      body += `-- Source: ${relPath}\n${sqlSection}\n\n`;
    }
  }

  const finalSql = header + body;
  fs.writeFileSync(targetSql, finalSql, 'utf8');
  return { totalFiles, totalRows, outputPath: targetSql };
}

// Eksekusi mandiri bila dijalankan via node
const result = generateBuildingMetadataSeed();
console.log(`[Seed Generator] Merged ${result.totalFiles} files (${result.totalRows} rows) into ${result.outputPath}`);
