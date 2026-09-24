import { NextResponse, NextRequest } from 'next/server';
import { queryDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const rows = await queryDb<any[]>(
        'SELECT * FROM database_alokasi_subsidi WHERE country_slug = ? LIMIT 1',
        [slug]
      );
      return NextResponse.json(rows?.[0] || null);
    }

    const rows = await queryDb<any[]>('SELECT * FROM database_alokasi_subsidi');
    return NextResponse.json(rows || []);
  } catch (error: any) {
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { country_slug, country_id, country_name, iso, ...subsidyStates } = body;

    if (!country_slug) {
      return NextResponse.json({ success: false, error: 'country_slug is required' }, { status: 400 });
    }

    const keys = [
      'sub_bbm', 'sub_listrik', 'sub_lpg', 'sub_pdam',
      'sub_pupuk', 'sub_sembako', 'sub_bantuan_pangan',
      'sub_pendidikan', 'sub_bpjs', 'sub_vaksin',
      'sub_transport_publik', 'sub_perumahan', 'sub_ev',
      'sub_kur', 'sub_pajak_umkm',
      'sub_blt', 'sub_pensiun', 'sub_bencana'
    ];

    const columns = ['country_id', 'country_slug', 'country_name', 'iso', ...keys];
    const placeholders = columns.map(() => '?').join(', ');
    const updateClauses = keys.map((k) => `${k} = VALUES(${k})`).join(', ');

    const values = [
      country_id || 0,
      country_slug,
      country_name || country_slug,
      iso || 'id',
      ...keys.map((k) => (subsidyStates[k] !== undefined ? Boolean(subsidyStates[k]) : true))
    ];

    await queryDb(
      `INSERT INTO database_alokasi_subsidi (${columns.join(', ')})
       VALUES (${placeholders})
       ON DUPLICATE KEY UPDATE ${updateClauses}`,
      values
    );

    return NextResponse.json({ success: true, message: 'Status alokasi subsidi berhasil disimpan' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
