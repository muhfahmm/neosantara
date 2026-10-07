import { getOrgMembers } from "@/../../json/database_organisasi_internasional";
import { isUserJoinedOrg } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";

/**
 * Memeriksa apakah suatu negara tergabung dalam Liga Arab
 */
export function isMemberOfLigaArab(countryName: string): boolean {
  if (!countryName) return false;
  if (isUserJoinedOrg(countryName, "Liga Arab")) return true;
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
