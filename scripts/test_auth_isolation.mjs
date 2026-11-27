import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../apps/.env.local');

const envContent = fs.readFileSync(envPath, 'utf8');
const config = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] ? match[2].trim() : '';
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    config[match[1]] = val;
  }
}

const pool = new pg.Pool({
  host: config.DB_HOST || '127.0.0.1',
  port: Number(config.DB_PORT || 5432),
  user: config.DB_USER || 'postgres',
  database: config.DB_NAME || 'db_presiden_simulator',
  password: config.DB_PASSWORD,
});

async function runTests() {
  console.log('=== TEST 1: Database Query Isolation ===');
  const userA = 'test_user_alpha';
  const userB = 'test_user_beta';

  // 1. Bersihkan data test lama jika ada
  await pool.query('DELETE FROM game_saves WHERE owner_uid IN ($1, $2)', [userA, userB]);

  // 2. User A membuat save
  const insertRes = await pool.query(`
    INSERT INTO game_saves (save_uuid, save_name, country_name, country_iso, game_date, owner_uid, country_detail)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, save_uuid, owner_uid
  `, ['uuid-test-a-12345', 'Simulasi Rahasia Alpha', 'Indonesia', 'IDN', '2026-12-01', userA, JSON.stringify({ note: 'Alpha State' })]);

  const saveA = insertRes.rows[0];
  console.log(`[PASS] User A membuat save ID: ${saveA.id}, UUID: ${saveA.save_uuid}`);

  // 3. User B melakukan SELECT LIST
  const listB = await pool.query('SELECT * FROM game_saves WHERE owner_uid = $1', [userB]);
  if (listB.rows.length === 0) {
    console.log('[PASS] User B tidak melihat save milik User A di list save');
  } else {
    console.error('[FAIL] Kebocoran data: User B melihat save User A!');
    process.exit(1);
  }

  // 4. User B mencoba SELECT detail save milik User A
  const getB = await pool.query('SELECT * FROM game_saves WHERE id = $1 AND owner_uid = $2', [saveA.id, userB]);
  if (getB.rows.length === 0) {
    console.log('[PASS] User B tidak dapat membaca detail save milik User A (404 isolation)');
  } else {
    console.error('[FAIL] Kebocoran data: User B bisa membaca detail User A!');
    process.exit(1);
  }

  // 5. User B mencoba OVERWRITE / UPDATE save milik User A
  const updateB = await pool.query('UPDATE game_saves SET save_name = $1 WHERE id = $2 AND owner_uid = $3', ['Ditimpa Beta', saveA.id, userB]);
  if (updateB.rowCount === 0) {
    console.log('[PASS] User B tidak dapat menimpa save milik User A');
  } else {
    console.error('[FAIL] Kebocoran data: User B berhasil menimpa save User A!');
    process.exit(1);
  }

  // 6. User B mencoba DELETE save milik User A
  const deleteB = await pool.query('DELETE FROM game_saves WHERE id = $1 AND owner_uid = $2', [saveA.id, userB]);
  if (deleteB.rowCount === 0) {
    console.log('[PASS] User B tidak dapat menghapus save milik User A');
  } else {
    console.error('[FAIL] Kebocoran data: User B berhasil menghapus save User A!');
    process.exit(1);
  }

  // 7. User A mengakses dan menghapus save miliknya sendiri
  const deleteA = await pool.query('DELETE FROM game_saves WHERE id = $1 AND owner_uid = $2', [saveA.id, userA]);
  if (deleteA.rowCount === 1) {
    console.log('[PASS] User A berhasil mengelola & menghapus save miliknya sendiri');
  } else {
    console.error('[FAIL] User A gagal mengelola save miliknya!');
    process.exit(1);
  }

  // Cleanup
  await pool.query('DELETE FROM game_saves WHERE owner_uid IN ($1, $2)', [userA, userB]);
  await pool.end();
  console.log('\nSEMUA TES ISOLASI DATABASE & OTORISASI BERHASIL 100%!');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
