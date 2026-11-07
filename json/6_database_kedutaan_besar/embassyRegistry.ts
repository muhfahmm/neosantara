export interface EmbassyRecordItem {
  mitra: string;
  type: string;
  status: string;
}

export interface EmbassyDataRow {
  country_slug: string;
  mitra_country: string;
  embassy_type: string;
  status: string;
}

const normalizeSlug = (name?: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

let embassyMap: Record<string, EmbassyRecordItem[]> = {};

export function setEmbassyData(rows: EmbassyDataRow[]): void {
  const nextEmbassyMap: Record<string, EmbassyRecordItem[]> = {};

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row && row.country_slug && row.mitra_country) {
      const slug = row.country_slug;
      (nextEmbassyMap[slug] ??= []).push({
        mitra: row.mitra_country,
        type: row.embassy_type || 'Kedutaan Besar',
        status: row.status || 'Aktif',
      });
    }
  }

  if (rows.length === 0) {
    throw new Error('database_kedutaan_besar returned no rows');
  }

  embassyMap = nextEmbassyMap;
}

/**
 * Returns array of country names that have active embassies with the target country.
 */
export function getEmbassiesForCountry(countryName?: string): string[] {
  if (!countryName) return [];
  const slug = normalizeSlug(countryName);
  return (embassyMap[slug] || [])
    .filter(embassy => embassy.status.toLowerCase() === 'aktif')
    .map(embassy => embassy.mitra);
}

/**
 * Returns structured embassy records for KedutaanBesarModal list.
 */
export function getEmbassyRecordsForCountry(countryName?: string): EmbassyRecordItem[] {
  if (!countryName) return [];
  return (embassyMap[normalizeSlug(countryName)] || [])
    .filter(embassy => embassy.status.toLowerCase() === 'aktif');
}

export default getEmbassiesForCountry;
