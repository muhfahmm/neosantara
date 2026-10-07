import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

export const OPEC_OIL_RESOURCES = new Set([
  "minyak",
  "minyak_bumi",
]);

/**
 * Memeriksa apakah suatu negara tergabung dalam OPEC (Organisasi Negara-Negara Pengekspor Minyak Bumi)
 */
export function isMemberOfOPEC(countryName: string): boolean {
  if (!countryName) return false;
  const members = getOrgMembers("Organisasi Negara-Negara Pengekspor Minyak Bumi (OPEC)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan pengganda harga jual komoditas minyak OPEC (+20% / 1.20 jika anggota OPEC & minyak)
 */
export function getOPECSellPriceMultiplier(countryName: string, resourceKey: string): number {
  if (!isMemberOfOPEC(countryName)) return 1.0;
  const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  return OPEC_OIL_RESOURCES.has(normalizedKey) ? 1.20 : 1.0;
}

/**
 * Mengembalikan pengganda harga beli komoditas minyak OPEC (-20% / 0.80 jika anggota OPEC & minyak)
 */
export function getOPECBuyPriceMultiplier(countryName: string, resourceKey: string): number {
  if (!isMemberOfOPEC(countryName)) return 1.0;
  const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  return OPEC_OIL_RESOURCES.has(normalizedKey) ? 0.80 : 1.0;
}
