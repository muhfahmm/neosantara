import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

/**
 * Memeriksa apakah suatu negara tergabung dalam UNESCO
 */
export function isMemberOfUNESCO(countryName: string): boolean {
  if (!countryName) return false;
  const members = getOrgMembers("UNESCO");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan modifier kecepatan riset sains UNESCO (dalam persentase)
 * Jika negara adalah anggota UNESCO: -5% durasi riset (kecepatan riset sains +5%)
 * Jika bukan anggota UNESCO: 0%
 */
export function getUNESCOResearchModifier(countryName: string): number {
  return isMemberOfUNESCO(countryName) ? -5 : 0;
}
