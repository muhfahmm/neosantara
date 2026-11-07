import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import { fetchDoktrin } from '@/lib/doktrinKeterbukaan';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await fetchDoktrin(
      (sql, params) => queryDb<unknown[]>(sql, params),
      searchParams.get('country'),
    );
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error querying database_doktrin_keterbukaan:', error);
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
