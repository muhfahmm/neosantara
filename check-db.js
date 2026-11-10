const fs = require('fs');
const { Pool } = require('pg');

const lines = fs.readFileSync('apps/.env.local', 'utf-8').split('\n');
const env = {};
lines.forEach(l => {
  const p = l.trim().split('=');
  if (p[0] && !p[0].startsWith('#')) env[p[0].trim()] = p.slice(1).join('=').trim();
});

const pool = new Pool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: Number(env.DB_PORT),
});

async function main() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('Tables:', res.rows.map(r => r.table_name));

    const queries = [
      'SELECT country_slug, target_country, relation FROM database_hubungan_antar_negara ORDER BY country_id, target_country_id LIMIT 1',
      'SELECT country_slug, mitra_country, embassy_type, status FROM database_kedutaan_besar ORDER BY country_id, mitra_no LIMIT 1',
      'SELECT country_slug, mitra_no, mitra_country, trade_type, status FROM database_mitra_perdagangan ORDER BY country_id, mitra_no LIMIT 1',
      'SELECT source_file, file_order, entry_key, entry_order, metadata FROM database_building_metadata ORDER BY file_order, entry_order LIMIT 1'
    ];

    for (const q of queries) {
      try {
        const r = await pool.query(q);
        console.log('Query success:', q.slice(0, 50), 'Rows:', r.rowCount);
      } catch (e) {
        console.error('Query FAILED:', q, '->', e.message);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
