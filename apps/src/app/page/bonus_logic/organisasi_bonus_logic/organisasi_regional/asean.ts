import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

/**
 * Memeriksa apakah suatu negara tergabung dalam ASEAN (Perhimpunan Bangsa-Bangsa Asia Tenggara)
 */
export function isMemberOfASEAN(countryName: string): boolean {
  if (!countryName) return false;
  const members = getOrgMembers("Perhimpunan Bangsa-Bangsa Asia Tenggara (ASEAN)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan persentase bonus kecepatan pembangunan (+10% jika anggota ASEAN)
 */
export function getASEANBuildSpeedModifier(countryName: string): number {
  return isMemberOfASEAN(countryName) ? 10 : 0;
}
