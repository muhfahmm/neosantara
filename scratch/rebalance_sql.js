const fs = require('fs');
const path = require('path');

// 1. Read PROFILES_DATA from index.ts
const indexPath = path.join(__dirname, '../apps/src/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/2_tempat_umum'); // reference path
const profilesFile = fs.readFileSync(path.join(__dirname, '../json/semua_fitur_negara/0_profiles/index.ts'), 'utf8');

const profilesMatch = profilesFile.match(/export const PROFILES_DATA: CountryProfile\[\] = (\[[\s\S]*?\]);/);
if (!profilesMatch) {
  console.error("Could not parse PROFILES_DATA from index.ts");
  process.exit(1);
}

const profilesData = eval(profilesMatch[1]);
console.log(`Loaded ${profilesData.length} country profiles.`);

// Calculate GDP per capita for each country
const countryWealthMap = {};
profilesData.forEach((p) => {
  const pop = Number(p.jumlah_penduduk) || 1;
  const inc = Number(p.pendapatan_nasional) || 1;
  const gdpPerCapita = (inc * 1000000) / pop;
  countryWealthMap[p.id] = {
    ...p,
    gdpPerCapita,
  };
});

// Sort to find percentiles
const sortedProfiles = [...profilesData].sort((a, b) => {
  const gdpA = (a.pendapatan_nasional * 1000000) / a.jumlah_penduduk;
  const gdpB = (b.pendapatan_nasional * 1000000) / b.jumlah_penduduk;
  return gdpA - gdpB;
});

const totalCount = sortedProfiles.length;

// Assign wealth factor and category
profilesData.forEach((p) => {
  const rankIndex = sortedProfiles.findIndex((sp) => sp.id === p.id);
  const percentile = rankIndex / totalCount; // 0.0 (poorest) to 1.0 (richest)

  let tier = 'menengah';
  let factor = 0.55; // Default middle
  let harapanHidup = 72;
  let indeksKesehatan = 70;
  let indeksKorupsi = 55;
  let indeksKeamanan = 65;

  if (percentile >= 0.70) {
    // Rich countries (Top 30%)
    tier = 'kaya';
    // Factor 0.75 - 0.95 based on percentile
    factor = 0.75 + (percentile - 0.70) * (0.20 / 0.30);
    harapanHidup = Math.round(78 + (percentile - 0.70) * (6 / 0.30));
    indeksKesehatan = Math.round(85 + (percentile - 0.70) * (13 / 0.30));
    indeksKorupsi = Math.round(80 + (percentile - 0.70) * (15 / 0.30));
    indeksKeamanan = Math.round(85 + (percentile - 0.70) * (10 / 0.30));
  } else if (percentile <= 0.30) {
    // Poor countries (Bottom 30%)
    tier = 'miskin';
    // Factor 0.15 - 0.38
    factor = 0.15 + (percentile / 0.30) * 0.23;
    harapanHidup = Math.round(55 + (percentile / 0.30) * 10);
    indeksKesehatan = Math.round(35 + (percentile / 0.30) * 20);
    indeksKorupsi = Math.round(20 + (percentile / 0.30) * 20);
    indeksKeamanan = Math.round(35 + (percentile / 0.30) * 20);
  } else {
    // Middle countries (Middle 40%)
    tier = 'menengah';
    factor = 0.40 + ((percentile - 0.30) / 0.40) * 0.30;
    harapanHidup = Math.round(65 + ((percentile - 0.30) / 0.40) * 12);
    indeksKesehatan = Math.round(55 + ((percentile - 0.30) / 0.40) * 28);
    indeksKorupsi = Math.round(40 + ((percentile - 0.30) / 0.40) * 38);
    indeksKeamanan = Math.round(55 + ((percentile - 0.30) / 0.40) * 28);
  }

  countryWealthMap[p.id] = {
    ...countryWealthMap[p.id],
    tier,
    factor,
    harapanHidup,
    indeksKesehatan,
    indeksKorupsi,
    indeksKeamanan,
  };
});

console.log("Sample country tiers:");
console.log("USA (152):", countryWealthMap[152]);
console.log("Indonesia (67):", countryWealthMap[67]);
console.log("Burundi (7):", countryWealthMap[7]);

