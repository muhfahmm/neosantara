import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

export const IMO_PERIKANAN_RESOURCES = new Set([
  "udang",
  "mutiara",
  "ikan",
]);

/**
 * Memeriksa apakah suatu negara tergabung dalam Organisasi Maritim Internasional (IMO)
 */
export function isMemberOfIMO(countryName: string): boolean {
  if (!countryName) return false;
  const members = getOrgMembers("Organisasi Maritim Internasional (IMO)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan pengganda produksi Perikanan IMO (+10% / 1.10 jika anggota IMO dan produk perikanan)
 */
export function getIMOProductionMultiplier(countryName: string, resourceKey: string): number {
  if (!isMemberOfIMO(countryName)) return 1.0;
  const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  return IMO_PERIKANAN_RESOURCES.has(normalizedKey) ? 1.10 : 1.0;
}
