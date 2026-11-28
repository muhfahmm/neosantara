import { getDbPool } from '@/lib/db';

let isTableInitialized = false;

export async function ensureGameSavesTable(): Promise<void> {
    if (isTableInitialized) return;

    const pool = await getDbPool();
    await pool.query(`
        CREATE TABLE IF NOT EXISTS game_saves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            save_name TEXT NOT NULL,
            country_name TEXT NOT NULL,
            country_iso TEXT NOT NULL,
            game_date TEXT NOT NULL,
            capital TEXT,
            jumlah_penduduk INTEGER DEFAULT 0,
            anggaran REAL DEFAULT 0,
            ideology TEXT,
            religion TEXT,
            un_vote INTEGER DEFAULT 0,
            country_detail TEXT,
            owner_uid TEXT,
            save_uuid TEXT,
            schema_version TEXT DEFAULT 'v2',
            version INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            idempotency_key TEXT
        );
    `);
    await pool.query(`
        CREATE INDEX IF NOT EXISTS game_saves_owner_uid_id_idx
        ON game_saves (owner_uid, id);
    `);
    await pool.query(`
        CREATE INDEX IF NOT EXISTS game_saves_owner_uid_updated_idx
        ON game_saves (owner_uid, updated_at DESC, id DESC);
    `);
    await pool.query(`
        CREATE INDEX IF NOT EXISTS game_saves_owner_uuid_idx
        ON game_saves (owner_uid, save_uuid);
    `);
    await pool.query(`
        CREATE INDEX IF NOT EXISTS game_saves_owner_idempotency_idx
        ON game_saves (owner_uid, idempotency_key);
    `);

    isTableInitialized = true;
}
