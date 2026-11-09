import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import {
  getCachedResponse,
  setCachedResponse,
  buildCachedApiResponse,
} from '@/lib/apiResponseCache';

interface TradeAgreementRow {
  country_slug: string;
  mitra_no: number;
  mitra_country: string;
  trade_type: string;
  status: string;
}

const CACHE_KEY = 'api_trade_agreement_data';
const CACHE_TTL = 120 * 1000;

export async function GET(request: Request) {
  try {
    const cached = getCachedResponse(CACHE_KEY, CACHE_TTL);
    if (cached) {
      return buildCachedApiResponse(request, cached);
    }

    const rows = await queryDb<TradeAgreementRow[]>(
      'SELECT country_slug, mitra_no, mitra_country, trade_type, status FROM database_mitra_perdagangan ORDER BY country_id, mitra_no'
    );

    if (rows.length === 0) {
      throw new Error('database_mitra_perdagangan returned no rows');
    }

    const payload = await setCachedResponse(CACHE_KEY, rows);
    return buildCachedApiResponse(request, payload);
  } catch (error) {
    console.error('Error querying database_mitra_perdagangan:', error);
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
