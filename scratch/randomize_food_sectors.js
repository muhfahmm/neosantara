const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const targetFiles = [
  'json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/database_sektor_peternakan.sql',
  'json/semua_fitur_negara/1_pembangunan/1_produksi/5_sektor_agrikultur/database_sektor_agrikultur.sql',
  'json/semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/database_sektor_perikanan.sql',
  'json/semua_fitur_negara/1_pembangunan/1_produksi/7_sektor_olahan_pangan/database_sektor_olahan_pangan.sql'
];

function randomizeVal(val) {
  const num = parseInt(val, 10);
  if (isNaN(num)) return val;
  
  if (num <= 10) {
    // Randomize baseline numbers to 8-10
    return Math.floor(Math.random() * 3) + 8;
  } else {
    // Variations based on previous value (±5% or min ±2)
    const maxOffset = Math.max(2, Math.round(num * 0.05));
    const offset = Math.floor(Math.random() * (maxOffset * 2 + 1)) - maxOffset;
    return Math.max(11, num + offset);
  }
}

targetFiles.forEach((relPath) => {
  const fullPath = path.join(rootDir, relPath);
  let sqlContent = fs.readFileSync(fullPath, 'utf8');

  // Replace tuple values in INSERT statements
  // Tuple format: (id, 'Name', 'slug', val1, val2, ...)
  const updatedContent = sqlContent.replace(/\((\d+),\s*('[^']*(?:''[^']*)*'),\s*('[^']*(?:''[^']*)*'),\s*([\d,\s]+)\)/g, (match, id, name, slug, numbersStr) => {
    const numbers = numbersStr.split(',').map(s => s.trim());
    const randomizedNumbers = numbers.map(n => randomizeVal(n));
    return `(${id}, ${name}, ${slug}, ${randomizedNumbers.join(', ')})`;
  });

  fs.writeFileSync(fullPath, updatedContent, 'utf8');
  console.log(`Updated randomized values for: ${relPath}`);
});

console.log('Randomization complete!');
