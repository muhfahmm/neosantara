const fs = require('fs');

const masterPath = 'd:\\project-sendiri\\em\\db_presiden_simulator.sql';
const subPath = 'd:\\project-sendiri\\em\\json\\database_alokasi_subsidi\\database_alokasi_subsidi.sql';

let masterContent = fs.readFileSync(masterPath, 'utf8');
const subContent = fs.readFileSync(subPath, 'utf8');

const splitMarker = '-- SECTION: json/database_alokasi_subsidi/database_alokasi_subsidi.sql';
const idx = masterContent.indexOf(splitMarker);

if (idx !== -1) {
  masterContent = masterContent.substring(0, idx).trimEnd() + '\n\n';
}

const newSection = `-- ========================================================\n` +
`-- SECTION: json/database_alokasi_subsidi/database_alokasi_subsidi.sql\n` +
`-- ========================================================\n\n` +
subContent;

fs.writeFileSync(masterPath, masterContent + newSection);
console.log('Successfully updated db_presiden_simulator.sql with 207 countries subsidy data');
