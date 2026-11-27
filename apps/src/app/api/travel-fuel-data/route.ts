import { NextResponse } from "next/server";
import { z } from "zod";
import { queryDb } from "@/lib/db";
import { checkRateLimit, createRateLimitErrorResponse, getCorsHeaders } from "@/lib/rateLimit";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TravelFuelRow {
  country_slug: string;
  target_country_slug: string;
  konsumsi_minyak: number | string;
}

// Validasi query parameters secara ketat (.strict() menolak parameter tak dikenal)
const TravelFuelParamsSchema = z.object({
  origin: z.string().trim().min(1).max(100),
  target: z.string().trim().min(1).max(100),
}).strict().refine(data => data.origin.toLowerCase() !== data.target.toLowerCase(), {
  message: "Asal (origin) dan tujuan (target) tidak boleh sama",
});

export async function GET(request: Request) {
  const cors = getCorsHeaders(request);

  // Rate Limiting (standard: 60 req/min)
  const limitRes = await checkRateLimit(request, 'standard');
  if (!limitRes.success) {
    return createRateLimitErrorResponse(limitRes.retryAfter, request);
  }

  const { searchParams } = new URL(request.url);
  const rawParams = Object.fromEntries(searchParams.entries());

  const parsed = TravelFuelParamsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parameter tidak valid: " + parsed.error.issues.map(i => i.message).join(", ") },
      { status: 400, headers: cors }
    );
  }

  const origin = parsed.data.origin.toLowerCase();
  const target = parsed.data.target.toLowerCase();

  try {
    const rows = await queryDb<TravelFuelRow[]>(
      `SELECT country_slug, target_country_slug, konsumsi_minyak
       FROM database_perjalanan_antar_negara
       WHERE country_slug = $1 AND target_country_slug = $2
       LIMIT 1`,
      [origin, target],
    );
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "Data konsumsi bahan bakar rute tidak ditemukan." }, { status: 404, headers: cors });
    }

    const consumption = Number(row.konsumsi_minyak);
    if (!Number.isFinite(consumption) || consumption < 0) {
      throw new Error("Invalid konsumsi_minyak in database_perjalanan_antar_negara");
    }

    return NextResponse.json({
      country_slug: row.country_slug,
      target_country_slug: row.target_country_slug,
      konsumsi_minyak: consumption,
    }, { headers: cors });
  } catch (error) {
    console.error("Error querying database_perjalanan_antar_negara:", error);
    return NextResponse.json({ error: "Gagal memproses data rute perjalanan." }, { status: 500, headers: cors });
  }
}
