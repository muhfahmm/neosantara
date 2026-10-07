import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

/**
 * Memeriksa apakah suatu negara tergabung dalam Interpol
 */
export function isMemberOfInterpol(countryName: string): boolean {
  if (!countryName) return false;
  const members = getOrgMembers("Interpol");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan modifier risiko kejahatan (dalam persentase, misal -5 untuk penurunan 5%)
 * Jika negara adalah anggota Interpol: -5%
 * Jika bukan anggota Interpol: 0%
 */
export function getInterpolCrimeRiskModifier(countryName: string): number {
  return isMemberOfInterpol(countryName) ? -5 : 0;
}
