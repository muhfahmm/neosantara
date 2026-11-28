const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function resolveDatabasePath() {
    return path.resolve(__dirname, '..', 'data', 'neosantara_master.db');
}

async function debugTest() {
    const db = new DatabaseSync(resolveDatabasePath());
    console.log('Testing raw sqlite...');
    const rawSql = 'INSERT INTO game_saves (save_name, country_name, country_iso, game_date, owner_uid) VALUES (?, ?, ?, ?, ?) RETURNING id, save_name';
    try {
        const stmt = db.prepare(rawSql);
        const res = stmt.all('Tes', 'ID', 'id', '2026-11-28', 'u1');
        console.log('Raw RETURNING success:', res);
    } catch (e) {
        console.error('Raw RETURNING error:', e);
    }

    const checkSql = 'SELECT * FROM game_saves';
    const stmtCheck = db.prepare(checkSql);
    console.log('Current saves:', stmtCheck.all());

    db.close();
}

debugTest();
