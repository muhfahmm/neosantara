export type QueryFn = (sql: string, params?: unknown[]) => Promise<unknown[]>;

export interface DoktrinKeterbukaan {
  id: unknown;
  country: unknown;
  name_en: unknown;
  speechScore: unknown;
  religionScore: unknown;
  demoScore: unknown;
  transparencyScore: unknown;
  mediaScore: unknown;
  internetScore: unknown;
  borderScore: unknown;
  tradeScore: unknown;
  diplomacyScore: unknown;
  opennessIndex: unknown;
}

type Row = Record<string, unknown>;

export function mapDoktrinRow(row: Row): DoktrinKeterbukaan {
  return {
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
  };
}

/**
 * One country (by local or English name, case-insensitive) when it matches;
 * otherwise every row. Uses PostgreSQL `$n` placeholders (pg driver).
 */
export async function fetchDoktrin(
  query: QueryFn,
  country: string | null,
): Promise<DoktrinKeterbukaan | DoktrinKeterbukaan[]> {
  const name = country?.trim();
  if (name) {
    const rows = (await query(
      'SELECT * FROM database_doktrin_keterbukaan WHERE LOWER(country) = LOWER($1) OR LOWER(name_en) = LOWER($1) LIMIT 1',
      [name],
    )) as Row[];
    if (rows.length > 0) {
      return mapDoktrinRow(rows[0]);
    }
  }
  const all = (await query('SELECT * FROM database_doktrin_keterbukaan')) as Row[];
  return all.map(mapDoktrinRow);
}
