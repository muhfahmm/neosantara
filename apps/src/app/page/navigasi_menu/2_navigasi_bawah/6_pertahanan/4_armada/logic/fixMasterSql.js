const fs = require('fs');
const path = require('path');

const masterDumpSqlPath = path.join(process.cwd(), 'db_presiden_simulator.sql');
const masterSql = fs.readFileSync(masterDumpSqlPath, 'utf8');

const matches = masterSql.match(/CREATE TABLE[^(]+/gi) || [];
const tablesInMaster = Array.from(new Set(matches.map(m => {
  const clean = m.replace(/CREATE TABLE\s+(IF NOT EXISTS\s+)?/i, '').trim();
  return clean.replace(/[`"'\(\s]/g, '');
})));

console.log('Total unique tables in db_presiden_simulator.sql now:', tablesInMaster.length);
console.log(tablesInMaster);


