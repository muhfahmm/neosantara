import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

/**
 * Memeriksa apakah suatu negara tergabung dalam Uni Eropa (EU)
 */
export function isMemberOfEU(countryName: string): boolean {
  if (!countryName) return false;
  const members = getOrgMembers("Uni Eropa (EU)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan pengganda penerimaan pajak Uni Eropa (+10% / 1.10 jika anggota EU)
 */
export function getEUTaxRevenueMultiplier(countryName: string): number {
  return isMemberOfEU(countryName) ? 1.10 : 1.0;
}
