import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import {
  getCachedResponse,
  setCachedResponse,
  buildCachedApiResponse,
} from '@/lib/apiResponseCache';

interface EmbassyRow {
  country_slug: string;
  mitra_country: string;
  embassy_type: string;
  status: string;
}

const CACHE_KEY = 'api_embassy_data';
const CACHE_TTL = 120 * 1000;

export async function GET(request: Request) {
  try {
    const cached = getCachedResponse(CACHE_KEY, CACHE_TTL);
    if (cached) {
      return buildCachedApiResponse(request, cached);
    }

    const rows = await queryDb<EmbassyRow[]>(
      'SELECT country_slug, mitra_country, embassy_type, status FROM database_kedutaan_besar ORDER BY country_id, mitra_no'
    );

    if (rows.length === 0) {
      throw new Error('database_kedutaan_besar returned no rows');
    }

    const payload = setCachedResponse(CACHE_KEY, rows);
    return buildCachedApiResponse(request, payload);
  } catch (error) {
    console.error('Error querying database_kedutaan_besar:', error);
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
