import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

export const ILO_MANUFAKTUR_RESOURCES = new Set([
  "pabrik_semikonduktor",
  "pabrik_mesin_mobil",
  "pabrik_mesin_motor",
  "semen_beton",
  "kayu",
]);

/**
 * Memeriksa apakah suatu negara tergabung dalam Organisasi Buruh Internasional (ILO)
 */
export function isMemberOfILO(countryName: string): boolean {
  if (!countryName) return false;
  const members = getOrgMembers("Organisasi Buruh Internasional (ILO)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan pengganda produksi Manufaktur ILO (+10% / 1.10 jika anggota ILO dan produk manufaktur)
 */
export function getILOProductionMultiplier(countryName: string, resourceKey: string): number {
  if (!isMemberOfILO(countryName)) return 1.0;
  const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  return ILO_MANUFAKTUR_RESOURCES.has(normalizedKey) ? 1.10 : 1.0;
}

