/**
 * Script: generate_pajak_index.js
 * Membaca database_pajak_negara.sql dan generate ulang index.ts secara otomatis.
 * Jalankan: node scripts/generate_pajak_index.js
 */

const fs = require('fs');
const path = require('path');

const SQL_PATH = path.join(__dirname, '../json/database_pajak_negara/database_pajak_negara.sql');
const OUTPUT_PATH = path.join(__dirname, '../json/database_pajak_negara/index.ts');

const sqlContent = fs.readFileSync(SQL_PATH, 'utf-8');

// Parse baris-per-baris: cari pola (id, 'country', 'slug', ppn, korporasi, penghasilan, bea_cukai, lingkungan)
// Setiap row INSERT ada di satu baris (bisa dimulai dengan spasi/tab)
const rowRegex = /\(\s*\d+\s*,\s*'[^']+'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;

const entries = {};
let match;
let count = 0;

while ((match = rowRegex.exec(sqlContent)) !== null) {
  const [, slug, ppn, korporasi, penghasilan, beaCukai, lingkungan] = match;
  const key = slug.trim();
  const entry = {
    country_slug: key,
    tarif_ppn: parseInt(ppn),
    tarif_korporasi: parseInt(korporasi),
    tarif_penghasilan: parseInt(penghasilan),
    tarif_bea_cukai: parseInt(beaCukai),
    tarif_lingkungan: parseInt(lingkungan),
  };

  // Tambahkan slug dengan underscore
  entries[key] = entry;

  // Tambahkan juga versi dash untuk kompatibilitas
  const keyDash = key.replace(/_/g, '-');
  if (keyDash !== key) {
    entries[keyDash] = entry;
  }

  count++;
}

console.log(`✅ Parsed ${count} negara dari SQL`);

if (count === 0) {
  console.error('❌ Tidak ada data yang ter-parse! Periksa format SQL.');
  process.exit(1);
}

// Generate isi index.ts
let output = `// Auto-generated from database_pajak_negara.sql — DO NOT EDIT MANUALLY\n`;
output += `// Untuk update data: edit .sql lalu jalankan: node scripts/generate_pajak_index.js\n`;
output += `export const DATABASE_PAJAK_NEGARA: Record<string, any> = {\n`;

for (const [key, val] of Object.entries(entries)) {
  output += `  "${key}": {\n`;
  output += `    "country_slug": "${val.country_slug}",\n`;
  output += `    "tarif_ppn": ${val.tarif_ppn},\n`;
  output += `    "tarif_korporasi": ${val.tarif_korporasi},\n`;
  output += `    "tarif_penghasilan": ${val.tarif_penghasilan},\n`;
  output += `    "tarif_bea_cukai": ${val.tarif_bea_cukai},\n`;
  output += `    "tarif_lingkungan": ${val.tarif_lingkungan}\n`;
  output += `  },\n`;
}

output += `};\n`;

fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');
console.log(`✅ Berhasil generate: ${OUTPUT_PATH}`);
console.log(`📊 Total entri: ${Object.keys(entries).length} (termasuk slug dash-variant)`);
