export interface LevelKabinet {
  id: number;
  country: string;
  country_slug: string;
  kem_infrastruktur: number;
  kem_pendidikan: number;
  kem_sains: number;
  kem_kesehatan: number;
  kem_olahraga: number;
  kem_kehakiman: number;
  kem_luar_negeri: number;
  kem_kebudayaan: number;
  kem_pariwisata: number;
  kem_lingkungan: number;
  kem_perumahan: number;
  kem_pembangunan: number;
  kem_perdagangan: number;
  kem_keuangan: number;
  keamanan_pertahanan: number;
  keamanan_dinas_keamanan: number;
  keamanan_polisi: number;
  keamanan_garda_nasional: number;
  keamanan_komandan_angkatan_darat: number;
  keamanan_komandan_armada: number;
  layanan_darurat: number;
  layanan_bank_sentral: number;
  cost: number;
}

export async function fetchLevelKabinetFromDb(slug?: string): Promise<LevelKabinet | null> {
  try {
    const url = slug
      ? `/api/level-kabinet?slug=${encodeURIComponent(slug)}`
      : `/api/level-kabinet`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) return data[0] || null;
    return data;
  } catch (err) {
    console.error('Failed to fetch level kabinet from database API:', err);
    return null;
  }
}

export async function fetchAllLevelKabinetFromDb(): Promise<LevelKabinet[]> {
  try {
    const res = await fetch('/api/level-kabinet');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch all level kabinet from database API:', err);
    return [];
  }
}
