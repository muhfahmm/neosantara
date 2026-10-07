import { getOrgMembers } from "@/../../json/database_organisasi_internasional";
import { isUserJoinedOrg } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";

/**
 * Memeriksa apakah suatu negara tergabung dalam ASEAN (Perhimpunan Bangsa-Bangsa Asia Tenggara)
 */
export function isMemberOfASEAN(countryName: string): boolean {
  if (!countryName) return false;
  if (isUserJoinedOrg(countryName, "Perhimpunan Bangsa-Bangsa Asia Tenggara (ASEAN)") || isUserJoinedOrg(countryName, "ASEAN")) return true;
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
