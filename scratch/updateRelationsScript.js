const fs = require('fs');
const path = require('path');

const sqlPath = path.join(process.cwd(), 'json/database_hubungan_antar_negara/database_hubungan_antar_negara.sql');
const jsonPath = path.join(process.cwd(), 'json/database_hubungan_antar_negara/relationsData.json');

const sql = fs.readFileSync(sqlPath, 'utf8');

function getPairKey(a, b) {
  const s1 = a.trim().toLowerCase();
  const s2 = b.trim().toLowerCase();
  return s1 < s2 ? `${s1}:${s2}` : `${s2}:${s1}`;
}

const header = `-- Database Hubungan Antar Negara SQL Export\n-- Dynamic & Realistic Relations Generated for 207 Countries\n\nDROP TABLE IF EXISTS database_hubungan_antar_negara;\nCREATE TABLE IF NOT EXISTS database_hubungan_antar_negara (\n    id INT AUTO_INCREMENT PRIMARY KEY,\n    country_id INT NOT NULL,\n    country_slug VARCHAR(100) NOT NULL,\n    target_country_id INT NOT NULL,\n    target_country VARCHAR(100) NOT NULL,\n    relation INT NOT NULL\n);\n\nINSERT INTO database_hubungan_antar_negara (\n    country_id, country_slug, target_country_id, target_country, relation\n) VALUES\n`;

const lines = sql.split('\n');
let id = 1;
const values = [];
const map = {};

for (let line of lines) {
  const match = line.match(/\((\d+),\s*'([^']+)',\s*(\d+),\s*'([^']+)',\s*(\d+)\)/);
  if (match) {
    const [, oldId, slug, targetId, target, oldRel] = match;
    const pairKey = getPairKey(slug.replace(/_/g, ' '), target);
    
    let hash = 5381;
    for (let i = 0; i < pairKey.length; i++) {
      hash = (hash * 33) ^ pairKey.charCodeAt(i);
    }
    
    let relationScore = 100;
    if (slug.replace(/_/g, ' ').trim().toLowerCase() !== target.trim().toLowerCase()) {
      relationScore = 15 + (Math.abs(hash) % 81);
    }

    values.push(`(${id++}, '${slug}', ${targetId}, '${target}', ${relationScore})`);

    if (!map[slug]) map[slug] = {};
    map[slug][target.trim().toLowerCase()] = relationScore;
  }
}

const newSql = header + values.join(',\n') + ';\n';
fs.writeFileSync(sqlPath, newSql);
fs.writeFileSync(jsonPath, JSON.stringify(map));

console.log(`Successfully updated ${values.length} records in SQL file and JSON registry!`);
