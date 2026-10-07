import { getOrgMembers } from "@/../../json/database_organisasi_internasional";
import { isUserJoinedOrg } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";

/**
 * Memeriksa apakah suatu negara tergabung dalam Organisasi Telekomunikasi Internasional (ITU)
 */
export function isMemberOfITU(countryName: string): boolean {
  if (!countryName) return false;
  if (isUserJoinedOrg(countryName, "Organisasi Telekomunikasi Internasional (ITU)")) return true;
  const members = getOrgMembers("Organisasi Telekomunikasi Internasional (ITU)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan modifier kecepatan riset ITU (dalam persentase)
 * Jika negara adalah anggota ITU: -5% durasi riset (kecepatan riset +5%)
 * Jika bukan anggota ITU: 0%
 */
export function getITUResearchModifier(countryName: string): number {
  return isMemberOfITU(countryName) ? -5 : 0;
}
