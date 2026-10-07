import { getOrgMembers } from "@/../../json/database_organisasi_internasional";
import { isUserJoinedOrg } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";

/**
 * Memeriksa apakah suatu negara tergabung dalam Organisasi Kesehatan Dunia (WHO)
 */
export function isMemberOfWHO(countryName: string): boolean {
  if (!countryName) return false;
  if (isUserJoinedOrg(countryName, "Organisasi Kesehatan Dunia (WHO)")) return true;
  const members = getOrgMembers("Organisasi Kesehatan Dunia (WHO)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan modifier risiko epidemi & pandemi (dalam persentase, misal -5 untuk penurunan 5%)
 * Jika negara adalah anggota WHO: -5%
 * Jika bukan anggota WHO: 0%
 */
export function getWHOPandemicRiskModifier(countryName: string): number {
  return isMemberOfWHO(countryName) ? -5 : 0;
}
