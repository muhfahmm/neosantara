import { NextResponse } from 'next/server';
import { getDbPool } from '../../../lib/db';
import { ensureGameSavesTable } from '@/lib/initGameSavesTable';
import { FirebaseRequestAuthError, verifyFirebaseRequest } from '@/lib/firebaseAdmin';
import { normalizeCountryFinancialState, roundNeo } from '@/app/logic/economic_logic/neoCurrency';

export async function GET(request: Request) {
    try {
        const ownerUid = await verifyFirebaseRequest(request);
        await ensureGameSavesTable();
        const pool = await getDbPool();
        const idParam = new URL(request.url).searchParams.get('id');

        if (idParam !== null) {
            const id = Number(idParam);
            if (!Number.isSafeInteger(id) || id < 1) {
                return NextResponse.json({ error: 'Invalid save file ID.' }, { status: 400 });
            }
            const result = await pool.query(
                'SELECT * FROM game_saves WHERE id = $1 AND owner_uid = $2',
                [id, ownerUid],
            );
            const row = result.rows[0];
            if (!row) {
                return NextResponse.json({ error: 'Save file not found.' }, { status: 404 });
            }

            return NextResponse.json({
                ...row,
                anggaran: roundNeo(row.anggaran),
                version: row.version ?? 1,
                schema_version: row.schema_version ?? 'v1',
                updated_at: row.updated_at || row.created_at,
                countryDetail: row.country_detail
                    ? normalizeCountryFinancialState(
                        typeof row.country_detail === 'string'
                            ? JSON.parse(row.country_detail)
                            : row.country_detail,
                    )
                    : null,
            });
        }

        const result = await pool.query(
            `SELECT id, save_name, country_name, country_iso, game_date, capital,
                    jumlah_penduduk, anggaran, ideology, religion, un_vote,
                    COALESCE(version, 1) AS version,
                    COALESCE(schema_version, 'v1') AS schema_version,
                    COALESCE(updated_at, created_at) AS updated_at,
                    created_at
             FROM game_saves
             WHERE owner_uid = $1
             ORDER BY COALESCE(updated_at, created_at) DESC, id DESC`,
            [ownerUid],
        );
        return NextResponse.json(result.rows.map((row: Record<string, unknown>) => ({
            ...row,
            anggaran: roundNeo(row.anggaran as number),
        })));
    } catch (error) {
        if (error instanceof FirebaseRequestAuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error('Error fetching game saves:', error);
        return NextResponse.json({ error: 'Failed to fetch game saves.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const ownerUid = await verifyFirebaseRequest(request);
        const body = await request.json();
        const {
            saveId,
            saveName,
            countryName,
            countryIso,
            gameDate,
            capital,
            jumlahPenduduk,
            anggaran,
            ideology,
            religion,
            unVote,
            countryDetail,
            expectedVersion,
            idempotencyKey,
            schemaVersion = 'v2',
        } = body;

        if (
            typeof saveName !== 'string' || !saveName.trim() ||
            typeof countryName !== 'string' || !countryName.trim() ||
            typeof countryIso !== 'string' || !countryIso.trim() ||
            typeof gameDate !== 'string' || !gameDate.trim() ||
            typeof countryDetail !== 'object' || countryDetail === null || Array.isArray(countryDetail)
        ) {
            return NextResponse.json(
                { error: 'Missing or invalid required game save fields.' },
                { status: 400 },
            );
        }

        await ensureGameSavesTable();
        const pool = await getDbPool();

        // Cek Idempotency Key untuk mencegah duplikasi akibat retry koneksi
        if (idempotencyKey && typeof idempotencyKey === 'string' && idempotencyKey.trim()) {
            const trimmedKey = idempotencyKey.trim();
            const existingIdempotent = await pool.query(
                `SELECT id, version, updated_at, created_at
                 FROM game_saves
                 WHERE owner_uid = $1 AND idempotency_key = $2
                 ORDER BY id DESC LIMIT 1`,
                [ownerUid, trimmedKey],
            );
            if (existingIdempotent.rows.length > 0) {
                const existing = existingIdempotent.rows[0];
                return NextResponse.json({
                    success: true,
                    insertId: existing.id,
                    version: existing.version ?? 1,
                    message: 'Game state saved successfully (idempotent).',
                });
            }
        }

        const normalizedBudget = roundNeo(anggaran ?? countryDetail.anggaran);
        const normalizedCountryDetail = normalizeCountryFinancialState({
            ...countryDetail,
            anggaran: normalizedBudget,
        });
        const countryDetailJson = JSON.stringify(normalizedCountryDetail);

        if (saveId !== null && saveId !== undefined) {
            const id = Number(saveId);
            if (!Number.isSafeInteger(id) || id < 1) {
                return NextResponse.json({ error: 'Invalid save file ID.' }, { status: 400 });
            }

            // Validasi Optimistic Locking jika expectedVersion diberikan
            if (expectedVersion !== undefined && expectedVersion !== null) {
                const versionNum = Number(expectedVersion);
                if (Number.isSafeInteger(versionNum)) {
                    const checkResult = await pool.query(
                        'SELECT version FROM game_saves WHERE id = $1 AND owner_uid = $2',
                        [id, ownerUid],
                    );
                    if (checkResult.rows.length === 0) {
                        return NextResponse.json({ error: 'Save file not found.' }, { status: 404 });
                    }
                    const currentVersion = checkResult.rows[0].version ?? 1;
                    if (currentVersion > versionNum) {
                        return NextResponse.json({
                            error: 'Konflik save: Data telah diperbarui di perangkat atau tab lain.',
                            code: 'SAVE_CONFLICT',
                            currentVersion,
                        }, { status: 409 });
                    }
                }
            }

            const result = await pool.query(
                `UPDATE game_saves
                 SET save_name = $1, country_name = $2, country_iso = $3, game_date = $4, capital = $5,
                     jumlah_penduduk = $6, anggaran = $7, ideology = $8, religion = $9, un_vote = $10,
                     country_detail = $11, schema_version = $12, version = COALESCE(version, 1) + 1,
                     updated_at = CURRENT_TIMESTAMP, idempotency_key = $13
                 WHERE id = $14 AND owner_uid = $15
                 RETURNING version`,
                [
                    saveName.trim(),
                    countryName.trim(),
                    countryIso.trim(),
                    gameDate,
                    capital || null,
                    jumlahPenduduk ? Number(jumlahPenduduk) : 0,
                    normalizedBudget,
                    ideology || null,
                    religion || null,
                    unVote ? Number(unVote) : 0,
                    countryDetailJson,
                    schemaVersion,
                    idempotencyKey || null,
                    id,
                    ownerUid,
                ],
            );
            if (result.rowCount === 0) {
                return NextResponse.json({ error: 'Save file not found.' }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                insertId: id,
                version: result.rows[0]?.version ?? 1,
                message: 'Save file berhasil diperbarui.',
            });
        }

        const result = await pool.query(
            `INSERT INTO game_saves
             (save_name, country_name, country_iso, game_date, capital, jumlah_penduduk, anggaran,
              ideology, religion, un_vote, country_detail, schema_version, version, updated_at, idempotency_key, owner_uid)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 1, CURRENT_TIMESTAMP, $13, $14)
             RETURNING id, version`,
            [
                saveName.trim(),
                countryName.trim(),
                countryIso.trim(),
                gameDate,
                capital || null,
                jumlahPenduduk ? Number(jumlahPenduduk) : 0,
                normalizedBudget,
                ideology || null,
                religion || null,
                unVote ? Number(unVote) : 0,
                countryDetailJson,
                schemaVersion,
                idempotencyKey || null,
                ownerUid,
            ],
        );

        return NextResponse.json({
            success: true,
            insertId: result.rows[0]?.id,
            version: result.rows[0]?.version ?? 1,
            message: 'Game state saved successfully.',
        });
    } catch (error) {
        if (error instanceof FirebaseRequestAuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error('Error saving game:', error);
        return NextResponse.json(
            { error: 'Failed to save game state.' },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const ownerUid = await verifyFirebaseRequest(request);
        const idParam = new URL(request.url).searchParams.get('id');
        const id = Number(idParam);
        if (!idParam || !Number.isSafeInteger(id) || id < 1) {
            return NextResponse.json({ error: 'Invalid save file ID.' }, { status: 400 });
        }

        await ensureGameSavesTable();
        const pool = await getDbPool();
        const result = await pool.query(
            'DELETE FROM game_saves WHERE id = $1 AND owner_uid = $2',
            [id, ownerUid],
        );
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Save file not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Save file deleted successfully.' });
    } catch (error) {
        if (error instanceof FirebaseRequestAuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error('Error deleting save file:', error);
        return NextResponse.json(
            { error: 'Failed to delete save file.' },
            { status: 500 },
        );
    }
}
