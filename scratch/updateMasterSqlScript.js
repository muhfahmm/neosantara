const fs = require('fs');
const path = require('path');

const masterSqlPath = path.join(process.cwd(), 'db_presiden_simulator.sql');
const relationsSqlPath = path.join(process.cwd(), 'json/database_hubungan_antar_negara/database_hubungan_antar_negara.sql');

const masterContent = fs.readFileSync(masterSqlPath, 'utf8');
const newRelationsSql = fs.readFileSync(relationsSqlPath, 'utf8');

const insertStartIdx = newRelationsSql.indexOf('INSERT INTO database_hubungan_antar_negara');
const newInsertBlock = newRelationsSql.substring(insertStartIdx);

const startMarker = 'DROP TABLE IF EXISTS database_hubungan_antar_negara;';
const startIdx = masterContent.indexOf(startMarker);
const nextDropIdx = masterContent.indexOf('DROP TABLE IF EXISTS', startIdx + startMarker.length);

const beforeBlock = masterContent.substring(0, startIdx);
const afterBlock = masterContent.substring(nextDropIdx);

const tableCreateBlock = `DROP TABLE IF EXISTS database_hubungan_antar_negara;
CREATE TABLE IF NOT EXISTS database_hubungan_antar_negara (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_id INT NOT NULL,
    country_slug VARCHAR(100) NOT NULL,
    target_country_id INT NOT NULL,
    target_country VARCHAR(100) NOT NULL,
    relation INT NOT NULL
);

${newInsertBlock}

`;

fs.writeFileSync(masterSqlPath, beforeBlock + tableCreateBlock + afterBlock);
console.log('Successfully updated db_presiden_simulator.sql master dump!');
