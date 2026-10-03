import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';

/**
 * Peta nama negara (sesuai pool notifikasi bulanan) -> kode ISO untuk bendera.
 */
const STATIC_NAME_TO_ISO: Record<string, string> = {
  'jepang': 'jp',
  'amerika serikat': 'us',
  'jerman': 'de',
  'inggris': 'gb',
  'prancis': 'fr',
  'perancis': 'fr',
  'tiongkok': 'cn',
  'china': 'cn',
  'korea selatan': 'kr',
  'korea utara': 'kp',
  'australia': 'au',
  'rusia': 'ru',
  'arab saudi': 'sa',
  'kanada': 'ca',
  'brasil': 'br',
  'brazil': 'br',
  'india': 'in',
  'turki': 'tr',
  'meksiko': 'mx',
  'singapura': 'sg',
  'malaysia': 'my',
  'thailand': 'th',
  'vietnam': 'vn',
  'indonesia': 'id'
};

export function getIsoForCountryName(name: string): string {
  const key = (name || '').trim().toLowerCase();
  if (!key) return 'un';
  if (STATIC_NAME_TO_ISO[key]) return STATIC_NAME_TO_ISO[key];

  try {
    if (Array.isArray(COUNTRIES_DATA)) {
      const found = COUNTRIES_DATA.find((c: any) => c?.country && String(c.country).trim().toLowerCase() === key);
      if (found?.iso) return String(found.iso).toLowerCase();
    }
  } catch (e) {}

  return 'un';
}
