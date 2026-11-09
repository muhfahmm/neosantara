import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import {
  getCachedResponse,
  setCachedResponse,
  buildCachedApiResponse,
} from '@/lib/apiResponseCache';

const CACHE_KEY = 'api_game_bootstrap';
const CACHE_TTL = 120 * 1000;

interface RelationRow {
  country_slug: string;
  target_country: string;
  relation: number;
}

interface EmbassyRow {
  country_slug: string;
  mitra_country: string;
  embassy_type: string;
  status: string;
}

interface TradeAgreementRow {
  country_slug: string;
  mitra_no: number;
  mitra_country: string;
  trade_type: string;
  status: string;
}

interface BuildingMetadataRow {
  source_file: string;
  file_order: number;
  entry_key: string;
  entry_order: number;
  metadata: Record<string, unknown>;
}

export async function GET(request: Request) {
  try {
    const cached = getCachedResponse(CACHE_KEY, CACHE_TTL);
    if (cached) {
      return buildCachedApiResponse(request, cached);
    }

    const [relations, embassies, tradeAgreements, buildingRows] = await Promise.all([
      queryDb<RelationRow[]>(
        'SELECT country_slug, target_country, relation FROM database_hubungan_antar_negara ORDER BY country_id, target_country_id'
      ),
      queryDb<EmbassyRow[]>(
        'SELECT country_slug, mitra_country, embassy_type, status FROM database_kedutaan_besar ORDER BY country_id, mitra_no'
      ),
      queryDb<TradeAgreementRow[]>(
        'SELECT country_slug, mitra_no, mitra_country, trade_type, status FROM database_mitra_perdagangan ORDER BY country_id, mitra_no'
      ),
      queryDb<BuildingMetadataRow[]>(
        'SELECT source_file, file_order, entry_key, entry_order, metadata FROM database_building_metadata ORDER BY file_order, entry_order'
      ),
    ]);

    const buildingMetadata: Record<string, unknown> = {};
    for (const row of buildingRows) {
      buildingMetadata[row.entry_key] = row.metadata;
    }

    const bundle = {
      relations,
      embassies,
      tradeAgreements,
      buildingMetadata,
    };

    const payload = await setCachedResponse(CACHE_KEY, bundle);
    return buildCachedApiResponse(request, payload);
  } catch (error) {
    console.error('Error in /api/game-bootstrap:', error);
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
