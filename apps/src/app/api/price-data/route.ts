import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryDb } from '@/lib/db';
import { checkRateLimit, createRateLimitErrorResponse, getCorsHeaders } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PriceQueryParamsSchema = z.object({
  country: z.string().trim().min(1).max(100),
}).strict();

export async function GET(request: Request) {
  const cors = getCorsHeaders(request);

  const limitRes = await checkRateLimit(request, 'standard');
  if (!limitRes.success) {
    return createRateLimitErrorResponse(limitRes.retryAfter, request);
  }

  const { searchParams } = new URL(request.url);
  const rawParams = Object.fromEntries(searchParams.entries());

  const parsed = PriceQueryParamsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parameter query tidak valid: ' + parsed.error.issues.map(i => i.message).join(', ') },
      { status: 400, headers: cors }
    );
  }

  const countryName = parsed.data.country;

  try {
    const rows = await queryDb<any[]>(
      `SELECT country, country_slug, harga_beras, harga_daging_sapi, harga_ayam,
              harga_minyak_goreng, harga_gula, harga_telur, harga_listrik, harga_air
       FROM database_harga_barang
       WHERE LOWER(country) = LOWER($1)
          OR LOWER(country_slug) = LOWER($1)
          OR REPLACE(LOWER(country_slug), '_', ' ') = LOWER($1)
       LIMIT 1`,
      [countryName]
    );

    const matchedRow = rows[0];
    if (!matchedRow) {
      return NextResponse.json({ country: countryName, prices: null }, { headers: cors });
    }

    const prices = {
      harga_beras: Number(matchedRow.harga_beras || 0),
      harga_daging_sapi: Number(matchedRow.harga_daging_sapi || 0),
      harga_ayam: Number(matchedRow.harga_ayam || 0),
      harga_minyak_goreng: Number(matchedRow.harga_minyak_goreng || 0),
      harga_gula: Number(matchedRow.harga_gula || 0),
      harga_telur: Number(matchedRow.harga_telur || 0),
      harga_listrik: Number(matchedRow.harga_listrik || 0),
      harga_air: Number(matchedRow.harga_air || 0),
    };

    return NextResponse.json({ country: countryName, prices }, { headers: cors });
  } catch (error) {
    console.error('Failed to fetch price data:', error);
    return NextResponse.json({ error: 'Gagal memproses data harga barang.' }, { status: 500, headers: cors });
  }
}
