const fs = require('fs');
const path = require('path');

const relSqlPath = path.join(process.cwd(), 'json/database_hubungan_antar_negara/database_hubungan_antar_negara.sql');
const masterSqlPath = path.join(process.cwd(), 'db_presiden_simulator.sql');

const relSql = fs.readFileSync(relSqlPath, 'utf8');

const regex = /\((\d+),\s*'([^']+)',\s*(\d+),\s*'([^']+)',\s*(\d+)\)/g;

let match;
let currentSlug = '';
let countryIndex = 0;

const slugToFormattedHeader = {};
const slugGroups = {};
let count = 0;

while ((match = regex.exec(relSql)) !== null) {
  const [fullMatch, id, slug, targetId, target, rel] = match;
  if (slug !== currentSlug) {
    currentSlug = slug;
    countryIndex++;
    const formattedName = slug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    slugToFormattedHeader[slug] = `${countryIndex}. ${formattedName}`;
  }
  if (!slugGroups[slug]) {
    slugGroups[slug] = [];
  }
  slugGroups[slug].push({ id: parseInt(id, 10), slug, targetId: parseInt(targetId, 10), target, rel: parseInt(rel, 10) });
  count++;
}

console.log('Total Slugs:', countryIndex, 'Total Rows:', count);

let formattedSql = `-- Database Hubungan Antar Negara SQL Export\n-- Total 42849 Records\n\nDROP TABLE IF EXISTS database_hubungan_antar_negara;\nCREATE TABLE IF NOT EXISTS database_hubungan_antar_negara (\n    id INT AUTO_INCREMENT PRIMARY KEY,\n    country_id INT NOT NULL,\n    country_slug VARCHAR(100) NOT NULL,\n    target_country_id INT NOT NULL,\n    target_country VARCHAR(100) NOT NULL,\n    relation INT NOT NULL\n);\n\n`;

let idCounter = 1;
const slugKeys = Object.keys(slugGroups);

for (let i = 0; i < slugKeys.length; i++) {
  const slug = slugKeys[i];
  const headerText = slugToFormattedHeader[slug];
  const items = slugGroups[slug];

  formattedSql += `-- ========================================================\n`;
  formattedSql += `-- ${headerText}\n`;
  formattedSql += `-- ========================================================\n`;
  formattedSql += `INSERT INTO database_hubungan_antar_negara (\n    country_id, country_slug, target_country_id, target_country, relation\n) VALUES\n`;

  const valueLines = items.map(item => `(${idCounter++}, '${item.slug}', ${item.targetId}, '${item.target}', ${item.rel})`);
  formattedSql += valueLines.join(',\n') + ';\n\n\n';
}

fs.writeFileSync(relSqlPath, formattedSql);
console.log('Updated database_hubungan_antar_negara.sql with headers & 2 line separators!');

let masterContent = fs.readFileSync(masterSqlPath, 'utf8');
const startMarker = 'DROP TABLE IF EXISTS database_hubungan_antar_negara;';
const startIdx = masterContent.indexOf(startMarker);
const nextDropIdx = masterContent.indexOf('DROP TABLE IF EXISTS', startIdx + startMarker.length);

const beforeBlock = masterContent.substring(0, startIdx);
const afterBlock = nextDropIdx !== -1 ? masterContent.substring(nextDropIdx) : '';

fs.writeFileSync(masterSqlPath, beforeBlock + formattedSql + afterBlock);
console.log('Updated db_presiden_simulator.sql master dump as well!');
