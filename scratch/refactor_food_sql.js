const fs = require('fs');
const path = require('path');

// 1. Data Kebutuhan Per Capita (per 1.000 penduduk per hari)
const FOOD_CONSUMPTION_PER_CAPITA = {
  // Peternakan
  ayam_unggas: 0.15,
  sapi_potong: 0.08,
  sapi_perah: 0.12,
  domba_kambing: 0.05,
  // Agrikultur
  padi: 0.35,
  gandum: 0.24,
  jagung: 0.18,
  sayur: 0.30,
  umbi: 0.20,
  kedelai: 0.15,
  kelapa_sawit: 0.10,
  kopi: 0.05,
  teh: 0.06,
  kakao: 0.04,
  tebu: 0.15,
  karet: 0.02,
  // Perikanan
  udang: 0.08,
  ikan: 0.25,
  mutiara: 0.01,
  // Olahan Pangan
  air_mineral: 0.05,
  garam: 0.0005,
  gula: 0.0015,
  roti: 0.18,
  pengolahan_daging: 0.10,
  mie_instan: 0.25,
  minyak_goreng: 0.10,
  susu: 0.15,
  beras: 0.35,
};

// 2. Data Base Produksi Per Bangunan
const BASE_PRODUKSI = {
  // Peternakan
  ayam_unggas: 150,
  sapi_perah: 150,
  sapi_potong: 120,
  domba_kambing: 180,
  // Agrikultur
  padi: 200,
  gandum: 150,
  jagung: 80,
  sayur: 65,
  umbi: 50,
  kedelai: 25,
  kelapa_sawit: 150,
  kopi: 25,
  teh: 25,
  kakao: 10,
  tebu: 85,
  karet: 35,
  // Perikanan
  udang: 25,
  ikan: 30,
  mutiara: 15,
  // Olahan Pangan
  air_mineral: 1000,
  gula: 250,
  roti: 150,
  pengolahan_daging: 120,
  mie_instan: 500,
  minyak_goreng: 250,
  susu: 180,
  beras: 300,
};

const TARGET_SURPLUS = 200; 

// Parse file Profiles
const profilesPath = path.join(__dirname, '../json/semua_fitur_negara/0_profiles/database_profiles_negara.sql');
const profilesSql = fs.readFileSync(profilesPath, 'utf8');

const profiles = [];
const profileLines = profilesSql.split('\n');

for (const line of profileLines) {
  const match = line.match(/\((\d+),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+)/);
  if (match) {
    profiles.push({
      id: parseInt(match[1], 10),
      country_slug: match[2],
      name_id: match[3],
      jumlah_penduduk: parseInt(match[9], 10)
    });
  }
}

