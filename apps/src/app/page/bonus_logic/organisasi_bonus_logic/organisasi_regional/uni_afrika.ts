import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

/**
 * Memeriksa apakah suatu negara tergabung dalam Uni Afrika (AU)
 */
export function isMemberOfUniAfrika(countryName: string): boolean {
  if (!countryName) return false;
  const members = getOrgMembers("Uni Afrika (AU)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan persentase bonus kecepatan pembangunan (+10% jika anggota Uni Afrika)
 */
export function getUniAfrikaBuildSpeedModifier(countryName: string): number {
  return isMemberOfUniAfrika(countryName) ? 10 : 0;
}