// Function to generate SQL content
function generateSQL(tableName, columns, rowGenerator) {
  let header = `-- ${tableName} SQL Export\n-- Total ${profilesData.length} Negara\n\n`;
  header += `DROP TABLE IF EXISTS ${tableName};\n`;
  header += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
  header += `    id INT PRIMARY KEY,\n    country VARCHAR(100) NOT NULL,\n    country_slug VARCHAR(100) NOT NULL,\n`;
  header += columns.map(c => `    ${c.name} ${c.type} NOT NULL DEFAULT ${c.default}`).join(',\n');
  header += `\n);\n\nINSERT INTO ${tableName} (\n    id, country, country_slug, ${columns.map(c => c.name).join(', ')}\n) VALUES\n`;

  const rows = profilesData.map((p) => {
    const cData = countryWealthMap[p.id];
    const vals = rowGenerator(p, cData);
    const escapedName = p.name_id.replace(/'/g, "''");
    return `    (${p.id}, '${escapedName}', '${p.country_slug}', ${vals.join(', ')})`;
  });

  return header + rows.join(',\n') + ';\n';
}

// 1. DATABASE INFRASTRUKTUR
const infraSQL = generateSQL(
  'database_infrastruktur',
  [
    { name: 'jalur_sepeda', type: 'INT', default: 0 },
    { name: 'jalan_raya', type: 'INT', default: 0 },
    { name: 'terminal_bus', type: 'INT', default: 0 },
    { name: 'stasiun_kereta_api', type: 'INT', default: 0 },
    { name: 'kereta_bawah_tanah', type: 'INT', default: 0 },
    { name: 'pelabuhan', type: 'INT', default: 0 },
    { name: 'bandara', type: 'INT', default: 0 },
    { name: 'helipad', type: 'INT', default: 0 },
  ],
  (p, c) => {
    const pop = p.jumlah_penduduk;
    const f = c.factor;
    const targetTotal = pop * 0.00005 * f;
    const targetPerItem = Math.max(1, Math.ceil(targetTotal / 8));
    return [
      Math.max(1, Math.ceil(targetPerItem * 0.8)),
      Math.max(1, Math.ceil(targetPerItem * 1.5)),
      Math.max(1, Math.ceil(targetPerItem * 0.6)),
      Math.max(1, Math.ceil(targetPerItem * 0.4)),
      c.tier === 'kaya' ? Math.max(1, Math.ceil(targetPerItem * 0.2)) : Math.ceil(targetPerItem * 0.05),
      Math.max(1, Math.ceil(targetPerItem * 0.2)),
      Math.max(1, Math.ceil(targetPerItem * 0.15)),
      Math.max(1, Math.ceil(targetPerItem * 0.25)),
    ];
  }
);

// 2. DATABASE PENDIDIKAN
const pendidikanSQL = generateSQL(
  'database_pendidikan',
  [
    { name: 'prasekolah', type: 'INT', default: 0 },
    { name: 'dasar', type: 'INT', default: 0 },
    { name: 'menengah', type: 'INT', default: 0 },
    { name: 'lanjutan', type: 'INT', default: 0 },
    { name: 'universitas', type: 'INT', default: 0 },
    { name: 'lembaga_pendidikan', type: 'INT', default: 0 },
    { name: 'laboratorium', type: 'INT', default: 0 },
    { name: 'observatorium', type: 'INT', default: 0 },
    { name: 'pusat_penelitian', type: 'INT', default: 0 },
    { name: 'pusat_pengembangan', type: 'INT', default: 0 },
    { name: 'literasi', type: 'INT', default: 0 },
  ],
  (p, c) => {
    const pop = p.jumlah_penduduk;
    const f = c.factor;
    const targetTotal = pop * 0.0001 * f;
    const targetPerItem = Math.max(1, Math.ceil(targetTotal / 11));
    return [
      Math.max(1, Math.ceil(targetPerItem * 1.4)),
      Math.max(1, Math.ceil(targetPerItem * 1.8)),
      Math.max(1, Math.ceil(targetPerItem * 1.6)),
      Math.max(1, Math.ceil(targetPerItem * 1.2)),
      Math.max(1, Math.ceil(targetPerItem * 0.6)),
      Math.max(1, Math.ceil(targetPerItem * 0.5)),
      Math.max(1, Math.ceil(targetPerItem * 0.3)),
      Math.max(1, Math.ceil(targetPerItem * 0.1)),
      Math.max(1, Math.ceil(targetPerItem * 0.3)),
      Math.max(1, Math.ceil(targetPerItem * 0.3)),
      Math.max(1, Math.ceil(targetPerItem * 0.2)),
    ];
  }
);

// 3. DATABASE KESEHATAN
const kesehatanSQL = generateSQL(
  'database_kesehatan',
  [
    { name: 'rumah_sakit_besar', type: 'INT', default: 0 },
    { name: 'rumah_sakit_kecil', type: 'INT', default: 0 },
    { name: 'pusat_diagnostik', type: 'INT', default: 0 },
    { name: 'harapan_hidup', type: 'INT', default: 0 },
    { name: 'indeks_kesehatan', type: 'INT', default: 0 },
  ],
  (p, c) => {
    const pop = p.jumlah_penduduk;
    const f = c.factor;
    const targetTotal = pop * 0.00004 * f;
    const targetPerItem = Math.max(1, Math.ceil(targetTotal / 3));
    return [
      Math.max(1, Math.ceil(targetPerItem * 0.4)),
      Math.max(1, Math.ceil(targetPerItem * 1.2)),
      Math.max(1, Math.ceil(targetPerItem * 0.6)),
      c.harapanHidup,
      c.indeksKesehatan,
    ];
  }
);

// 4. DATABASE HUKUM
const hukumSQL = generateSQL(
  'database_hukum',
  [
    { name: 'pusat_bantuan_hukum', type: 'INT', default: 0 },
    { name: 'pengadilan', type: 'INT', default: 0 },
    { name: 'kejaksaan', type: 'INT', default: 0 },
    { name: 'pos_polisi', type: 'INT', default: 0 },
    { name: 'armada_mobil_polisi', type: 'INT', default: 0 },
    { name: 'akademi_polisi', type: 'INT', default: 0 },
    { name: 'indeks_korupsi', type: 'INT', default: 0 },
    { name: 'indeks_keamanan', type: 'INT', default: 0 },
  ],
  (p, c) => {
    const pop = p.jumlah_penduduk;
    const f = c.factor;
    const targetTotal = pop * (1 / 15000) * f;
    const targetPerItem = Math.max(1, Math.ceil(targetTotal / 6));
    const cars = Math.max(10, Math.ceil(pop * 0.002 * f));
    return [
      Math.max(1, Math.ceil(targetPerItem * 0.6)),
      Math.max(1, Math.ceil(targetPerItem * 0.8)),
      Math.max(1, Math.ceil(targetPerItem * 0.6)),
      Math.max(1, Math.ceil(targetPerItem * 1.5)),
      cars,
      Math.max(1, Math.ceil(targetPerItem * 0.2)),
      c.indeksKorupsi,
      c.indeksKeamanan,
    ];
  }
);

// 5. DATABASE OLAHRAGA
const olahragaSQL = generateSQL(
  'database_olahraga',
  [
    { name: 'kolam_renang', type: 'INT', default: 0 },
    { name: 'sirkuit_balap', type: 'INT', default: 0 },
    { name: 'stadion', type: 'INT', default: 0 },
    { name: 'stadion_internasional', type: 'INT', default: 0 },
    { name: 'gym', type: 'INT', default: 0 },
    { name: 'golf', type: 'INT', default: 0 },
    { name: 'esports', type: 'INT', default: 0 },
    { name: 'gokart', type: 'INT', default: 0 },
  ],
  (p, c) => {
    const pop = p.jumlah_penduduk;
    const f = c.factor;
    const targetTotal = pop * 0.00008 * f;
    const targetPerItem = Math.max(1, Math.ceil(targetTotal / 8));
    return [
      Math.max(1, Math.ceil(targetPerItem * 1.0)),
      Math.max(1, Math.ceil(targetPerItem * 0.1)),
      Math.max(1, Math.ceil(targetPerItem * 0.5)),
      Math.max(1, Math.ceil(targetPerItem * 0.1)),
      Math.max(1, Math.ceil(targetPerItem * 2.0)),
      Math.max(1, Math.ceil(targetPerItem * 0.3)),
      Math.max(1, Math.ceil(targetPerItem * 0.4)),
      Math.max(1, Math.ceil(targetPerItem * 0.5)),
    ];
  }
);

// 6. DATABASE KOMERSIAL
const komersialSQL = generateSQL(
  'database_komersial',
  [
    { name: 'mall', type: 'INT', default: 0 },
    { name: 'hotel', type: 'INT', default: 0 },
    { name: 'pusat_grosir_tekstil', type: 'INT', default: 0 },
  ],
  (p, c) => {
    const pop = p.jumlah_penduduk;
    const f = c.factor;
    const targetTotal = pop * 0.00002 * f;
    const targetPerItem = Math.max(1, Math.ceil(targetTotal / 3));
    return [
      Math.max(1, Math.ceil(targetPerItem * 0.6)),
      Math.max(1, Math.ceil(targetPerItem * 1.5)),
      Math.max(1, Math.ceil(targetPerItem * 0.5)),
    ];
  }
);

// 7. DATABASE HIBURAN
const hiburanSQL = generateSQL(
  'database_hiburan',
  [
    { name: 'bioskop', type: 'INT', default: 0 },
    { name: 'teater', type: 'INT', default: 0 },
  ],
  (p, c) => {
    const pop = p.jumlah_penduduk;
    const f = c.factor;
    const targetTotal = pop * 0.00004 * f;
    const targetPerItem = Math.max(1, Math.ceil(targetTotal / 2));
    return [
      Math.max(1, Math.ceil(targetPerItem * 1.2)),
      Math.max(1, Math.ceil(targetPerItem * 0.5)),
    ];
  }
);

// 8. DATABASE HUNIAN PERMUKIMAN
const hunianSQL = generateSQL(
  'database_hunian_permukiman',
  [
    { name: 'rumah_subsidi', type: 'INT', default: 0 },
    { name: 'apartemen', type: 'INT', default: 0 },
    { name: 'mansion', type: 'INT', default: 0 },
  ],
  (p, c) => {
    const pop = p.jumlah_penduduk;
    const f = c.factor;
    const capacityTarget = pop * f;
    const subCap = capacityTarget * 0.50;
    const aptCap = capacityTarget * 0.40;
    const manCap = capacityTarget * 0.10;

    return [
      Math.max(10, Math.ceil(subCap / 4)),
      Math.max(2, Math.ceil(aptCap / 50)),
      Math.max(1, Math.ceil(manCap / 8)),
    ];
  }
);

// Save individual SQL files
const basePath = path.join(__dirname, '../json/semua_fitur_negara/1_pembangunan/2_tempat_umum');

const fileMap = {
  '1_Layanan Publik/1_infrastruktur/database_infrastruktur.sql': infraSQL,
  '1_Layanan Publik/2_pendidikan/database_pendidikan.sql': pendidikanSQL,
  '1_Layanan Publik/3_kesehatan/database_kesehatan.sql': kesehatanSQL,
  '1_Layanan Publik/4_hukum/database_hukum.sql': hukumSQL,
  '1_Layanan Publik/5_olahraga/database_olahraga.sql': olahragaSQL,
  '1_Layanan Publik/6_komersial/database_komersial.sql': komersialSQL,
  '1_Layanan Publik/7_hiburan/database_hiburan.sql': hiburanSQL,
  '2_hunian_permukiman/database_hunian_permukiman.sql': hunianSQL,
};

Object.entries(fileMap).forEach(([relPath, content]) => {
  const fullPath = path.join(basePath, relPath);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated: ${relPath}`);
});

// Update root master SQL: db_presiden_simulator.sql
const masterPath = path.join(__dirname, '../db_presiden_simulator.sql');
let masterSQL = fs.readFileSync(masterPath, 'utf8');

const tableToSqlMap = {
  'database_infrastruktur': infraSQL,
  'database_pendidikan': pendidikanSQL,
  'database_kesehatan': kesehatanSQL,
  'database_hukum': hukumSQL,
  'database_olahraga': olahragaSQL,
  'database_komersial': komersialSQL,
  'database_hiburan': hiburanSQL,
  'database_hunian_permukiman': hunianSQL,
};

Object.entries(tableToSqlMap).forEach(([tblName, newSql]) => {
  const sectionHeader = `-- SECTION: json\\semua_fitur_negara\\1_pembangunan\\2_tempat_umum\\`;
  // Replace the table section in master file
  const regex = new RegExp(`(-- SECTION: [^\\n]*${tblName}\\.sql[\\s\\S]*?)(?=\\n-- ========================================================|$)`);
  const match = masterSQL.match(regex);
  if (match) {
    const fullMatch = match[0];
    const sectionLine = fullMatch.split('\n')[0];
    const updatedSection = `${sectionLine}\n\n${newSql.trim()}\n\n`;
    masterSQL = masterSQL.replace(fullMatch, updatedSection);
    console.log(`Master SQL updated section for: ${tblName}`);
  } else {
    console.warn(`Section for ${tblName} not found in master SQL`);
  }
});

fs.writeFileSync(masterPath, masterSQL, 'utf8');
console.log("Master SQL update completed successfully!");
