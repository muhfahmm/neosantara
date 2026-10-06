export interface CountryProfile {
  id: number;
  country_slug: string;
  name_id: string;
  name_en: string;
  capital: string;
  lon: number;
  lat: number;
  flag: string;
  jumlah_penduduk: number;
  anggaran: number;
  pendapatan_nasional: number;
  religion: string;
  ideology: string;
  un_vote: number;
  reputasi_diplomatik: string;
  pengaruh_global: number;
  peringkat_diplomasi: number;
  sikap: string;
  kekuatan_lunak: number;
  kekuatan_keras: number;
  prestise_diplomatik: number;
}

export async function fetchCountryProfileFromDb(slug?: string): Promise<CountryProfile | null> {
  try {
    const url = slug
      ? `/api/country-data?slug=${encodeURIComponent(slug)}`
      : `/api/country-data`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) return data[0] || null;
    return data;
  } catch (err) {
    console.error('Failed to fetch country profile from database API:', err);
    return null;
  }
}

export async function fetchAllCountryProfilesFromDb(): Promise<CountryProfile[]> {
  try {
    const res = await fetch('/api/country-data');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch all country profiles from database API:', err);
    return [];
  }
}

export async function updateCountryProfileSocialData(
  countrySlug: string,
  updates: { religion?: string; ideology?: string }
): Promise<void> {
  const response = await fetch('/api/country-data', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country_slug: countrySlug, ...updates }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || 'Gagal memperbarui data sosial negara.');
  }
}

// Backward compatibility exports for legacy static data consumers
export const PROFILES_POPULATION_DATA: any[] = [];
export const PROFILES_RELIGION_DATA: any[] = [];
export const PROFILES_IDEOLOGY_DATA: any[] = [];

