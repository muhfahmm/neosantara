export interface SistemEkonomi {
  id: number;
  country: string;
  country_slug: string;
  iso: string;
  spektrum_val: number;
  system_title: string;
  category: string;
  policy_price_control: string;
  policy_strategic_ownership: string;
  policy_trade: string;
  policy_labor: string;
}

export async function fetchSistemEkonomiFromDb(slug?: string): Promise<SistemEkonomi | null> {
  try {
    const url = slug
      ? `/api/sistem-ekonomi?slug=${encodeURIComponent(slug)}`
      : `/api/sistem-ekonomi`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) return data[0] || null;
    return data;
  } catch (err) {
    console.error('Failed to fetch sistem ekonomi from database API:', err);
    return null;
  }
}

export async function fetchAllSistemEkonomiFromDb(): Promise<SistemEkonomi[]> {
  try {
    const res = await fetch('/api/sistem-ekonomi');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch all sistem ekonomi from database API:', err);
    return [];
  }
}

// Helper aliases
export function getSistemEkonomiBySlug(slug?: string): SistemEkonomi | null {
  return null;
}
export const SISTEM_EKONOMI_LIST: SistemEkonomi[] = [];


