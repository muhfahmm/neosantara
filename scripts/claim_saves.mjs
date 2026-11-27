#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../apps/.env.local');

if (!fs.existsSync(envPath)) {
  console.error(`Berkas konfigurasi tidak ditemukan: ${envPath}`);
  process.exit(1);
}

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

const rawArg = process.argv[2]?.trim();
const saveIdArg = process.argv[3]?.trim();

const pool = new pg.Pool({
  host: config.DB_HOST || '127.0.0.1',
  port: Number(config.DB_PORT || 5432),
  user: config.DB_USER || 'postgres',
  database: config.DB_NAME || 'db_presiden_simulator',
  password: config.DB_PASSWORD,
});

async function main() {
  try {
    if (rawArg === '--reset-status') {
      await pool.query("UPDATE game_saves SET owner_uid = NULL WHERE owner_uid = '--status'");
      console.log('Reset owner_uid = NULL untuk status flag.');
    }

    if (!rawArg || rawArg === '--status' || rawArg === '-s' || rawArg === '--reset-status') {
      console.log('=== DAFTAR SEMUA SAVE GAME & PEMILIKNYA ===');
      const allRes = await pool.query(
        "SELECT id, save_name, country_name, game_date, owner_uid, created_at, updated_at FROM game_saves ORDER BY id ASC"
      );
      console.table(allRes.rows);

      const unowned = allRes.rows.filter(r => !r.owner_uid);
      if (unowned.length > 0) {
        console.log(`\nAda ${unowned.length} save file tanpa pemilik (owner_uid IS NULL):`);
        console.log('Cara Klaim Save:');
        console.log('  node scripts/claim_saves.mjs <TARGET_FIREBASE_UID>');
        console.log('  Atau klaim satu ID spesifik:');
        console.log('  node scripts/claim_saves.mjs <TARGET_FIREBASE_UID> <SAVE_ID>');
      } else {
        console.log('\nSemua save file sudah memiliki pemilik.');
      }
      return;
    }

    const targetUid = rawArg;
    if (saveIdArg) {
      const id = Number(saveIdArg);
      const updateRes = await pool.query(
        "UPDATE game_saves SET owner_uid = $1, updated_at = NOW() WHERE id = $2 AND (owner_uid IS NULL OR owner_uid = '') RETURNING id, save_name, country_name, owner_uid",
        [targetUid, id]
      );
      if (updateRes.rows.length === 0) {
        console.log(`Gagal mengklaim save ID ${id}. Pastikan save ID ada dan belum dimiliki akun lain.`);
      } else {
        console.log(`Berhasil mengklaim save ID ${id} ke UID: ${targetUid}`);
        console.table(updateRes.rows);
      }
    } else {
      const updateRes = await pool.query(
        "UPDATE game_saves SET owner_uid = $1, updated_at = NOW() WHERE (owner_uid IS NULL OR owner_uid = '') RETURNING id, save_name, country_name, owner_uid",
        [targetUid]
      );
      console.log(`Berhasil mengklaim ${updateRes.rows.length} save file ke UID: ${targetUid}`);
      console.table(updateRes.rows);
    }
  } catch (error) {
    console.error('Terjadi kesalahan saat memproses klaim save:', error);
  } finally {
    await pool.end();
  }
}

main();
