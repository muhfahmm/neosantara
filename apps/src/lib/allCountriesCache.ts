import { applyNpcCountrySimulationStates } from '@/app/logic/npc_country_simulation/npcCountrySimulation';

let allCountriesPromise: Promise<any[]> | null = null;
let allCountriesCache: any[] | null = null;

async function doFetchAllCountries(): Promise<any[]> {
  try {
    const res = await fetch('/api/country-data?all=true');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      allCountriesCache = data;
      return data;
    }
    return [];
  } catch (error) {
    console.warn('fetchAllCountriesData failed:', error);
    return allCountriesCache || [];
  }
}

/**
 * Mengambil dataset seluruh negara (/api/country-data?all=true) secara terpusat dengan:
 * 1. Deduplikasi in-flight request (jika dipanggil oleh beberapa komponen bersamaan, hanya 1 request ke server)
 * 2. In-memory cache sehingga navigasi antar menu tidak perlu menembak HTTP request berulang kali.
 */
export async function fetchAllCountriesData(forceRefresh = false): Promise<any[]> {
  if (!forceRefresh && allCountriesCache && allCountriesCache.length > 0) {
    return allCountriesCache;
  }

  if (!forceRefresh && allCountriesPromise) {
    return allCountriesPromise;
  }

  const p = doFetchAllCountries().finally(() => {
    if (allCountriesPromise === p) {
      allCountriesPromise = null;
    }
  });

  allCountriesPromise = p;
  return p;
}

/**
 * Mengambil dataset seluruh negara yang telah diaplikasikan dengan simulasi state NPC terkini.
 */
export async function fetchAllCountriesWithNpcState(forceRefresh = false): Promise<any[]> {
  const data = await fetchAllCountriesData(forceRefresh);
  return applyNpcCountrySimulationStates(data);
}

/**
 * Membersihkan cache dataset seluruh negara (misal saat restart game).
 */
export function clearAllCountriesCache(): void {
  allCountriesCache = null;
  allCountriesPromise = null;
}
