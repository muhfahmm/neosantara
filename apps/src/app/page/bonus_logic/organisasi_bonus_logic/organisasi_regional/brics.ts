import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

/**
 * Memeriksa apakah suatu negara tergabung dalam BRICS
 */
export function isMemberOfBRICS(countryName: string): boolean {
  if (!countryName) return false;
  const members = getOrgMembers("BRICS (Brasil, Rusia, India, China, Afrika Selatan)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan pengganda pendapatan negara BRICS (+10% / 1.10 jika anggota BRICS)
 */
export function getBRICSTaxRevenueMultiplier(countryName: string): number {
  return isMemberOfBRICS(countryName) ? 1.10 : 1.0;
}
