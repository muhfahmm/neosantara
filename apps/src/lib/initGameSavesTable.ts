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
            anggaran NUMERIC(20, 2) DEFAULT 0,
            ideology VARCHAR(100),
            religion VARCHAR(100),
            un_vote INT DEFAULT 0,
            country_detail TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    isTableInitialized = true;
}
