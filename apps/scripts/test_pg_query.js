const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || process.env.PGHOST || '127.0.0.1',
  user: process.env.DB_USER || process.env.PGUSER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD || 'Hiim_110407',
  database: process.env.DB_NAME || process.env.PGDATABASE || 'db_presiden_simulator',
  port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432'),
});

async function test() {
  try {
    const res = await pool.query('SELECT count(*) FROM database_hubungan_antar_negara');
    console.log('Count from database_hubungan_antar_negara:', res.rows);

    const chinaRows = await pool.query("SELECT * FROM database_hubungan_antar_negara WHERE country_slug = 'china' LIMIT 10");
    console.log('China sample rows:', chinaRows.rows);

    const chinaRusia = await pool.query("SELECT * FROM database_hubungan_antar_negara WHERE country_slug = 'china' AND target_country ILIKE '%rusia%'");
    console.log('China -> Rusia in DB:', chinaRusia.rows);

    const chinaMongolia = await pool.query("SELECT * FROM database_hubungan_antar_negara WHERE country_slug = 'china' AND target_country ILIKE '%mongolia%'");
    console.log('China -> Mongolia in DB:', chinaMongolia.rows);
  } catch (e) {
    console.error('Error connecting/querying DB:', e);
  } finally {
    await pool.end();
  }
}

test();

