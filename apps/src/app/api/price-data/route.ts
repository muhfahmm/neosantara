import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryName = searchParams.get('country');

  if (!countryName) {
    return NextResponse.json({ error: 'Country is required' }, { status: 400 });
  }

  try {
    const rows = await queryDb<any[]>(
      `SELECT country, country_slug, harga_beras, harga_daging_sapi, harga_ayam,
              harga_minyak_goreng, harga_gula, harga_telur, harga_listrik, harga_air
       FROM database_harga_barang
       WHERE LOWER(country) = LOWER($1)
          OR LOWER(country_slug) = LOWER($1)
          OR REPLACE(LOWER(country_slug), '_', ' ') = LOWER($1)
       LIMIT 1`,
      [countryName.trim()]
    );

    const matchedRow = rows[0];
    if (!matchedRow) {
      return NextResponse.json({ country: countryName, prices: null });
    }

    const prices = {
      harga_beras: Number(matchedRow.harga_beras || 0),
      harga_daging_sapi: Number(matchedRow.harga_daging_sapi || 0),
      harga_ayam: Number(matchedRow.harga_ayam || 0),
      harga_minyak_goreng: Number(matchedRow.harga_minyak_goreng || 0),
      harga_gula: Number(matchedRow.harga_gula || 0),
      harga_telur: Number(matchedRow.harga_telur || 0),
      harga_listrik: Number(matchedRow.harga_listrik || 0),
      harga_air: Number(matchedRow.harga_air || 0),
    };

    return NextResponse.json({ country: countryName, prices });
  } catch (error) {
    console.error('Failed to fetch price data from XAMPP MySQL:', error);
    return NextResponse.json({ error: 'Failed to read price data' }, { status: 500 });
  }
}
