import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryName = searchParams.get('country');

  try {
    const rows = await queryDb<any[]>('SELECT * FROM database_sda');

    if (!countryName) {
      const result: Record<string, any> = {};
      for (const row of rows) {
        result[row.country] = {
          emas: Boolean(row.emas),
          uranium: Boolean(row.uranium),
          batu_bara: Boolean(row.batu_bara),
          minyak_bumi: Boolean(row.minyak_bumi),
          gas_alam: Boolean(row.gas_alam),
          garam: Boolean(row.garam),
          litium: Boolean(row.litium),
          logam_tanah_jarang: Boolean(row.logam_tanah_jarang),
          bijih_besi: Boolean(row.bijih_besi),
        };
      }
      return NextResponse.json(result);
    }

    const normInput = countryName.trim().toLowerCase();
    const matchedRow = rows.find(
      (r) =>
        r.country.toLowerCase() === normInput ||
        r.country_slug.toLowerCase() === normInput ||
        r.country_slug.replace(/_/g, ' ').toLowerCase() === normInput
    );

    if (!matchedRow) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    const sdaObj = {
      emas: Boolean(matchedRow.emas),
      uranium: Boolean(matchedRow.uranium),
      batu_bara: Boolean(matchedRow.batu_bara),
      minyak_bumi: Boolean(matchedRow.minyak_bumi),
      gas_alam: Boolean(matchedRow.gas_alam),
      garam: Boolean(matchedRow.garam),
      litium: Boolean(matchedRow.litium),
      logam_tanah_jarang: Boolean(matchedRow.logam_tanah_jarang),
      bijih_besi: Boolean(matchedRow.bijih_besi),
    };

    return NextResponse.json(sdaObj);
  } catch (error) {
    console.error('Error querying database_sda from MySQL:', error);
    return NextResponse.json({ error: 'Failed to fetch SDA data' }, { status: 500 });
  }
}
