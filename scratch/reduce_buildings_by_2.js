const fs = require('fs');
const path = require('path');

// Skrip untuk mengurangi nilai kolom angka sebesar 2 (minimal 0) di 4 file SQL sektor pangan & master dump SQL

const filesToUpdate = [
  path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/database_sektor_peternakan.sql'),
  path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/5_sektor_agrikultur/database_sektor_agrikultur.sql'),
  path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/database_sektor_perikanan.sql'),
  path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/7_sektor_olahan_pangan/database_sektor_olahan_pangan.sql'),
  path.join(__dirname, '../db_presiden_simulator.sql')
];

for (const filePath of filesToUpdate) {
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const newLines = [];

  for (let line of lines) {
    // Tangkap baris data tuple SQL misal: (15, 'Ghana', 'ghana', 34, 28, 23, 11),
    if (line.trim().startsWith('(') && line.includes("','")) {
      const match = line.match(/^(\s*\(\d+,\s*'[^']+',\s*'[^']+',\s*)(.*)(\),?|;)$/);
      if (match) {
        const prefix = match[1];
        const numPart = match[2];
        const suffix = match[3];

        // Kurangi setiap nilai angka bangunan dengan 2 (minimal 0)
        const updatedNums = numPart.split(',').map(rawNum => {
          const num = parseInt(rawNum.trim(), 10);
          if (isNaN(num)) return rawNum;
          return Math.max(0, num - 2);
        });

        newLines.push(`${prefix}${updatedNums.join(', ')}${suffix}`);
        continue;
      }
    }
    newLines.push(line);
  }

  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log(`Successfully reduced building numbers by 2 in: ${path.basename(filePath)}`);
}
