import { getOrgMembers } from "@/../../json/database_organisasi_internasional";
import { isUserJoinedOrg } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";

/**
 * Memeriksa apakah suatu negara tergabung dalam Uni Afrika (AU)
 */
export function isMemberOfUniAfrika(countryName: string): boolean {
  if (!countryName) return false;
  if (isUserJoinedOrg(countryName, "Uni Afrika (AU)") || isUserJoinedOrg(countryName, "AU")) return true;
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
