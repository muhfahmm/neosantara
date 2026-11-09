import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import {
  getCachedResponse,
  setCachedResponse,
  buildCachedApiResponse,
} from '@/lib/apiResponseCache';

interface RelationRow {
  country_slug: string;
  target_country: string;
  relation: number;
}

const CACHE_KEY = 'api_relations_data';
const CACHE_TTL = 120 * 1000; // 2 minutes

export async function GET(request: Request) {
  try {
    const cached = getCachedResponse(CACHE_KEY, CACHE_TTL);
    if (cached) {
      return buildCachedApiResponse(request, cached);
    }

    const rows = await queryDb<RelationRow[]>(
      'SELECT country_slug, target_country, relation FROM database_hubungan_antar_negara ORDER BY country_id, target_country_id'
    );

    if (rows.length === 0) {
      throw new Error('database_hubungan_antar_negara returned no rows');
    }

    const payload = await setCachedResponse(CACHE_KEY, rows);
    return buildCachedApiResponse(request, payload);
  } catch (error) {
    console.error('Error querying database_hubungan_antar_negara:', error);
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
