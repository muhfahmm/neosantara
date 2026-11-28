import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

let sqliteDbInstance: DatabaseSync | null = null;

function resolveDatabasePath(): string {
    const customPath = process.env.SQLITE_DB_PATH;
    if (customPath && fs.existsSync(customPath)) {
        return customPath;
    }

    const candidatePaths = [
        path.resolve(process.cwd(), 'data', 'neosantara_master.db'),
        path.resolve(process.cwd(), '..', 'data', 'neosantara_master.db'),
        path.resolve(__dirname, '..', '..', '..', 'data', 'neosantara_master.db'),
        path.resolve(__dirname, '..', '..', 'data', 'neosantara_master.db'),
    ];

    for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
            return p;
        }
    }

    // Default fallback
    const fallbackPath = path.resolve(process.cwd(), 'data', 'neosantara_master.db');
    const fallbackDir = path.dirname(fallbackPath);
    if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return fallbackPath;
}

export function getSqliteDb(): DatabaseSync {
    if (sqliteDbInstance) {
        return sqliteDbInstance;
    }

    const dbPath = resolveDatabasePath();
    const db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');
    db.exec('PRAGMA foreign_keys = ON;');

    // Pastikan tabel game_saves ada
    db.exec(`
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
        CREATE INDEX IF NOT EXISTS idx_game_saves_owner_id ON game_saves(owner_uid, id);
        CREATE INDEX IF NOT EXISTS idx_game_saves_owner_uuid ON game_saves(owner_uid, save_uuid);
        CREATE INDEX IF NOT EXISTS idx_game_saves_owner_updated ON game_saves(owner_uid, updated_at DESC);
    `);

    sqliteDbInstance = db;
    return sqliteDbInstance;
}

/**
 * Konversi parameterized query PostgreSQL ($1, $2, ...) menjadi SQLite (?, ?, ...)
 */
function translatePgSqlToSqlite(sql: string): string {
    return sql
        .replace(/\$(\d+)/g, '?')
        .replace(/\bCURRENT_TIMESTAMP\b/gi, "datetime('now')");
}

export interface SqlQueryResult<T = any> {
    rows: T[];
    rowCount: number;
}

/**
 * Adapter kompatibilitas getDbPool() yang meniru antarmuka pg.Pool
 * mengeksekusi langsung di atas SQLite berkecepatan tinggi tanpa network overhead.
 */
export async function getDbPool() {
    const db = getSqliteDb();

    return {
        async query<T = any>(sql: string, params: any[] = []): Promise<SqlQueryResult<T>> {
            const sqliteSql = translatePgSqlToSqlite(sql);
            const trimmed = sqliteSql.trim();
            const upper = trimmed.toUpperCase();

            // Jika query memiliki klausa RETURNING atau SELECT, gunakan stmt.all()
            if (upper.startsWith('SELECT') || upper.startsWith('PRAGMA') || upper.includes(' RETURNING ')) {
                const stmt = db.prepare(sqliteSql);
                const rows = stmt.all(...params) as T[];
                return {
                    rows,
                    rowCount: rows.length,
                };
            }

            // Operasi INSERT / UPDATE / DELETE tanpa RETURNING
            const stmt = db.prepare(sqliteSql);
            const info = stmt.run(...params);
            return {
                rows: [] as T[],
                rowCount: Number(info.changes),
            };
        },
    };
}

/**
 * Helper queryDb universal untuk seluruh endpoint master data
 */
export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T> {
    const pool = await getDbPool();
    const result = await pool.query<T>(sql, params);
    return result.rows as unknown as T;
}
