const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function calculateGoldBuildings(pop, existingEmas) {
  const p = Number(pop) || 1000000;
  let calc = 6;
  if (p >= 500000000) calc = 25;
  else if (p >= 200000000) calc = 20;
  else if (p >= 100000000) calc = 16;
  else if (p >= 50000000) calc = 14;
  else if (p >= 20000000) calc = 12;
  else if (p >= 10000000) calc = 10;
  else if (p >= 5000000) calc = 8;
  else if (p >= 1000000) calc = 7;
  else calc = 6;

  return Math.max(existingEmas || 0, calc);
}

async function main() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_presiden_simulator',
  });

  const [profiles] = await db.execute('SELECT id, name_id, jumlah_penduduk FROM database_profiles_negara');
  const [mineralRows] = await db.execute('SELECT * FROM database_sektor_mineral_kritis');

  const minMap = new Map();
  mineralRows.forEach((r) => minMap.set(Number(r.id), r));

  const updatedRows = [];

  for (const prof of profiles) {
    const id = Number(prof.id);
    const m = minMap.get(id) || {};
    const oldEmas = Number(m.emas) || 0;
    const newEmas = calculateGoldBuildings(prof.jumlah_penduduk, oldEmas);

    await db.execute('UPDATE database_sektor_mineral_kritis SET emas = ? WHERE id = ?', [newEmas, id]);
    updatedRows.push({
      ...m,
      id,
      country: m.country || prof.name_id,
      country_slug: m.country_slug || prof.name_id.toLowerCase().replace(/\s+/g, '_'),
      emas: newEmas,
    });
  }

  console.log(`Updated ${updatedRows.length} rows in MySQL database_sektor_mineral_kritis.`);

  // Now rewrite database_sektor_mineral_kritis.sql
  const mineralSqlPath = path.join(
    process.cwd(),
    'json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/database_sektor_mineral_kritis.sql'
  );

  const [allMineral] = await db.execute('SELECT * FROM database_sektor_mineral_kritis ORDER BY id ASC');

  let sqlContent = `DROP TABLE IF EXISTS \`database_sektor_mineral_kritis\`;\n`;
  sqlContent += `CREATE TABLE \`database_sektor_mineral_kritis\` (\n`;
  sqlContent += `  \`id\` int(11) NOT NULL,\n`;
  sqlContent += `  \`country\` varchar(100) NOT NULL,\n`;
  sqlContent += `  \`country_slug\` varchar(100) NOT NULL,\n`;
  sqlContent += `  \`bijih_besi\` int(11) NOT NULL DEFAULT 0,\n`;
  sqlContent += `  \`litium\` int(11) NOT NULL DEFAULT 0,\n`;
  sqlContent += `  \`logam_tanah_jarang\` int(11) NOT NULL DEFAULT 0,\n`;
  sqlContent += `  \`emas\` int(11) NOT NULL DEFAULT 0,\n`;
  sqlContent += `  \`batu_bara\` int(11) NOT NULL DEFAULT 0,\n`;
  sqlContent += `  \`minyak_bumi\` int(11) NOT NULL DEFAULT 0,\n`;
  sqlContent += `  \`gas_alam\` int(11) NOT NULL DEFAULT 0,\n`;
  sqlContent += `  \`uranium\` int(11) NOT NULL DEFAULT 0,\n`;
  sqlContent += `  \`garam\` int(11) NOT NULL DEFAULT 0,\n`;
  sqlContent += `  PRIMARY KEY (\`id\`)\n`;
  sqlContent += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;\n\n`;

  sqlContent += `INSERT INTO \`database_sektor_mineral_kritis\` (\`id\`, \`country\`, \`country_slug\`, \`bijih_besi\`, \`litium\`, \`logam_tanah_jarang\`, \`emas\`, \`batu_bara\`, \`minyak_bumi\`, \`gas_alam\`, \`uranium\`, \`garam\`) VALUES\n`;

  const valuesStr = allMineral.map((row) => {
    const escCountry = row.country.replace(/'/g, "''");
    const escSlug = row.country_slug.replace(/'/g, "''");
    return `(${row.id}, '${escCountry}', '${escSlug}', ${row.bijih_besi || 0}, ${row.litium || 0}, ${row.logam_tanah_jarang || 0}, ${row.emas || 0}, ${row.batu_bara || 0}, ${row.minyak_bumi || 0}, ${row.gas_alam || 0}, ${row.uranium || 0}, ${row.garam || 0})`;
  }).join(',\n');

  sqlContent += valuesStr + ';\n';

  fs.writeFileSync(mineralSqlPath, sqlContent, 'utf8');
  console.log(`Updated ${mineralSqlPath}`);

  db.end();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
