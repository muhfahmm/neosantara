const fs = require('fs');
const path = require('path');

const profilesDir = 'd:/project-sendiri/em/json/semua_fitur_negara/0_profiles';
const outputBaseDir = 'd:/project-sendiri/em/json/database_doktrin_keterbukaan';

const continents = ['afrika', 'asia', 'eropa', 'na', 'oceania', 'sa'];

if (!fs.existsSync(outputBaseDir)) {
  fs.mkdirSync(outputBaseDir, { recursive: true });
}

continents.forEach(c => {
  const dirPath = path.join(outputBaseDir, c);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

let allExports = [];

continents.forEach(c => {
  const contDir = path.join(profilesDir, c);
  if (!fs.existsSync(contDir)) return;

  const files = fs.readdirSync(contDir).filter(f => f.endsWith('.ts'));

  files.forEach(file => {
    const filePath = path.join(contDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    let name_id = '';
    let name_en = '';
    let ideology = 'Demokrasi';
    let religion = '';

    const idMatch = content.match(/"name_id":\s*"([^"]+)"/);
    if (idMatch) name_id = idMatch[1];

    const enMatch = content.match(/"name_en":\s*"([^"]+)"/);
    if (enMatch) name_en = enMatch[1];

    const ideoMatch = content.match(/"ideology":\s*"([^"]+)"/);
    if (ideoMatch) ideology = ideoMatch[1];

    const relMatch = content.match(/"religion":\s*"([^"]+)"/);
    if (relMatch) religion = relMatch[1];

    // Determine baseline percentages based on ideology/country profile
    let speech = 60, religionSc = 65, demo = 55, transparency = 60;
    let media = 60, internet = 65, border = 50, trade = 65, diplomacy = 60;

    const lowerId = (name_id || name_en || '').toLowerCase();

    if (lowerId.includes('korea utara') || lowerId.includes('north korea')) {
      speech = 5; religionSc = 10; demo = 5; transparency = 10;
      media = 5; internet = 5; border = 5; trade = 15; diplomacy = 20;
    } else if (lowerId.includes('amerika') || lowerId.includes('united states') || lowerId.includes('singapura') || lowerId.includes('singapore') || lowerId.includes('swiss') || lowerId.includes('switzerland')) {
      speech = 90; religionSc = 90; demo = 85; transparency = 85;
      media = 90; internet = 95; border = 75; trade = 90; diplomacy = 85;
    } else if (ideology === 'Komunisme' || ideology === 'Otoritarianisme') {
      speech = 25; religionSc = 30; demo = 20; transparency = 30;
      media = 25; internet = 20; border = 30; trade = 40; diplomacy = 40;
    } else if (ideology === 'Monarki' || ideology === 'Konservatisme') {
      speech = 45; religionSc = 50; demo = 40; transparency = 45;
      media = 45; internet = 50; border = 45; trade = 55; diplomacy = 55;
    } else if (ideology === 'Liberalisme' || ideology === 'Demokrasi' || ideology === 'Kapitalisme') {
      speech = 75; religionSc = 80; demo = 70; transparency = 75;
      media = 75; internet = 80; border = 60; trade = 75; diplomacy = 70;
    }

    const varName = file.replace('.ts', '').replace(/^[0-9]+_/, '') + '_doktrin';

    const fileContent = `// @ts-nocheck
export const ${varName} = {
  country: "${name_id || name_en}",
  name_en: "${name_en}",
  ideology: "${ideology}",

  // --- 1. KEBEBASAN SIPIL & HAM ---
  speechScore: ${speech},
  religionScore: ${religionSc},
  demoScore: ${demo},
  transparencyScore: ${transparency},

  // --- 2. MEDIA & INFORMASI ---
  mediaScore: ${media},
  internetScore: ${internet},

  // --- 3. PERBATASAN & GEOPOLITIK ---
  borderScore: ${border},
  tradeScore: ${trade},
  diplomacyScore: ${diplomacy},

  // Indeks Keterbukaan Rata-rata
  opennessIndex: ${Math.round((speech + religionSc + demo + transparency + media + internet + border + trade + diplomacy) / 9)}
};
`;

    const outPath = path.join(outputBaseDir, c, file);
    fs.writeFileSync(outPath, fileContent, 'utf8');

    allExports.push({
      continent: c,
      file: file.replace('.ts', ''),
      varName,
      country: name_id || name_en,
      name_en,
    });
  });
});

// Create index.ts
let indexContent = `// @ts-nocheck\n`;

allExports.forEach(exp => {
  indexContent += `import { ${exp.varName} } from "./${exp.continent}/${exp.file}";\n`;
});

indexContent += `\nexport const DOKTRIN_KETERBUKAAN_DATABASE: Record<string, any> = {\n`;
allExports.forEach(exp => {
  if (exp.country) indexContent += `  "${exp.country.toLowerCase()}": ${exp.varName},\n`;
  if (exp.name_en && exp.name_en.toLowerCase() !== exp.country.toLowerCase()) {
    indexContent += `  "${exp.name_en.toLowerCase()}": ${exp.varName},\n`;
  }
});
indexContent += `};\n\n`;

indexContent += `export function getDoktrinKeterbukaan(countryName: string) {\n`;
indexContent += `  if (!countryName) return null;\n`;
indexContent += `  const key = countryName.toLowerCase().trim();\n`;
indexContent += `  return DOKTRIN_KETERBUKAAN_DATABASE[key] || null;\n`;
indexContent += `}\n`;

fs.writeFileSync(path.join(outputBaseDir, 'index.ts'), indexContent, 'utf8');

console.log(`Successfully generated ${allExports.length} doktrin keterbukaan country files across 6 continents and index.ts!`);
