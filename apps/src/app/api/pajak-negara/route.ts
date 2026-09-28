import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const country = searchParams.get('country');

    const pool = await getDbPool();

    const mapRow = (row: any) => ({
      id: row.id,
      country: row.country,
      country_slug: row.country_slug,
      tarif_ppn: Number(row.tarif_ppn) || 0,
      tarif_korporasi: Number(row.tarif_korporasi) || 0,
      tarif_penghasilan: Number(row.tarif_penghasilan) || 0,
      tarif_bea_cukai: Number(row.tarif_bea_cukai) || 0,
      tarif_lingkungan: Number(row.tarif_lingkungan) || 0,
    });

    if (slug) {
      const [rows]: any = await pool.query(
        'SELECT * FROM database_pajak_negara WHERE LOWER(country_slug) = LOWER(?) LIMIT 1',
        [slug.trim()]
      );
      if (rows.length > 0) return NextResponse.json(mapRow(rows[0]));
      return NextResponse.json(null);
    }

    if (country) {
      const [rows]: any = await pool.query(
        'SELECT * FROM database_pajak_negara WHERE LOWER(country) = LOWER(?) LIMIT 1',
        [country.trim()]
      );
      if (rows.length > 0) return NextResponse.json(mapRow(rows[0]));
      return NextResponse.json(null);
    }

    const [rows]: any = await pool.query('SELECT * FROM database_pajak_negara');
    return NextResponse.json(rows.map(mapRow));
  } catch (error: any) {
    console.error('Error querying database_pajak_negara:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
