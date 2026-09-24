const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function findSqlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findSqlFiles(filePath, fileList);
    } else if (file.endsWith('.sql') && file !== 'db_presiden_simulator.sql') {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const sdaBoolCols = new Set(['emas', 'uranium', 'batu_bara', 'minyak_bumi', 'gas_alam', 'garam', 'litium', 'logam_tanah_jarang', 'bijih_besi']);

async function run() {
  const dbRoot = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    multipleStatements: true
  });

  await dbRoot.execute('CREATE DATABASE IF NOT EXISTS db_presiden_simulator CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci');
  await dbRoot.end();

  const db = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'db_presiden_simulator',
    multipleStatements: true
  });

  await db.execute('SET FOREIGN_KEY_CHECKS = 0');

  const sqlFiles = findSqlFiles('d:/project-sendiri/em');
  console.log(`Found ${sqlFiles.length} modular SQL files to import.`);

  for (const file of sqlFiles) {
    console.log('Importing:', path.basename(file));
    const content = fs.readFileSync(file, 'utf8');
    const statements = content.split(/;\s*\n/).map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
      if (!stmt) continue;
      await db.query(stmt);
    }
  }

  // Ensure database_sda has emas = TRUE for all 207 rows
  await db.execute('UPDATE database_sda SET emas = 1');
  console.log('Updated database_sda set emas = 1 in MySQL.');

  // Build clean, chunked db_presiden_simulator.sql for phpMyAdmin
  console.log('Rebuilding master db_presiden_simulator.sql with chunked INSERTs (max 300 rows)...');
  
  let fullMasterSql = 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

  const [tables] = await db.execute('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);

  for (const table of tableNames) {
    if (table === 'game_saves') continue;
    const [createRes] = await db.execute(`SHOW CREATE TABLE ${table}`);
    const createSql = createRes[0]['Create Table'] + ';\n\n';
    
    const [rows] = await db.execute(`SELECT * FROM ${table}`);
    let insertSql = '';
    if (rows.length > 0) {
      const cols = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
      
      const chunkSize = 300;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const valLines = chunk.map(r => {
          const vals = Object.entries(r).map(([k, v]) => {
            if (v === null || v === undefined) return 'NULL';
            if (table === 'database_sda' && sdaBoolCols.has(k)) {
              return Number(v) === 1 || v === true ? 'TRUE' : 'FALSE';
            }
            if (typeof v === 'number') return v;
            return "'" + String(v).replace(/'/g, "''").replace(/\n/g, "\\n") + "'";
          }).join(', ');
          return `(${vals})`;
        }).join(',\n');
        insertSql += `INSERT INTO \`${table}\` (${cols}) VALUES\n${valLines};\n\n`;
      }
    }

    const tableDump = `DROP TABLE IF EXISTS \`${table}\`;\n` + createSql + insertSql;
    fullMasterSql += tableDump;
  }

  fullMasterSql += 'SET FOREIGN_KEY_CHECKS = 1;\n';

  fs.writeFileSync('d:/project-sendiri/em/db_presiden_simulator.sql', fullMasterSql, 'utf8');
  console.log('Rebuilt db_presiden_simulator.sql successfully!');

  // Also update database_sda.sql cleanly
  const [sdaRows] = await db.execute('SELECT * FROM database_sda');
  const sdaCustomDump = `-- Database SDA SQL Export\n-- Total 207 Negara\n\nDROP TABLE IF EXISTS database_sda;\nCREATE TABLE IF NOT EXISTS database_sda (\n    id INT PRIMARY KEY,\n    country VARCHAR(100) NOT NULL,\n    country_slug VARCHAR(100) NOT NULL,\n    emas BOOLEAN NOT NULL DEFAULT FALSE,\n    uranium BOOLEAN NOT NULL DEFAULT FALSE,\n    batu_bara BOOLEAN NOT NULL DEFAULT FALSE,\n    minyak_bumi BOOLEAN NOT NULL DEFAULT FALSE,\n    gas_alam BOOLEAN NOT NULL DEFAULT FALSE,\n    garam BOOLEAN NOT NULL DEFAULT FALSE,\n    litium BOOLEAN NOT NULL DEFAULT FALSE,\n    logam_tanah_jarang BOOLEAN NOT NULL DEFAULT FALSE,\n    bijih_besi BOOLEAN NOT NULL DEFAULT FALSE\n);\n\nINSERT INTO database_sda (\n    id, country, country_slug, emas, uranium, batu_bara, minyak_bumi, gas_alam, garam, litium, logam_tanah_jarang, bijih_besi\n) VALUES\n` +
    sdaRows.map(r => {
      const vals = [
        r.id,
        `'${String(r.country).replace(/'/g, "''")}'`,
        `'${String(r.country_slug).replace(/'/g, "''")}'`,
        Number(r.emas) === 1 ? 'TRUE' : 'FALSE',
        Number(r.uranium) === 1 ? 'TRUE' : 'FALSE',
        Number(r.batu_bara) === 1 ? 'TRUE' : 'FALSE',
        Number(r.minyak_bumi) === 1 ? 'TRUE' : 'FALSE',
        Number(r.gas_alam) === 1 ? 'TRUE' : 'FALSE',
        Number(r.garam) === 1 ? 'TRUE' : 'FALSE',
        Number(r.litium) === 1 ? 'TRUE' : 'FALSE',
        Number(r.logam_tanah_jarang) === 1 ? 'TRUE' : 'FALSE',
        Number(r.bijih_besi) === 1 ? 'TRUE' : 'FALSE'
      ].join(', ');
      return `    (${vals})`;
    }).join(',\n') + ';\n';
  fs.writeFileSync('d:/project-sendiri/em/json/database_SDA/database_sda.sql', sdaCustomDump, 'utf8');

  await db.execute('SET FOREIGN_KEY_CHECKS = 1');
  await db.end();

  console.log('ALL DONE! Database fully restored and master SQL file rebuilt.');
}

run().catch(err => console.error(err));
