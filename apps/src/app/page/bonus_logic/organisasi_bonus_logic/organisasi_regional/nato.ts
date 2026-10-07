import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

/**
 * Memeriksa apakah suatu negara tergabung dalam NATO (Pakta Pertahanan Atlantik Utara)
 */
export function isMemberOfNATO(countryName: string): boolean {
  if (!countryName) return false;
  const members = getOrgMembers("Pakta Pertahanan Atlantik Utara (NATO)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan pengganda kekuatan militer NATO (+15% / 1.15 jika anggota NATO)
 */
export function getNATOMilitaryMultiplier(countryName: string): number {
  return isMemberOfNATO(countryName) ? 1.15 : 1.0;
}
