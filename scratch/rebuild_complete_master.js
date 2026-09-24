const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const jsonDir = path.join(rootDir, 'json');

function findSqlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findSqlFiles(filePath, fileList);
    } else if (file.endsWith('.sql')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const sqlFiles = findSqlFiles(jsonDir);
console.log(`Found ${sqlFiles.length} modular SQL files under json/`);

// Ensure each module file has DROP TABLE IF EXISTS
sqlFiles.forEach((fullPath) => {
  let content = fs.readFileSync(fullPath, 'utf8');
  const tblMatch = content.match(/CREATE TABLE (?:IF NOT EXISTS )?`?([a-zA-Z0-9_]+)`?/i);
  if (tblMatch) {
    const tblName = tblMatch[1];
    if (!content.includes(`DROP TABLE IF EXISTS \`${tblName}\``) && !content.includes(`DROP TABLE IF EXISTS ${tblName}`)) {
      content = content.replace(/CREATE TABLE (?:IF NOT EXISTS )?`?([a-zA-Z0-9_]+)`?/i, `DROP TABLE IF EXISTS \`${tblName}\`;\nCREATE TABLE IF NOT EXISTS \`${tblName}\``);
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Added DROP TABLE IF EXISTS to ${path.relative(rootDir, fullPath)}`);
    }
  }
});

// Build db_presiden_simulator.sql
let masterContent = `-- ========================================================
-- MASTER SQL DUMP FOR PRESIDEN SIMULATOR (ALL MODULES)
-- Database: db_presiden_simulator (XAMPP MySQL / phpMyAdmin)
-- Total ${sqlFiles.length} Modul Data Negara
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

CREATE DATABASE IF NOT EXISTS db_presiden_simulator;
USE db_presiden_simulator;

-- --------------------------------------------------------
-- Table structure for table \`game_saves\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS game_saves;
CREATE TABLE IF NOT EXISTS game_saves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    save_name VARCHAR(255) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    country_iso VARCHAR(10) NOT NULL,
    game_date VARCHAR(50) NOT NULL,
    capital VARCHAR(100) DEFAULT NULL,
    jumlah_penduduk BIGINT DEFAULT 0,
    anggaran BIGINT DEFAULT 0,
    ideology VARCHAR(100) DEFAULT NULL,
    religion VARCHAR(100) DEFAULT NULL,
    un_vote INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

`;

sqlFiles.forEach((fullPath) => {
  const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
  const content = fs.readFileSync(fullPath, 'utf8').trim();
  masterContent += `\n\n-- ========================================================\n-- SECTION: ${relPath}\n-- ========================================================\n\n${content}\n`;
});

masterContent += `\nSET FOREIGN_KEY_CHECKS = 1;\n`;

fs.writeFileSync(path.join(rootDir, 'db_presiden_simulator.sql'), masterContent, 'utf8');
console.log(`Rebuilt db_presiden_simulator.sql successfully from all ${sqlFiles.length} modules!`);
