const fs = require('fs');

const sql = fs.readFileSync('json/4_database_hubungan_antar_negara/database_hubungan_antar_negara.pg.sql', 'utf-8');
const lines = sql.slice(12942);

// Filter lines starting with (12... and 'china'
const chinaRows = [];
for (let i = 12945; i < 13200; i++) {
  const line = sql.split('\n')[i];
  if (!line || line.startsWith('--')) break;
  if (line.includes("'china'")) {
    chinaRows.push(line.trim());
  }
}

console.log('Total china rows found:', chinaRows.length);
['rusia', 'mongolia', 'india', 'indonesia', 'amerika', 'jepang', 'korea utara'].forEach(target => {
  const r = chinaRows.find(x => x.toLowerCase().includes(target));
  console.log(`China -> ${target}:`, r);
});

