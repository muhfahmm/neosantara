import { NextResponse, NextRequest } from 'next/server';
import { queryDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const rows = await queryDb<any[]>(
        'SELECT * FROM database_sistem_ekonomi WHERE country_slug = ? LIMIT 1',
        [slug]
      );
      return NextResponse.json(rows?.[0] || null);
    }

    const rows = await queryDb<any[]>('SELECT * FROM database_sistem_ekonomi');
    return NextResponse.json(rows || []);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { country_slug, spektrum_val, system_title, category, policy_price_control, policy_strategic_ownership, policy_trade, policy_labor } = body;

    if (!country_slug) {
      return NextResponse.json({ success: false, error: 'country_slug is required' }, { status: 400 });
    }

    await queryDb(
      `INSERT INTO database_sistem_ekonomi 
        (country_id, country_slug, country_name, iso, spektrum_val, system_title, category, policy_price_control, policy_strategic_ownership, policy_trade, policy_labor) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        spektrum_val = VALUES(spektrum_val),
        system_title = VALUES(system_title),
        category = VALUES(category),
        policy_price_control = VALUES(policy_price_control),
        policy_strategic_ownership = VALUES(policy_strategic_ownership),
        policy_trade = VALUES(policy_trade),
        policy_labor = VALUES(policy_labor)`,
      [
        body.country_id || 0,
        country_slug,
        body.country_name || country_slug,
        body.iso || 'id',
        spektrum_val ?? 50,
        system_title || 'Ekonomi Campuran (Mixed Economy)',
        category || 'Campuran',
        policy_price_control || 'Terpusat',
        policy_strategic_ownership || 'Terpusat',
        policy_trade || 'Pasar Bebas',
        policy_labor || 'Pasar Bebas',
      ]
    );

    return NextResponse.json({ success: true, message: 'Data berhasil disimpan ke database' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
