import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { getDbPool } from '../../../lib/db';
import { ensureGameSavesTable } from '@/lib/initGameSavesTable';
import { requireUser } from '@/lib/serverAuth';
import { FirebaseRequestAuthError } from '@/lib/firebaseAdmin';
import { normalizeCountryFinancialState, roundNeo } from '@/app/logic/economic_logic/neoCurrency';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-Memory Rate Limiting per UID (Maksimal 60 request per menit per UID)
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(uid: string): boolean {
    const now = Date.now();
    const userLimit = rateLimitMap.get(uid);
    if (!userLimit || now > userLimit.resetAt) {
        rateLimitMap.set(uid, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return true;
    }
    if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }
    userLimit.count += 1;
    return true;
}

// Zod Schema untuk validasi payload save
const SavePayloadSchema = z.object({
    saveId: z.union([z.number().int().positive(), z.string().trim().min(1)]).nullable().optional(),
    saveName: z.string().trim().min(1).max(255),
    countryName: z.string().trim().min(1).max(255),
    countryIso: z.string().trim().min(1).max(10),
    gameDate: z.string().trim().min(1).max(100),
    capital: z.string().trim().max(255).nullable().optional(),
    jumlahPenduduk: z.union([z.number(), z.string()]).optional(),
    anggaran: z.union([z.number(), z.string()]).optional(),
    ideology: z.string().trim().max(100).nullable().optional(),
    religion: z.string().trim().max(100).nullable().optional(),
    unVote: z.union([z.number(), z.string()]).optional(),
    countryDetail: z.record(z.string(), z.unknown()),
    expectedVersion: z.number().int().optional().nullable(),
    idempotencyKey: z.string().trim().max(128).optional().nullable(),
    schemaVersion: z.string().trim().max(20).default('v2'),
});

function withPrivateCacheHeaders(response: NextResponse): NextResponse {
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
}

