import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';
import { fetchAllCountriesData } from '@/lib/allCountriesCache';

// Cache in-memory untuk menyimpan data ISO dari API MySQL / Database
let databaseCountryIsoCache: Record<string, string> | null = null;
let isFetchingDatabase = false;

function normalizeCountryName(name: unknown): string {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeIsoCode(value: unknown): string {
  const iso = String(value || '').trim().toLowerCase();
  return /^[a-z]{2}$/.test(iso) && iso !== 'un' ? iso : '';
}

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  canada: 'kanada',
  'north korea': 'korea utara',
  'south korea': 'korea selatan',
};

/**
 * Mengambil data ISO negara dari database (/api/country-data?all=true) secara dinamis.
 */
export async function initCountryIsoFromDatabase(): Promise<Record<string, string>> {
  if (databaseCountryIsoCache) return databaseCountryIsoCache;

  if (typeof window === 'undefined') {
    return loadFallbackIsoMap();
  }

  if (isFetchingDatabase) {
    // Tunggu sampai fetch selesai jika sedang diproses
    await new Promise(resolve => setTimeout(resolve, 300));
    return databaseCountryIsoCache || loadFallbackIsoMap();
  }

  isFetchingDatabase = true;
  try {
    const data = await fetchAllCountriesData();
    if (Array.isArray(data) && data.length > 0) {
      const isoMap: Record<string, string> = {};
      data.forEach((c: any) => {
        const iso = normalizeIsoCode(c.iso);
        if (!iso) return;
        [c.name_id, c.name_en, c.country, c.country_slug].forEach(name => {
          const key = normalizeCountryName(name);
          if (key) isoMap[key] = iso;
        });
      });
      databaseCountryIsoCache = isoMap;
      isFetchingDatabase = false;
      return isoMap;
    }
  } catch (e) {
    console.error('Failed fetching ISO from /api/country-data:', e);
  }
  isFetchingDatabase = false;
  return loadFallbackIsoMap();
}

/**
 * Fallback jika API belum selesai atau di server-side rendering
 */
function loadFallbackIsoMap(): Record<string, string> {
  const isoMap: Record<string, string> = {};
  if (Array.isArray(COUNTRIES_DATA)) {
    COUNTRIES_DATA.forEach((c: any) => {
      const key = normalizeCountryName(c.country);
      const iso = normalizeIsoCode(c.iso);
      if (key && iso) isoMap[key] = iso;
    });
  }
  return isoMap;
}

/**
 * Fungsi pencarian ISO berdasarkan nama negara dari database.
 */
export function getIsoForCountryName(name: string): string {
  const key = normalizeCountryName(name);
  if (!key) return 'un';
  const alias = COUNTRY_NAME_ALIASES[key];

  // 1. Cek dari cache Database MySQL jika sudah terisi
  if (databaseCountryIsoCache) {
    const iso = normalizeIsoCode(databaseCountryIsoCache[key] || (alias && databaseCountryIsoCache[alias]));
    if (iso) return iso;
  }

  // 2. Cek dari COUNTRIES_DATA / local fallback
  if (Array.isArray(COUNTRIES_DATA)) {
    const found = COUNTRIES_DATA.find(
      (c: any) => normalizeCountryName(c?.country) === (alias || key)
    );
    const iso = normalizeIsoCode(found?.iso);
    if (iso) return iso;
  }

  // Panggil fetch async di background agar cache terisi untuk pemanggilan selanjutnya
  if (typeof window !== 'undefined' && !databaseCountryIsoCache && !isFetchingDatabase) {
    initCountryIsoFromDatabase();
  }

  return 'un';
}
