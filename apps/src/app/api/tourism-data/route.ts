import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryDb } from '@/lib/db';
import { checkRateLimit, createRateLimitErrorResponse, getCorsHeaders } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TourismQueryParamsSchema = z.object({
  country: z.string().trim().min(1).max(100).optional(),
}).strict();

export async function GET(request: Request) {
  const cors = getCorsHeaders(request);

  const limitRes = await checkRateLimit(request, 'standard');
  if (!limitRes.success) {
    return createRateLimitErrorResponse(limitRes.retryAfter, request);
  }

  const { searchParams } = new URL(request.url);
  const rawParams = Object.fromEntries(searchParams.entries());

  const parsed = TourismQueryParamsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parameter query tidak valid: ' + parsed.error.issues.map(i => i.message).join(', ') },
      { status: 400, headers: cors }
    );
  }

  const countryName = parsed.data.country;

  try {
    const rows = await queryDb<any[]>('SELECT * FROM database_tempat_wisata');

    if (!countryName) {
      return NextResponse.json({
        status: 'ok',
        data: rows,
      }, { headers: cors });
    }

    const normInput = countryName.trim().toLowerCase();
    const matchedRows = rows.filter(
      (r) =>
        r.country_slug.toLowerCase() === normInput ||
        r.country_slug.replace(/_/g, ' ').toLowerCase() === normInput
    );

    const tempat_wisata = matchedRows.map((r) => ({
      nama: r.nama_wisata,
      penghasilan: r.penghasilan,
    }));

    return NextResponse.json({
      country: countryName,
      tempat_wisata,
    }, { headers: cors });
  } catch (error) {
    console.error('Failed to fetch tourism data:', error);
    return NextResponse.json({ error: 'Gagal memproses data tempat wisata.' }, { status: 500, headers: cors });
  }
}
