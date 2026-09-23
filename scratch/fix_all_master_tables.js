const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, '../db_presiden_simulator.sql');
let content = fs.readFileSync(masterPath, 'utf8');

// Replace any CREATE TABLE IF NOT EXISTS table_name with DROP TABLE IF EXISTS table_name;\nCREATE TABLE IF NOT EXISTS table_name
content = content.replace(/(?:DROP TABLE IF EXISTS [a-zA-Z0-9_]+;\s*)?CREATE TABLE IF NOT EXISTS ([a-zA-Z0-9_]+)/g, (match, tableName) => {
  return `DROP TABLE IF EXISTS ${tableName};\nCREATE TABLE IF NOT EXISTS ${tableName}`;
});

fs.writeFileSync(masterPath, content, 'utf8');
console.log("Successfully added DROP TABLE IF EXISTS to all tables in db_presiden_simulator.sql!");