export async function GET(request: Request) {
    try {
        const { uid: ownerUid } = await requireUser(request);
        await ensureGameSavesTable();
        const pool = await getDbPool();
        const idParam = new URL(request.url).searchParams.get('id');

        if (idParam !== null && idParam.trim() !== '') {
            const rawId = idParam.trim();
            const numericId = Number(rawId);
            const isNumeric = Number.isSafeInteger(numericId) && numericId > 0;

            const result = isNumeric
                ? await pool.query(
                    'SELECT * FROM game_saves WHERE (id = $1 OR save_uuid = $2) AND owner_uid = $3',
                    [numericId, rawId, ownerUid],
                )
                : await pool.query(
                    'SELECT * FROM game_saves WHERE save_uuid = $1 AND owner_uid = $2',
                    [rawId, ownerUid],
                );

            const row = result.rows[0];
            if (!row) {
                // Mengembalikan 404 jika bukan milik user ini (tidak membocorkan keberadaan)
                return withPrivateCacheHeaders(
                    NextResponse.json({ error: 'Save file not found.' }, { status: 404 })
                );
            }

            return withPrivateCacheHeaders(NextResponse.json({
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
            }));
        }

        const result = await pool.query(
            `SELECT id, save_uuid, save_name, country_name, country_iso, game_date, capital,
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

        return withPrivateCacheHeaders(NextResponse.json(result.rows.map((row: Record<string, unknown>) => ({
            ...row,
            anggaran: roundNeo(row.anggaran as number),
        }))));
    } catch (error) {
        if (error instanceof FirebaseRequestAuthError) {
            return withPrivateCacheHeaders(
                NextResponse.json({ error: error.message }, { status: error.status })
            );
        }
        console.error('Error fetching game saves:', error);
        return withPrivateCacheHeaders(
            NextResponse.json({ error: 'Failed to fetch game saves.' }, { status: 500 })
        );
    }
}

export async function POST(request: Request) {
    try {
        const { uid: ownerUid } = await requireUser(request);

        if (!checkRateLimit(ownerUid)) {
            return withPrivateCacheHeaders(
                NextResponse.json({ error: 'Terlalu banyak permintaan simpan. Harap tunggu beberapa saat.' }, { status: 429 })
            );
        }

        // Batasi ukuran body maksimal 15MB
        const contentLength = Number(request.headers.get('content-length') || 0);
        if (contentLength > 15 * 1024 * 1024) {
            return withPrivateCacheHeaders(
                NextResponse.json({ error: 'Payload save file melebihi batas ukuran 15MB.' }, { status: 413 })
            );
        }

        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return withPrivateCacheHeaders(
                NextResponse.json({ error: 'Format JSON payload tidak valid.' }, { status: 400 })
            );
        }

        const parseResult = SavePayloadSchema.safeParse(rawBody);
        if (!parseResult.success) {
            return withPrivateCacheHeaders(
                NextResponse.json({ error: 'Payload tidak valid: ' + parseResult.error.issues.map(i => i.message).join(', ') }, { status: 400 })
            );
        }

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
            schemaVersion,
        } = parseResult.data;

        await ensureGameSavesTable();
        const pool = await getDbPool();

        // Cek Idempotency Key untuk mencegah duplikasi
        if (idempotencyKey) {
            const existingIdempotent = await pool.query(
                `SELECT id, save_uuid, version, updated_at, created_at
                 FROM game_saves
                 WHERE owner_uid = $1 AND idempotency_key = $2
                 ORDER BY id DESC LIMIT 1`,
                [ownerUid, idempotencyKey],
            );
            if (existingIdempotent.rows.length > 0) {
                const existing = existingIdempotent.rows[0];
                return withPrivateCacheHeaders(NextResponse.json({
                    success: true,
                    insertId: existing.id,
                    saveUuid: existing.save_uuid,
                    version: existing.version ?? 1,
                    message: 'Game state saved successfully (idempotent).',
                }));
            }
        }

        const normalizedBudget = roundNeo(anggaran !== undefined ? anggaran : countryDetail.anggaran);
        const normalizedCountryDetail = normalizeCountryFinancialState({
            ...countryDetail,
            anggaran: normalizedBudget,
        });
        const countryDetailJson = JSON.stringify(normalizedCountryDetail);

        // Jika saveId ada -> Operasi OVERWRITE / UPDATE
        if (saveId !== null && saveId !== undefined) {
            const numericId = typeof saveId === 'number' ? saveId : Number(saveId);
            const isNumeric = Number.isSafeInteger(numericId) && numericId > 0;
            const uuidQuery = !isNumeric ? String(saveId) : null;

            // Validasi Optimistic Locking jika expectedVersion diberikan
            if (expectedVersion !== undefined && expectedVersion !== null) {
                const checkResult = isNumeric
                    ? await pool.query('SELECT version FROM game_saves WHERE id = $1 AND owner_uid = $2', [numericId, ownerUid])
                    : await pool.query('SELECT version FROM game_saves WHERE save_uuid = $1 AND owner_uid = $2', [uuidQuery, ownerUid]);

                if (checkResult.rows.length === 0) {
                    return withPrivateCacheHeaders(
                        NextResponse.json({ error: 'Save file not found.' }, { status: 404 })
                    );
                }
                const currentVersion = checkResult.rows[0].version ?? 1;
                if (currentVersion > expectedVersion) {
                    return withPrivateCacheHeaders(NextResponse.json({
                        error: 'Konflik save: Data telah diperbarui di perangkat atau tab lain.',
                        code: 'SAVE_CONFLICT',
                        currentVersion,
                    }, { status: 409 }));
                }
            }

            const updateQuery = isNumeric
                ? `UPDATE game_saves
                   SET save_name = $1, country_name = $2, country_iso = $3, game_date = $4, capital = $5,
                       jumlah_penduduk = $6, anggaran = $7, ideology = $8, religion = $9, un_vote = $10,
                       country_detail = $11, schema_version = $12, version = COALESCE(version, 1) + 1,
                       updated_at = CURRENT_TIMESTAMP, idempotency_key = $13
                   WHERE id = $14 AND owner_uid = $15
                   RETURNING id, save_uuid, version`
                : `UPDATE game_saves
                   SET save_name = $1, country_name = $2, country_iso = $3, game_date = $4, capital = $5,
                       jumlah_penduduk = $6, anggaran = $7, ideology = $8, religion = $9, un_vote = $10,
                       country_detail = $11, schema_version = $12, version = COALESCE(version, 1) + 1,
                       updated_at = CURRENT_TIMESTAMP, idempotency_key = $13
                   WHERE save_uuid = $14 AND owner_uid = $15
                   RETURNING id, save_uuid, version`;

            const result = await pool.query(updateQuery, [
                saveName,
                countryName,
                countryIso,
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
                isNumeric ? numericId : uuidQuery,
                ownerUid,
            ]);

            if (result.rowCount === 0) {
                return withPrivateCacheHeaders(
                    NextResponse.json({ error: 'Save file not found.' }, { status: 404 })
                );
            }

            return withPrivateCacheHeaders(NextResponse.json({
                success: true,
                insertId: result.rows[0]?.id,
                saveUuid: result.rows[0]?.save_uuid,
                version: result.rows[0]?.version ?? 1,
                message: 'Save file berhasil diperbarui.',
            }));
        }

        // Operasi CREATE SAVE BARU -> Hasilkan UUID acak
        const newSaveUuid = randomUUID();
        const result = await pool.query(
            `INSERT INTO game_saves
             (save_name, country_name, country_iso, game_date, capital, jumlah_penduduk, anggaran,
              ideology, religion, un_vote, country_detail, schema_version, version, updated_at, idempotency_key, owner_uid, save_uuid)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 1, CURRENT_TIMESTAMP, $13, $14, $15)
             RETURNING id, save_uuid, version`,
            [
                saveName,
                countryName,
                countryIso,
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
                newSaveUuid,
            ],
        );

        return withPrivateCacheHeaders(NextResponse.json({
            success: true,
            insertId: result.rows[0]?.id,
            saveUuid: result.rows[0]?.save_uuid,
            version: result.rows[0]?.version ?? 1,
            message: 'Game state saved successfully.',
        }));
    } catch (error) {
        if (error instanceof FirebaseRequestAuthError) {
            return withPrivateCacheHeaders(
                NextResponse.json({ error: error.message }, { status: error.status })
            );
        }
        console.error('Error saving game:', error);
        return withPrivateCacheHeaders(
            NextResponse.json({ error: 'Failed to save game state.' }, { status: 500 })
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { uid: ownerUid } = await requireUser(request);
        const idParam = new URL(request.url).searchParams.get('id');
        if (!idParam || idParam.trim() === '') {
            return withPrivateCacheHeaders(
                NextResponse.json({ error: 'Invalid save file ID.' }, { status: 400 })
            );
        }

        const rawId = idParam.trim();
        const numericId = Number(rawId);
        const isNumeric = Number.isSafeInteger(numericId) && numericId > 0;

        await ensureGameSavesTable();
        const pool = await getDbPool();

        const result = isNumeric
            ? await pool.query(
                'DELETE FROM game_saves WHERE (id = $1 OR save_uuid = $2) AND owner_uid = $3',
                [numericId, rawId, ownerUid],
            )
            : await pool.query(
                'DELETE FROM game_saves WHERE save_uuid = $1 AND owner_uid = $2',
                [rawId, ownerUid],
            );

        if (result.rowCount === 0) {
            return withPrivateCacheHeaders(
                NextResponse.json({ error: 'Save file not found.' }, { status: 404 })
            );
        }

        return withPrivateCacheHeaders(
            NextResponse.json({ success: true, message: 'Save file deleted successfully.' })
        );
    } catch (error) {
        if (error instanceof FirebaseRequestAuthError) {
            return withPrivateCacheHeaders(
                NextResponse.json({ error: error.message }, { status: error.status })
            );
        }
        console.error('Error deleting save file:', error);
        return withPrivateCacheHeaders(
            NextResponse.json({ error: 'Failed to delete save file.' }, { status: 500 })
        );
    }
}
