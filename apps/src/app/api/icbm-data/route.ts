import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';

export async function GET() {
  try {
    const rows = await queryDb<any[]>('SELECT * FROM database_icbm_negara ORDER BY country_id ASC');
    return NextResponse.json(rows || []);
  } catch (error) {
    console.error('Error querying database_icbm_negara:', error);
    return NextResponse.json({ error: 'Gagal mengambil data ICBM' }, { status: 500 });
  }
}