const computeBuildingCounts = (pop) => {
  // A. Olahan Pangan
  const olahanKeys = ['air_mineral', 'gula', 'roti', 'pengolahan_daging', 'mie_instan', 'minyak_goreng', 'susu', 'beras'];
  const olahanCount = {};
  for (const k of olahanKeys) {
    const popCons = (pop / 1000) * FOOD_CONSUMPTION_PER_CAPITA[k];
    const targetProd = popCons + TARGET_SURPLUS;
    olahanCount[k] = Math.max(10, Math.ceil(targetProd / BASE_PRODUKSI[k]));
  }

  // Konsumsi Pabrik Olahan terhadap Bahan Baku Mentah
  const rawFactoryCons = {
    padi: (olahanCount.beras || 0) * 10,
    tebu: (olahanCount.gula || 0) * 10,
    gandum: ((olahanCount.roti || 0) * 15) + ((olahanCount.mie_instan || 0) * 20),
    kelapa_sawit: (olahanCount.minyak_goreng || 0) * 12,
    sapi_perah: (olahanCount.susu || 0) * 8,
    ayam_unggas: (olahanCount.pengolahan_daging || 0) * 5,
    sapi_potong: (olahanCount.pengolahan_daging || 0) * 2,
    domba_kambing: (olahanCount.pengolahan_daging || 0) * 3,
  };

  // B. Peternakan
  const peternakanKeys = ['ayam_unggas', 'sapi_perah', 'sapi_potong', 'domba_kambing'];
  const peternakanCount = {};
  for (const k of peternakanKeys) {
    const popCons = (pop / 1000) * FOOD_CONSUMPTION_PER_CAPITA[k];
    const facCons = rawFactoryCons[k] || 0;
    const targetProd = popCons + facCons + TARGET_SURPLUS;
    peternakanCount[k] = Math.max(10, Math.ceil(targetProd / BASE_PRODUKSI[k]));
  }

  // C. Agrikultur
  const agrikulturKeys = ['padi', 'gandum', 'jagung', 'sayur', 'umbi', 'kedelai', 'kelapa_sawit', 'kopi', 'teh', 'kakao', 'tebu', 'karet'];
  const agrikulturCount = {};
  for (const k of agrikulturKeys) {
    const popCons = (pop / 1000) * FOOD_CONSUMPTION_PER_CAPITA[k];
    const facCons = rawFactoryCons[k] || 0;
    const targetProd = popCons + facCons + TARGET_SURPLUS;
    agrikulturCount[k] = Math.max(10, Math.ceil(targetProd / BASE_PRODUKSI[k]));
  }

  // D. Perikanan
  const perikananKeys = ['udang', 'mutiara', 'ikan'];
  const perikananCount = {};
  for (const k of perikananKeys) {
    const popCons = (pop / 1000) * (FOOD_CONSUMPTION_PER_CAPITA[k] || 0);
    const targetProd = popCons + TARGET_SURPLUS;
    perikananCount[k] = Math.max(10, Math.ceil(targetProd / BASE_PRODUKSI[k]));
  }

  return { olahanCount, peternakanCount, agrikulturCount, perikananCount, rawFactoryCons };
};

// Refactor 4 File SQL
const updateSqlFile = (filePath, tableName, columns, computeKey) => {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const newLines = [];
  let inValues = false;

  for (let line of lines) {
    if (line.includes(`INSERT INTO \`${tableName}\``)) {
      inValues = true;
      newLines.push(line);
      continue;
    }

    if (inValues && line.trim().startsWith('(')) {
      // Parse record: (id, 'country', 'country_slug', col1, col2, ...)
      const match = line.match(/^\((\d+),\s*'([^']+)',\s*'([^']+)',\s*(.*)\),?$/);
      if (match) {
        const id = parseInt(match[1], 10);
        const country = match[2];
        const country_slug = match[3];
        const isLast = line.trim().endsWith(';');

        const profile = profiles.find(p => p.id === id || p.country_slug === country_slug);
        const pop = profile ? profile.jumlah_penduduk : 10000000;
        const calc = computeBuildingCounts(pop);
        const countsMap = calc[computeKey];

        const newVals = columns.map(col => countsMap[col] || 10);
        const newLine = `(${id}, '${country}', '${country_slug}', ${newVals.join(', ')})${isLast ? ';' : ','}`;
        newLines.push(newLine);
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }

  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log(`Updated SQL file: ${filePath}`);
};

// Execute refactor
updateSqlFile(
  path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/database_sektor_peternakan.sql'),
  'database_sektor_peternakan',
  ['ayam_unggas', 'sapi_perah', 'sapi_potong', 'domba_kambing'],
  'peternakanCount'
);

updateSqlFile(
  path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/5_sektor_agrikultur/database_sektor_agrikultur.sql'),
  'database_sektor_agrikultur',
  ['padi', 'gandum', 'jagung', 'sayur', 'umbi', 'kedelai', 'kelapa_sawit', 'kopi', 'teh', 'kakao', 'tebu', 'karet'],
  'agrikulturCount'
);

updateSqlFile(
  path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/database_sektor_perikanan.sql'),
  'database_sektor_perikanan',
  ['udang', 'mutiara', 'ikan'],
  'perikananCount'
);

updateSqlFile(
  path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/1_produksi/7_sektor_olahan_pangan/database_sektor_olahan_pangan.sql'),
  'database_sektor_olahan_pangan',
  ['air_mineral', 'gula', 'roti', 'pengolahan_daging', 'mie_instan', 'minyak_goreng', 'susu', 'beras'],
  'olahanCount'
);
