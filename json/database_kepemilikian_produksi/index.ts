export interface KepemilikanProduksi {
  id: number;
  country: string;
  country_slug: string;
  kelistrikan: number;
  mineral_energi: number;
  manufaktur: number;
  peternakan: number;
  agrikultur: number;
  perikanan: number;
  olahan_pangan: number;
}

export const KEPEMILIKAN_PRODUKSI_FIELDS = [
  "kelistrikan",
  "mineral_energi",
  "manufaktur",
  "peternakan",
  "agrikultur",
  "perikanan",
  "olahan_pangan",
] as const;

export type KepemilikanProduksiSector = (typeof KEPEMILIKAN_PRODUKSI_FIELDS)[number];

interface CountryDataOwnership {
  __fileOrder?: number;
  name_id?: string;
  country_slug?: string;
  sector_nationalization?: Partial<Record<KepemilikanProduksiSector, number>>;
}

function toKepemilikanProduksi(country: CountryDataOwnership): KepemilikanProduksi | null {
  if (!country.country_slug || !country.sector_nationalization) return null;
  return {
    id: Number(country.__fileOrder) || 0,
    country: country.name_id || country.country_slug,
    country_slug: country.country_slug,
    kelistrikan: Number(country.sector_nationalization.kelistrikan) || 0,
    mineral_energi: Number(country.sector_nationalization.mineral_energi) || 0,
    manufaktur: Number(country.sector_nationalization.manufaktur) || 0,
    peternakan: Number(country.sector_nationalization.peternakan) || 0,
    agrikultur: Number(country.sector_nationalization.agrikultur) || 0,
    perikanan: Number(country.sector_nationalization.perikanan) || 0,
    olahan_pangan: Number(country.sector_nationalization.olahan_pangan) || 0,
  };
}

export async function fetchKepemilikanProduksiFromDb(
  slug?: string
): Promise<KepemilikanProduksi | null> {
  if (!slug) return null;
  const response = await fetch(`/api/country-data?path=${encodeURIComponent(slug)}`);
  if (!response.ok) throw new Error(`Permintaan kepemilikan produksi gagal (${response.status}).`);
  const country = (await response.json()) as CountryDataOwnership;
  return toKepemilikanProduksi(country);
}

export async function fetchAllKepemilikanProduksiFromDb(): Promise<KepemilikanProduksi[]> {
  const response = await fetch("/api/country-data?all=true");
  if (!response.ok) throw new Error(`Permintaan kepemilikan produksi gagal (${response.status}).`);
  const data = (await response.json()) as CountryDataOwnership[];
  if (!Array.isArray(data)) throw new Error("Respons data kepemilikan produksi tidak valid.");
  return data
    .map(toKepemilikanProduksi)
    .filter((country): country is KepemilikanProduksi => country !== null);
}
