const fs = require('fs');

const world = JSON.parse(fs.readFileSync('apps/public/world.geojson', 'utf-8'));
console.log('Total features in world.geojson:', world.features.length);

const normalizeKey = (val) => String(val || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Kita load COUNTRIES_DATA dari map-data.ts
// Parse manual atau regex
const mapDataText = fs.readFileSync('apps/src/app/page/map_system/map-data.ts', 'utf-8');
const countriesDataMatch = mapDataText.match(/export const COUNTRIES_DATA: CountryData\[\] = (\[[\s\S]*?\]);\s*export const CAPITALS_DATA/);

let COUNTRIES_DATA = [];
if (countriesDataMatch) {
  try {
    COUNTRIES_DATA = eval(countriesDataMatch[1]);
  } catch (e) {
    console.error('Eval error:', e);
  }
}
console.log('Parsed COUNTRIES_DATA length:', COUNTRIES_DATA.length);

// Sekarang kita test matching untuk Russia dan Mongolia
world.features.forEach((feature, idx) => {
  const props = feature.properties || {};
  const name = props.NAME || props.ADMIN;
  if (['Russia', 'Mongolia', 'China', 'Kazakhstan', 'India'].includes(name)) {
    const isoKeys = [
      props.ISO_A2, props.ISO_A2_EH, props.ISO_A3, props.ISO_A3_EH
    ].map(normalizeKey).filter(Boolean);
    const nameKeys = [
      props.NAME, props.ADMIN, props.NAME_LONG, props.GEOUNIT,
      props.NAME_ID, props.NAME_EN, props.NAME_IND
    ].map(normalizeKey).filter(Boolean);

    const matched = COUNTRIES_DATA.find(candidate => {
      const countryIso = normalizeKey(candidate.iso);
      const countryName = normalizeKey(candidate.country);
      return isoKeys.includes(countryIso) ||
        nameKeys.includes(countryName) ||
        nameKeys.some(n => n.length > 4 && countryName.length > 4 &&
          (n.includes(countryName) || countryName.includes(n)));
    });

    console.log(`Feature ${name} (idx ${idx}):`, matched ? `MATCHED to candidate.country = "${matched.country}" (iso: ${matched.iso})` : 'NO MATCH');
  }
});

