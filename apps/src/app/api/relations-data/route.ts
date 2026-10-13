import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';

interface RelationRow {
  country_slug: string;
  target_country: string;
  relation: number;
}

export async function GET() {
  try {
    const rows = await queryDb<RelationRow[]>(
      'SELECT country_slug, target_country, relation FROM database_hubungan_antar_negara ORDER BY country_id, target_country_id'
    );

    if (rows.length === 0) {
      throw new Error('database_hubungan_antar_negara returned no rows');
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error querying database_hubungan_antar_negara:', error);
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
