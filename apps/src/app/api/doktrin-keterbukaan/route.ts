import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    const pool = await getDbPool();

    const mapRow = (row: any) => ({
      id: row.id,
      country: row.country,
      name_en: row.name_en,
      speechScore: row.speech_score ?? row.speechScore,
      religionScore: row.religion_score ?? row.religionScore,
      demoScore: row.demo_score ?? row.demoScore,
      transparencyScore: row.transparency_score ?? row.transparencyScore,
      mediaScore: row.media_score ?? row.mediaScore,
      internetScore: row.internet_score ?? row.internetScore,
      borderScore: row.border_score ?? row.borderScore,
      tradeScore: row.trade_score ?? row.tradeScore,
      diplomacyScore: row.diplomacy_score ?? row.diplomacyScore,
      opennessIndex: row.openness_index ?? row.opennessIndex,
    });

    if (country) {
      const [rows]: any = await pool.query(
        'SELECT * FROM database_doktrin_keterbukaan WHERE LOWER(country) = LOWER(?) OR LOWER(name_en) = LOWER(?) LIMIT 1',
        [country.trim(), country.trim()]
      );

      if (rows.length > 0) {
        return NextResponse.json(mapRow(rows[0]));
      }
    }

    const [rows]: any = await pool.query('SELECT * FROM database_doktrin_keterbukaan');
    return NextResponse.json(rows.map(mapRow));
  } catch (error: any) {
    console.error('Error querying database_doktrin_keterbukaan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
