import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';

// Cache in-memory untuk menyimpan data ISO dari API MySQL / Database
let databaseCountryIsoCache: Record<string, string> | null = null;
let isFetchingDatabase = false;

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
    const res = await fetch('/api/country-data?all=true');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const isoMap: Record<string, string> = {};
        data.forEach((c: any) => {
          const iso = (c.iso || c.country_slug || '').toLowerCase();
          if (c.name_id) isoMap[c.name_id.trim().toLowerCase()] = iso;
          if (c.name_en) isoMap[c.name_en.trim().toLowerCase()] = iso;
          if (c.country) isoMap[String(c.country).trim().toLowerCase()] = iso;
          if (c.country_slug) isoMap[c.country_slug.trim().toLowerCase()] = iso;
        });
        databaseCountryIsoCache = isoMap;
        isFetchingDatabase = false;
        return isoMap;
      }
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
      if (c.country && c.iso) {
        isoMap[String(c.country).trim().toLowerCase()] = String(c.iso).toLowerCase();
      }
    });
  }
  return isoMap;
}

/**
 * Fungsi pencarian ISO berdasarkan nama negara dari database.
 */
export function getIsoForCountryName(name: string): string {
  const key = (name || '').trim().toLowerCase();
  if (!key) return 'un';

  // 1. Cek dari cache Database MySQL jika sudah terisi
  if (databaseCountryIsoCache && databaseCountryIsoCache[key]) {
    return databaseCountryIsoCache[key];
  }

  // 2. Cek dari COUNTRIES_DATA / local fallback
  if (Array.isArray(COUNTRIES_DATA)) {
    const found = COUNTRIES_DATA.find(
      (c: any) => c?.country && String(c.country).trim().toLowerCase() === key
    );
    if (found?.iso) return String(found.iso).toLowerCase();
  }

  // Panggil fetch async di background agar cache terisi untuk pemanggilan selanjutnya
  if (typeof window !== 'undefined' && !databaseCountryIsoCache && !isFetchingDatabase) {
    initCountryIsoFromDatabase();
  }

  return 'un';
}
