export interface AlokasiSubsidi {
  id: number;
  country: string;
  country_slug: string;
  iso: string;
  sub_bbm: boolean;
  sub_listrik: boolean;
  sub_lpg: boolean;
  sub_pdam: boolean;
  sub_pupuk: boolean;
  sub_sembako: boolean;
  sub_bantuan_pangan: boolean;
  sub_pendidikan: boolean;
  sub_bpjs: boolean;
  sub_vaksin: boolean;
  sub_transport_publik: boolean;
  sub_perumahan: boolean;
  sub_ev: boolean;
  sub_kur: boolean;
  sub_pajak_umkm: boolean;
  sub_blt: boolean;
  sub_pensiun: boolean;
  sub_bencana: boolean;
}

export async function fetchAlokasiSubsidiFromDb(slug?: string): Promise<AlokasiSubsidi | null> {
  try {
    const url = slug
      ? `/api/alokasi-subsidi?slug=${encodeURIComponent(slug)}`
      : `/api/alokasi-subsidi`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) return data[0] || null;
    return data;
  } catch (err) {
    console.error('Failed to fetch alokasi subsidi from database API:', err);
    return null;
  }
}

export async function fetchAllAlokasiSubsidiFromDb(): Promise<AlokasiSubsidi[]> {
  try {
    const res = await fetch('/api/alokasi-subsidi');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch all alokasi subsidi from database API:', err);
    return [];
  }
}

// Helper alias
export const getSubsidiBySlug = fetchAlokasiSubsidiFromDb;

