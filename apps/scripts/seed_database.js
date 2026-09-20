const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  console.log("=== MEMULAI IMPORT OPTIMIZED DATABASE KE XAMPP MYSQL ===");
  
  const host = process.env.DB_HOST || '127.0.0.1';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = parseInt(process.env.DB_PORT || '3306');
  const databaseName = process.env.DB_NAME || 'db_presiden_simulator';

  try {
    console.log(`Connecting to MySQL Server at ${host}:${port} as ${user}...`);
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
      multipleStatements: true
    });

    console.log(`Creating database '${databaseName}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`);
    await connection.changeUser({ database: databaseName });

    const sqlFilePath = path.join(__dirname, '..', '..', 'db_presiden_simulator.sql');
    console.log(`Reading Master SQL Dump from: ${sqlFilePath}`);

    const sqlDump = fs.readFileSync(sqlFilePath, 'utf-8');

    // Split SQL into individual statements by semicolon to avoid packet size overflow
    const statements = sqlDump
      .split(/;\s*$/m)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements in chunks...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt) {
        await connection.query(stmt);
      }
      if ((i + 1) % 50 === 0 || i + 1 === statements.length) {
        console.log(`Progress: ${i + 1} / ${statements.length} statements executed.`);
      }
    }

    console.log("\n=======================================================");
    console.log(`SUCCESS! Database '${databaseName}' and all 28 tables/data imported into XAMPP MySQL!`);
    console.log("=======================================================\n");
    await connection.end();
  } catch (error) {
    console.error("ERROR during database import:", error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error("\nCATATAN PERBAIKAN:");
      console.error("1. Buka XAMPP Control Panel.");
      console.error("2. Tekan tombol START pada modul MySQL.");
      console.error("3. Jalankan kembali perintah 'npm run db:seed -w apps'.\n");
    }
  }
}

seedDatabase();
