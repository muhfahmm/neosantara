const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function buildSqliteMasterDatabase() {
    console.log('[SQLite Migration] Starting migration from root.pg.sql to SQLite...');
    const rootPgPath = path.resolve(__dirname, '..', 'json', 'root.pg.sql');
    const targetDbDir = path.resolve(__dirname, '..', 'data');
    if (!fs.existsSync(targetDbDir)) {
        fs.mkdirSync(targetDbDir, { recursive: true });
    }
    const targetDbPath = path.join(targetDbDir, 'neosantara_master.db');

    if (fs.existsSync(targetDbPath)) {
        try {
            fs.unlinkSync(targetDbPath);
            console.log('[SQLite Migration] Removed existing database at:', targetDbPath);
        } catch (e) {
            console.warn('[SQLite Migration] Could not unlink existing db:', e.message);
        }
    }

    let content = fs.readFileSync(rootPgPath, 'utf8');

    // Buang section 1-7 least-privilege user PG di baris atas
    const firstTableMarker = 'DROP TABLE IF EXISTS database_profiles_negara;';
    const firstIdx = content.indexOf(firstTableMarker);
    if (firstIdx !== -1) {
        content = content.slice(firstIdx);
    }

    // Konversi tipe data PostgreSQL ke SQLite
    let convertedSql = content
        .replace(/\bDROP\s+TABLE\s+IF\s+EXISTS\s+([a-zA-Z0-9_]+)\s+CASCADE\s*;/gi, 'DROP TABLE IF EXISTS $1;')
        .replace(/::jsonb/gi, '') // Hapus PostgreSQL jsonb cast syntax
        .replace(/::json/gi, '')
        .replace(/::text/gi, '')
        .replace(/::int/gi, '')
        .replace(/\bSERIAL\s+NOT\s+NULL\s+PRIMARY\s+KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
        .replace(/\bSERIAL\s+PRIMARY\s+KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
        .replace(/\bBIGSERIAL\s+PRIMARY\s+KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
        .replace(/\bSERIAL\b/gi, 'INTEGER')
        .replace(/\bBIGSERIAL\b/gi, 'INTEGER')
        .replace(/\bINT\b|\bBIGINT\b|\bSMALLINT\b|\bTINYINT\b/gi, 'INTEGER')
        .replace(/\bVARCHAR\(\d+\)|\bTEXT\b/gi, 'TEXT')
        .replace(/\bDECIMAL\([0-9,\s]+\)|\bNUMERIC\([0-9,\s]+\)|\bFLOAT\b|\bDOUBLE\b/gi, 'REAL')
        .replace(/\bTIMESTAMP\b(?:\s+WITH\s+TIME\s+ZONE)?(?:\s+DEFAULT\s+CURRENT_TIMESTAMP)?/gi, "TEXT DEFAULT (datetime('now'))");

    console.log('[SQLite Migration] Creating SQLite database instance...');
    const db = new DatabaseSync(targetDbPath);

    // Aktifkan optimasi performa SQLite
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');
    db.exec('PRAGMA foreign_keys = OFF;');

    // Jalankan seluruh skrip SQL
    console.log('[SQLite Migration] Executing converted schema and seed records...');
    db.exec(convertedSql);

    // Buat juga tabel game_saves jika belum ada
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

    // Verifikasi jumlah tabel dan data profil
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log(`[SQLite Migration] SUCCESS! Migrated ${tables.length} tables into:`, targetDbPath);

    const profileCount = db.prepare('SELECT count(*) as count FROM database_profiles_negara').get();
    console.log('[SQLite Migration] database_profiles_negara rows:', profileCount.count);

    const countrySample = db.prepare('SELECT country_slug, name_id, capital, jumlah_penduduk, anggaran FROM database_profiles_negara LIMIT 3').all();
    console.log('[SQLite Migration] Sample countries:', countrySample);

    const buildingMetaCount = db.prepare('SELECT count(*) as count FROM database_building_metadata').get();
    console.log('[SQLite Migration] database_building_metadata rows:', buildingMetaCount.count);

    db.close();
}

buildSqliteMasterDatabase();
