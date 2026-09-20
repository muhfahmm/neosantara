import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryName = searchParams.get('country');

  if (!countryName) {
    return NextResponse.json({ error: 'Country is required' }, { status: 400 });
  }

  try {
    const rows = await queryDb<any[]>('SELECT * FROM database_harga_barang');
    const normInput = countryName.trim().toLowerCase();

    const matchedRow = rows.find(
      (r) =>
        r.country.toLowerCase() === normInput ||
        r.country_slug.toLowerCase() === normInput ||
        r.country_slug.replace(/_/g, ' ').toLowerCase() === normInput
    );

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
