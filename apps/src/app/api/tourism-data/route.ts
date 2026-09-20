import { NextRequest, NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryName = searchParams.get('country');

  try {
    const rows = await queryDb<any[]>('SELECT * FROM database_tempat_wisata');

    if (!countryName) {
      return NextResponse.json({
        status: 'ok',
        data: rows,
      });
    }

    const normInput = countryName.trim().toLowerCase();
    const matchedRows = rows.filter(
      (r) =>
        r.country_slug.toLowerCase() === normInput ||
        r.country_slug.replace(/_/g, ' ').toLowerCase() === normInput
    );

    const tempat_wisata = matchedRows.map((r) => ({
      nama: r.nama_wisata,
      penghasilan: r.penghasilan,
    }));

    return NextResponse.json({
      country: countryName,
      tempat_wisata,
    });
  } catch (error) {
    console.error('Failed to fetch tourism data from XAMPP MySQL:', error);
    return NextResponse.json({ error: 'Failed to fetch tourism data' }, { status: 500 });
  }
}
