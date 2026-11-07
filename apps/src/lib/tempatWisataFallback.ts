import { readFile } from 'fs/promises';
import path from 'path';

export interface TempatWisataRow {
  id: number;
  country_slug: string;
  nama_wisata: string;
  penghasilan: number;
}

const ROW_REGEX = /\(\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']*(?:''[^']*)*)'\s*,\s*(\d+)\s*\)/g;

/** Pure parser for the seed .pg.sql file (same pattern the route used inline before). */
export function parseTempatWisataSql(sqlContent: string): TempatWisataRow[] {
  const rows: TempatWisataRow[] = [];
  for (const match of sqlContent.matchAll(ROW_REGEX)) {
    rows.push({
      id: Number(match[1]),
      country_slug: match[2],
      nama_wisata: match[3].replace(/''/g, "'"),
      penghasilan: Number(match[4]),
    });
  }
  return rows;
}

let cached: Promise<TempatWisataRow[]> | null = null;

/**
 * Loads and parses the fallback seed file once per process, without blocking the event loop.
 * Concurrent callers share one in-flight promise. A failed/empty load is not cached,
 * so a file that appears later is still picked up.
 */
export function getTempatWisataFallback(
  sqlPath: string = path.join(process.cwd(), '../json/10_database_tempat_wisata/database_tempat_wisata.pg.sql'),
): Promise<TempatWisataRow[]> {
  if (!cached) {
    const pending = readFile(sqlPath, 'utf8')
      .then(parseTempatWisataSql)
      .catch((): TempatWisataRow[] => []);
    cached = pending;
    void pending.then((rows) => {
      if (rows.length === 0 && cached === pending) cached = null;
    });
  }
  return cached;
}

/** Test hook. */
export function resetTempatWisataFallbackCache(): void {
  cached = null;
}

