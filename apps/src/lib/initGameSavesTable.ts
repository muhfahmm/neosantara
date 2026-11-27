import { getDbPool } from '@/lib/db';

let isTableInitialized = false;

export async function ensureGameSavesTable(): Promise<void> {
    if (isTableInitialized) return;

    const pool = await getDbPool();
    await pool.query(`
        CREATE TABLE IF NOT EXISTS game_saves (
            id SERIAL PRIMARY KEY,
            save_name VARCHAR(255) NOT NULL,
            country_name VARCHAR(255) NOT NULL,
            country_iso VARCHAR(10) NOT NULL,
            game_date VARCHAR(100) NOT NULL,
            capital VARCHAR(255),
            jumlah_penduduk BIGINT DEFAULT 0,
            anggaran NUMERIC(20, 0) DEFAULT 0,
            ideology VARCHAR(100),
            religion VARCHAR(100),
            un_vote INT DEFAULT 0,
            country_detail TEXT,
            owner_uid TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await pool.query(`
        ALTER TABLE game_saves
        ADD COLUMN IF NOT EXISTS owner_uid TEXT,
        ADD COLUMN IF NOT EXISTS schema_version VARCHAR(20) DEFAULT 'v1',
        ADD COLUMN IF NOT EXISTS version INT DEFAULT 1,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128);
    `);
    await pool.query(`
        CREATE INDEX IF NOT EXISTS game_saves_owner_uid_updated_idx
        ON game_saves (owner_uid, updated_at DESC, id DESC);
    `);
    await pool.query(`
        CREATE INDEX IF NOT EXISTS game_saves_owner_idempotency_idx
        ON game_saves (owner_uid, idempotency_key)
        WHERE idempotency_key IS NOT NULL;
    `);
    await pool.query(`
        ALTER TABLE game_saves
        ALTER COLUMN anggaran TYPE NUMERIC(20, 0)
        USING ROUND(anggaran);
    `);

    isTableInitialized = true;
}
