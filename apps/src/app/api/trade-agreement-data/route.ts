import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';

interface TradeAgreementRow {
  country_slug: string;
  mitra_no: number;
  mitra_country: string;
  trade_type: string;
  status: string;
}

export async function GET() {
  try {
    const rows = await queryDb<TradeAgreementRow[]>(
      'SELECT country_slug, mitra_no, mitra_country, trade_type, status FROM database_mitra_perdagangan ORDER BY country_id, mitra_no'
    );

    if (rows.length === 0) {
      throw new Error('database_mitra_perdagangan returned no rows');
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error querying database_mitra_perdagangan:', error);
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
