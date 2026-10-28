const fs = require('fs');

const world = JSON.parse(fs.readFileSync('apps/public/world.geojson', 'utf-8'));
const mapDataText = fs.readFileSync('apps/src/app/page/map_system/map-data.ts', 'utf-8');
const countriesDataMatch = mapDataText.match(/export const COUNTRIES_DATA: CountryData\[\] = (\[[\s\S]*?\]);\s*export const CAPITALS_DATA/);
const COUNTRIES_DATA = eval(countriesDataMatch[1]);

const normalizeKey = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const colorForRelation = (relation) => {
  if (relation <= 25) return '#f87171'; // red
  if (relation <= 40) return '#fb7185'; // rose/pink
  if (relation <= 65) return '#facc15'; // yellow
  if (relation <= 80) return '#4ade80'; // light green
  return '#00FFAA'; // bright cyan/mint
};

// Asumsi DB relations untuk China
const { Pool } = require('pg');
const pool = new Pool({
  host: '127.0.0.1',
  user: 'postgres',
  password: 'Hiim_110407',
  database: 'db_presiden_simulator',
  port: 5432,
});

async function run() {
  const res = await pool.query("SELECT target_country, relation FROM database_hubungan_antar_negara WHERE country_slug = 'china'");
  const relationsDb = {};
  res.rows.forEach(r => {
    relationsDb[r.target_country.trim().toLowerCase()] = r.relation;
  });

  const featureResults = [];

  world.features.forEach((feature, idx) => {
    const properties = feature.properties;
    if (!properties) return;

    const isoKeys = [
      properties.ISO_A2,
      properties.ISO_A2_EH,
      properties.ISO_A3,
      properties.ISO_A3_EH,
    ].map(normalizeKey).filter(Boolean);
    const nameKeys = [
      properties.NAME,
      properties.ADMIN,
      properties.NAME_LONG,
      properties.GEOUNIT,
      properties.NAME_ID,
      properties.NAME_EN,
      properties.NAME_IND,
    ].map(normalizeKey).filter(Boolean);

    const country = COUNTRIES_DATA.find(candidate => {
      const countryIso = normalizeKey(candidate.iso);
      const countryName = normalizeKey(candidate.country);
      return isoKeys.includes(countryIso) ||
        nameKeys.includes(countryName) ||
        nameKeys.some(name => name.length > 4 && countryName.length > 4 &&
          (name.includes(countryName) || countryName.includes(name)));
    });

    if (country) {
      const rel = country.country.toLowerCase() === 'china' ? 100 : relationsDb[country.country.toLowerCase()];
      featureResults.push({
        idx,
        admin: properties.ADMIN || properties.NAME,
        matchedCountry: country.country,
        rel,
        color: colorForRelation(rel),
      });
    } else {
      featureResults.push({
        idx,
        admin: properties.ADMIN || properties.NAME,
        matchedCountry: null,
        rel: null,
        color: null,
      });
    }
  });

  const russia = featureResults.find(f => f.admin === 'Russia');
  const mongolia = featureResults.find(f => f.admin === 'Mongolia');
  const kazakhstan = featureResults.find(f => f.admin === 'Kazakhstan');
  const india = featureResults.find(f => f.admin === 'India');
  const china = featureResults.find(f => f.admin === 'China');

  console.log('Russia:', russia);
  console.log('Mongolia:', mongolia);
  console.log('Kazakhstan:', kazakhstan);
  console.log('India:', india);
  console.log('China:', china);

  await pool.end();
}

run();

