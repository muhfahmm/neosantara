import fs from 'node:fs';
import path from 'node:path';

export function normalizeSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function loadCountriesData(rootPath) {
  const mapDataPath = path.join(rootPath, 'apps/src/app/page/map_system/map-data.ts');
  const content = fs.readFileSync(mapDataPath, 'utf8');
  const startIdx = content.indexOf('export const COUNTRIES_DATA: CountryData[] = [');
  const endIdx = content.indexOf('];', startIdx);
  const jsonStr = content.substring(startIdx + 'export const COUNTRIES_DATA: CountryData[] = '.length, endIdx + 1);
  return JSON.parse(jsonStr);
}

export function parseSqlRows(sqlContent) {
  const lines = sqlContent.split('\n');
  const rows = [];
  const rowRegex = /\((\d+),\s*'([^']+)',\s*(\d+),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(rowRegex);
    if (match) {
      rows.push({
        id: parseInt(match[1]),
        country_id: parseInt(match[1]),
        country_slug: match[2],
        mitra_no: parseInt(match[3]),
        mitra_country: match[4],
        embassy_type: match[5],
        status: match[6],
        lineNumber: i + 1,
      });
    }
  }
  return rows;
}

export function runEmbassyAudit(rootPath, customSqlContent) {
  const countries = loadCountriesData(rootPath);
  const sqlPath = path.join(rootPath, 'json/6_database_kedutaan_besar/database_kedutaan_besar.pg.sql');
  const sqlContent = customSqlContent !== undefined ? customSqlContent : fs.readFileSync(sqlPath, 'utf8');
  const rows = parseSqlRows(sqlContent);

  const countryBySlug = new Map();
  countries.forEach(c => countryBySlug.set(normalizeSlug(c.country), c));

  const slugToCanonicalName = new Map();
  countries.forEach(c => slugToCanonicalName.set(normalizeSlug(c.country), c.country));
  // Preserve exact casing found in existing database mitra_country
  rows.forEach(r => {
    slugToCanonicalName.set(normalizeSlug(r.mitra_country), r.mitra_country);
  });

  const pairToRow = new Map();
  const existingPairs = new Set();
  const selfEmbassies = [];
  const duplicates = [];
  const unknownCountries = [];
  const unmappedMitraSet = new Set();

  for (const r of rows) {
    const ownerSlug = r.country_slug;
    const hostSlug = normalizeSlug(r.mitra_country);

    if (!countryBySlug.has(ownerSlug)) {
      unknownCountries.push(r);
    }
    if (!countryBySlug.has(hostSlug)) {
      unmappedMitraSet.add(r.mitra_country);
    }
    if (ownerSlug === hostSlug) {
      selfEmbassies.push(r);
    }

    const pairKey = `${ownerSlug}->${hostSlug}`;
    if (existingPairs.has(pairKey)) {
      duplicates.push(r);
    }
    existingPairs.add(pairKey);
    if (!pairToRow.has(pairKey)) {
      pairToRow.set(pairKey, r);
    }
  }

  const asymmetricList = [];
  const missingCounts = new Map();

  for (const pair of existingPairs) {
    const [a, b] = pair.split('->');
    const reversePair = `${b}->${a}`;
    if (!existingPairs.has(reversePair)) {
      const rowA = pairToRow.get(pair);
      const countryAName = slugToCanonicalName.get(a) || a;
      const countryBName = slugToCanonicalName.get(b) || b;
      asymmetricList.push({
        countryA: countryAName,
        countryB: countryBName,
        countryASlug: a,
        countryBSlug: b,
        sourceLine: rowA.lineNumber || 0,
        action: 'Ditambahkan balasan (simetri)',
      });
      missingCounts.set(b, (missingCounts.get(b) || 0) + 1);
    }
  }

  // Sort asymmetric list by Country A
  asymmetricList.sort((x, y) => x.countryA.localeCompare(y.countryA) || x.countryB.localeCompare(y.countryB));

  const missingByCountry = Array.from(missingCounts.entries())
    .map(([slug, missingCount]) => ({
      slug,
      countryName: slugToCanonicalName.get(slug) || slug,
      missingCount,
    }))
    .sort((x, y) => y.missingCount - x.missingCount);

  // Per country stats
  const beforeCounts = new Map();
  countries.forEach(c => beforeCounts.set(normalizeSlug(c.country), 0));
  rows.forEach(r => beforeCounts.set(r.country_slug, (beforeCounts.get(r.country_slug) || 0) + 1));

  const perCountryStats = countries.map(c => {
    const slug = normalizeSlug(c.country);
    const countBefore = beforeCounts.get(slug) || 0;
    const countToAdd = missingCounts.get(slug) || 0;
    return {
      country: slugToCanonicalName.get(slug) || c.country,
      slug,
      countBefore,
      countToAdd,
      countAfter: countBefore + countToAdd,
    };
  }).sort((a, b) => a.country.localeCompare(b.country));

  return {
    totalSqlRows: rows.length,
    totalCountries: countries.length,
    distinctCountrySlugs: new Set(rows.map(r => r.country_slug)).size,
    distinctMitraCountries: new Set(rows.map(r => r.mitra_country)).size,
    directedPairsCount: existingPairs.size,
    symmetricPairsCount: (existingPairs.size - asymmetricList.length) / 2,
    asymmetricPairsCount: asymmetricList.length,
    selfEmbassies,
    duplicates,
    unknownCountries,
    unmappedMitra: Array.from(unmappedMitraSet),
    asymmetricList,
    missingByCountry,
    perCountryStats,
  };
}

if (process.argv[1] && process.argv[1].endsWith('audit-embassies.mjs')) {
  const root = process.cwd();
  const audit = runEmbassyAudit(root);
  console.log('--- EMBASSY AUDIT RESULT ---');
  console.log('Total SQL Rows:', audit.totalSqlRows);
  console.log('Directed Pairs:', audit.directedPairsCount);
  console.log('Symmetric Pairs:', audit.symmetricPairsCount);
  console.log('Asymmetric Pairs:', audit.asymmetricPairsCount);
  console.log('Self Embassies:', audit.selfEmbassies.length);
  console.log('Duplicates:', audit.duplicates.length);
  console.log('Top 10 Missing:');
  console.log(audit.missingByCountry.slice(0, 10));
}
