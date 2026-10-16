import { NextResponse } from 'next/server';
import { getDbPool } from '../../../lib/db';
import { ensureGameSavesTable } from '@/lib/initGameSavesTable';

/**
 * GET handler: Fetch all saved game records, sorted by latest first.
 */
export async function GET() {
    try {
        await ensureGameSavesTable();
        const pool = await getDbPool();
        const result = await pool.query('SELECT * FROM game_saves ORDER BY id DESC');
        const rows = result.rows || [];

        // Parse country_detail JSON strings back to objects
        const parsedRows = rows.map((row: any) => ({
            ...row,
            country_name: row.country_name, // Keep original for compatibility
            countryDetail: row.country_detail ? JSON.parse(row.country_detail) : null,
        }));

        return NextResponse.json(parsedRows);
    } catch (error: any) {
        console.error('Error fetching game saves:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch game saves' },
            { status: 500 }
        );
    }
}

/**
 * POST handler: Save the current game state to the database.
 */
export async function POST(request: Request) {
    try {
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
            countryDetail, // NOW include full countryDetail which has all accumulated/build_date fields
        } = body;

        // Validation for critical simulation state variables
        if (!saveName || !countryName || !countryIso || !gameDate) {
            return NextResponse.json(
                { error: 'Missing critical fields (saveName, countryName, countryIso, gameDate)' },
                { status: 400 }
            );
        }

        // Serialize full countryDetail for production tracking
        const countryDetailJson = JSON.stringify(countryDetail || {});

        await ensureGameSavesTable();
        const pool = await getDbPool();

        if (saveId) {
            // Overwrite existing save file
            await pool.query(
                `UPDATE game_saves 
                SET save_name = $1, country_name = $2, country_iso = $3, game_date = $4, capital = $5, 
                    jumlah_penduduk = $6, anggaran = $7, ideology = $8, religion = $9, un_vote = $10, 
                    country_detail = $11, created_at = CURRENT_TIMESTAMP
                WHERE id = $12`,
                [
                    saveName,
                    countryName,
                    countryIso,
                    gameDate,
                    capital || null,
                    jumlahPenduduk ? Number(jumlahPenduduk) : 0,
                    anggaran ? Number(anggaran) : 0,
                    ideology || null,
                    religion || null,
                    unVote ? Number(unVote) : 0,
                    countryDetailJson,
                    saveId,
                ]
            );

            return NextResponse.json({
                success: true,
                insertId: saveId,
                message: 'Save file berhasil diperbarui.',
            });
        }

        const result = await pool.query(
            `INSERT INTO game_saves 
            (save_name, country_name, country_iso, game_date, capital, jumlah_penduduk, anggaran, ideology, religion, un_vote, country_detail) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
            [
                saveName,
                countryName,
                countryIso,
                gameDate,
                capital || null,
                jumlahPenduduk ? Number(jumlahPenduduk) : 0,
                anggaran ? Number(anggaran) : 0,
                ideology || null,
                religion || null,
                unVote ? Number(unVote) : 0,
                countryDetailJson,
            ]
        );

        return NextResponse.json({
            success: true,
            insertId: (result as any).rows?.[0]?.id,
            message: 'Game state saved successfully.',
        });
    } catch (error: any) {
        console.error('Error saving game:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to save game state' },
            { status: 500 }
        );
    }
}

/**
 * DELETE handler: Remove a saved game record from the database.
 */
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Save file ID is required' },
                { status: 400 }
            );
        }

        const pool = await getDbPool();
        const result = await pool.query('DELETE FROM game_saves WHERE id = $1', [id]);

        if ((result as any).affectedRows === 0) {
            return NextResponse.json(
                { error: 'Save file not found or already deleted' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Save file deleted successfully.',
        });
    } catch (error: any) {
        console.error('Error deleting save file:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete save file' },
            { status: 500 }
        );
    }
}
