// Embassy registry reading from database_kedutaan_besar.sql export data
import embassyData from './embassyData.json';

export interface EmbassyRecordItem {
  mitra: string;
  type: string;
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

const embassyMap: Record<string, string[]> = embassyData as Record<string, string[]>;

/**
 * Returns array of country names that have active embassies with the target country.
 */
export function getEmbassiesForCountry(countryName?: string): string[] {
  if (!countryName) return [];
  const slug = normalizeSlug(countryName);
  return embassyMap[slug] || [];
}

/**
 * Returns structured embassy records for KedutaanBesarModal list.
 */
export function getEmbassyRecordsForCountry(countryName?: string): EmbassyRecordItem[] {
  const mitras = getEmbassiesForCountry(countryName);
  return mitras.map((mitra) => ({
    mitra,
    type: 'Kedutaan Besar',
    status: 'Aktif',
  }));
}

export default getEmbassiesForCountry;
