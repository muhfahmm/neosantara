import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';

interface EmbassyRow {
  country_slug: string;
  mitra_country: string;
  embassy_type: string;
  status: string;
}

export async function GET() {
  try {
    const rows = await queryDb<EmbassyRow[]>(
      'SELECT country_slug, mitra_country, embassy_type, status FROM database_kedutaan_besar ORDER BY country_id, mitra_no'
    );

    if (rows.length === 0) {
      throw new Error('database_kedutaan_besar returned no rows');
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error querying database_kedutaan_besar:', error);
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
