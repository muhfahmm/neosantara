const fs = require('fs');

// Baca relationsRegistry.ts
const relationsRegistryCode = fs.readFileSync('json/4_database_hubungan_antar_negara/relationsRegistry.ts', 'utf-8');

// Kita load data DB untuk China
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Hiim_110407',
  database: process.env.DB_NAME || 'db_presiden_simulator',
  port: 5432,
});

async function run() {
  const res = await pool.query("SELECT country_slug, target_country, relation FROM database_hubungan_antar_negara WHERE country_slug = 'china'");
  console.log(`Loaded ${res.rows.length} rows for China`);
  
  // Normalizer persis relationsRegistry
  const normalizeSlug = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const relationsDb = {};
  res.rows.forEach(({ country_slug, target_country, relation }) => {
    const sourceSlug = normalizeSlug(country_slug);
    const targetName = target_country.trim().toLowerCase();
    relationsDb[sourceSlug] = relationsDb[sourceSlug] || {};
    relationsDb[sourceSlug][targetName] = relation;
  });

  const getBaseRelationValue = (sourceCountry, targetCountry) => {
    if (!sourceCountry || !targetCountry) return 50;
    const s1 = sourceCountry.trim().toLowerCase();
    const s2 = targetCountry.trim().toLowerCase();
    if (s1 === s2) return 100;
    const slug = normalizeSlug(sourceCountry);
    const targetMap = relationsDb[slug];
    if (targetMap && targetMap[s2] !== undefined) {
      return { val: targetMap[s2], source: 'db' };
    }
    // Fallback hash
    let hash = 5381;
    const pairKey = s1 < s2 ? `${s1}:${s2}` : `${s2}:${s1}`;
    for (let i = 0; i < pairKey.length; i++) {
      hash = (hash * 33) ^ pairKey.charCodeAt(i);
    }
    return { val: 15 + (Math.abs(hash) % 81), source: 'hash' };
  };

  const testTargets = ['Rusia', 'Mongolia', 'India', 'Indonesia', 'Amerika Serikat', 'Jepang', 'Kazakhstan'];
  testTargets.forEach(t => {
    const r = getBaseRelationValue('China', t);
    console.log(`China -> ${t}:`, r);
  });

  await pool.end();
}

run();

