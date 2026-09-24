const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const tableToFileMap = {
  'database_profiles_negara': 'd:/project-sendiri/em/json/semua_fitur_negara/0_profiles/database_profiles_negara.sql',
  'database_sektor_listrik_nasional': 'd:/project-sendiri/em/json/semua_fitur_negara/1_pembangunan/1_produksi/1_sektor_listrik_nasional/database_sektor_listrik_nasional.sql',
  'database_sektor_mineral_kritis': 'd:/project-sendiri/em/json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/database_sektor_mineral_kritis.sql',
  'database_manufaktur': 'd:/project-sendiri/em/json/semua_fitur_negara/1_pembangunan/1_produksi/3_manufaktur/database_manufaktur.sql',
  'database_sektor_peternakan': 'd:/project-sendiri/em/json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/database_sektor_peternakan.sql',
  'database_sektor_agrikultur': 'd:/project-sendiri/em/json/semua_fitur_negara/1_pembangunan/1_produksi/5_sektor_agrikultur/database_sektor_agrikultur.sql',
  'database_sektor_perikanan': 'd:/project-sendiri/em/json/semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/database_sektor_perikanan.sql',
  'database_sektor_olahan_pangan': 'd:/project-sendiri/em/json/semua_fitur_negara/1_pembangunan/1_produksi/7_sektor_olahan_pangan/database_sektor_olahan_pangan.sql',
  'database_sda': 'd:/project-sendiri/em/json/database_SDA/database_sda.sql',
};

const sdaBoolCols = new Set(['emas', 'uranium', 'batu_bara', 'minyak_bumi', 'gas_alam', 'garam', 'litium', 'logam_tanah_jarang', 'bijih_besi']);

async function dump() {
  const db = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'db_presiden_simulator'
  });

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
      
      // Chunk rows in batches of 500
      const chunkSize = 500;
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

    if (tableToFileMap[table]) {
      if (table === 'database_sda') {
        // Special clean format for database_sda.sql with TRUE/FALSE
        const sdaCustomDump = `-- Database SDA SQL Export\n-- Total 207 Negara\n\nDROP TABLE IF EXISTS database_sda;\nCREATE TABLE IF NOT EXISTS database_sda (\n    id INT PRIMARY KEY,\n    country VARCHAR(100) NOT NULL,\n    country_slug VARCHAR(100) NOT NULL,\n    emas BOOLEAN NOT NULL DEFAULT FALSE,\n    uranium BOOLEAN NOT NULL DEFAULT FALSE,\n    batu_bara BOOLEAN NOT NULL DEFAULT FALSE,\n    minyak_bumi BOOLEAN NOT NULL DEFAULT FALSE,\n    gas_alam BOOLEAN NOT NULL DEFAULT FALSE,\n    garam BOOLEAN NOT NULL DEFAULT FALSE,\n    litium BOOLEAN NOT NULL DEFAULT FALSE,\n    logam_tanah_jarang BOOLEAN NOT NULL DEFAULT FALSE,\n    bijih_besi BOOLEAN NOT NULL DEFAULT FALSE\n);\n\nINSERT INTO database_sda (\n    id, country, country_slug, emas, uranium, batu_bara, minyak_bumi, gas_alam, garam, litium, logam_tanah_jarang, bijih_besi\n) VALUES\n` +
          rows.map(r => {
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
        fs.writeFileSync(tableToFileMap[table], sdaCustomDump, 'utf8');
        console.log('Saved custom TRUE/FALSE SDA module SQL:', tableToFileMap[table]);
      } else {
        fs.writeFileSync(tableToFileMap[table], tableDump, 'utf8');
        console.log('Saved module SQL:', tableToFileMap[table]);
      }
    }
  }

  fullMasterSql += 'SET FOREIGN_KEY_CHECKS = 1;\n';

  fs.writeFileSync('d:/project-sendiri/em/db_presiden_simulator.sql', fullMasterSql, 'utf8');
  console.log('Saved master db_presiden_simulator.sql successfully!');

  await db.end();
}

dump().catch(err => console.error(err));
