import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

/**
 * Memeriksa apakah suatu negara tergabung dalam Liga Arab
 */
export function isMemberOfLigaArab(countryName: string): boolean {
  if (!countryName) return false;
  const members = getOrgMembers("Liga Arab");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan tambahan suara PBB (+5 suara untuk setiap negara anggota Liga Arab)
 */
export function getLigaArabUNVoteBonus(countryName: string): number {
  return isMemberOfLigaArab(countryName) ? 5 : 0;
}
