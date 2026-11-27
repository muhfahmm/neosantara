import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDbPool } from '@/lib/db';
import { checkRateLimit, createRateLimitErrorResponse, getCorsHeaders } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validasi query parameters secara ketat (.strict() menolak parameter tak dikenal)
const PajakQueryParamsSchema = z.object({
  slug: z.string().trim().min(1).max(100).optional(),
  country: z.string().trim().min(1).max(100).optional(),
}).strict();

export async function GET(request: Request) {
  const cors = getCorsHeaders(request);

  // Rate Limiting (standard: 60 req/min)
  const limitRes = await checkRateLimit(request, 'standard');
  if (!limitRes.success) {
    return createRateLimitErrorResponse(limitRes.retryAfter, request);
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const parsed = PajakQueryParamsSchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parameter query tidak valid: ' + parsed.error.issues.map(i => i.message).join(', ') },
        { status: 400, headers: cors }
      );
    }

    const { slug, country } = parsed.data;
    const pool = await getDbPool();

    const mapRow = (row: any) => ({
      id: row.id,
      country: row.country,
      country_slug: row.country_slug,
      tarif_ppn: Number(row.tarif_ppn) || 0,
      tarif_korporasi: Number(row.tarif_korporasi) || 0,
      tarif_penghasilan: Number(row.tarif_penghasilan) || 0,
      tarif_bea_cukai: Number(row.tarif_bea_cukai) || 0,
      tarif_lingkungan: Number(row.tarif_lingkungan) || 0,
    });

    if (slug) {
      const res = await pool.query(
        'SELECT * FROM database_pajak_negara WHERE LOWER(country_slug) = LOWER($1) LIMIT 1',
        [slug.trim()]
      );
      if (res.rows.length > 0) {
        return NextResponse.json(mapRow(res.rows[0]), { headers: cors });
      }
      return NextResponse.json(null, { headers: cors });
    }

    if (country) {
      const res = await pool.query(
        'SELECT * FROM database_pajak_negara WHERE LOWER(country) = LOWER($1) OR REPLACE(LOWER(country_slug), \'_\', \' \') = LOWER($1) LIMIT 1',
        [country.trim()]
      );
      if (res.rows.length > 0) {
        return NextResponse.json(mapRow(res.rows[0]), { headers: cors });
      }
      return NextResponse.json(null, { headers: cors });
    }

    const res = await pool.query('SELECT * FROM database_pajak_negara');
    return NextResponse.json(res.rows.map(mapRow), { headers: cors });
  } catch (error: any) {
    console.error('Error querying database_pajak_negara:', error);
    return NextResponse.json({ error: 'Gagal memproses data pajak.' }, { status: 500, headers: cors });
  }
}
