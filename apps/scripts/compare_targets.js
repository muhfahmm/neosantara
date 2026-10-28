const fs = require('fs');

const mapDataText = fs.readFileSync('apps/src/app/page/map_system/map-data.ts', 'utf-8');
const countriesDataMatch = mapDataText.match(/export const COUNTRIES_DATA: CountryData\[\] = (\[[\s\S]*?\]);\s*export const CAPITALS_DATA/);
const COUNTRIES_DATA = eval(countriesDataMatch[1]);

// Cek apakah ada c.country di COUNTRIES_DATA yang jika di-lookup ke relationsDb menghasilkan null/fallback
const { Pool } = require('pg');
const pool = new Pool({
  host: '127.0.0.1',
  user: 'postgres',
  password: 'Hiim_110407',
  database: 'db_presiden_simulator',
  port: 5432,
});

async function run() {
  const res = await pool.query("SELECT country_slug, target_country, relation FROM database_hubungan_antar_negara WHERE country_slug = 'china'");
  const relationsDb = {};
  res.rows.forEach(r => {
    relationsDb[r.target_country.trim().toLowerCase()] = r.relation;
  });

  console.log('Total targets in DB for China:', Object.keys(relationsDb).length);

  const matched = [];
  const unmatched = [];

  COUNTRIES_DATA.forEach(c => {
    const raw = c.country.trim().toLowerCase();
    if (raw === 'china') return;
    if (relationsDb[raw] !== undefined) {
      matched.push({ name: c.country, rel: relationsDb[raw] });
    } else {
      unmatched.push(c.country);
    }
  });

  console.log(`Matched: ${matched.length}, Unmatched: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log('Unmatched countries:', unmatched);
  }

  // Cek apakah ada nama di DB yang tidak ter-match
  const dbTargets = Object.keys(relationsDb);
  const unmatchedDb = dbTargets.filter(d => !COUNTRIES_DATA.some(c => c.country.trim().toLowerCase() === d));
  console.log('Unmatched DB targets:', unmatchedDb);

  await pool.end();
}

run();

