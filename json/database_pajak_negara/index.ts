export interface PajakNegara {
  id: number;
  country: string;
  country_slug: string;
  tarif_ppn: number;
  tarif_korporasi: number;
  tarif_penghasilan: number;
  tarif_bea_cukai: number;
  tarif_lingkungan: number;
}

export async function fetchPajakNegaraFromDb(slug?: string): Promise<PajakNegara | null> {
  try {
    const url = slug
      ? `/api/pajak-negara?slug=${encodeURIComponent(slug)}`
      : `/api/pajak-negara`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) return data[0] || null;
    return data;
  } catch (err) {
    console.error('Failed to fetch pajak negara from database API:', err);
    return null;
  }
}

export async function fetchAllPajakNegaraFromDb(): Promise<PajakNegara[]> {
  try {
    const res = await fetch('/api/pajak-negara');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch all pajak negara from database API:', err);
    return [];
  }
}
