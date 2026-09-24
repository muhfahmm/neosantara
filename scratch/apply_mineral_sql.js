const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_presiden_simulator',
    multipleStatements: true,
  });

  const sqlPath = path.join(
    process.cwd(),
    'json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/database_sektor_mineral_kritis.sql'
  );

  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  console.log('Executing updated database_sektor_mineral_kritis.sql in MySQL...');
  await db.query(sqlContent);
  console.log('Successfully updated database_sektor_mineral_kritis in MySQL!');

  db.end();
}

main().catch((err) => {
  console.error('Error executing SQL:', err);
  process.exit(1);
});
