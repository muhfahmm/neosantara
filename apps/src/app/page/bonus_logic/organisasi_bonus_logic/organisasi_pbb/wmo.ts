import { getOrgMembers } from "@/../../json/database_organisasi_internasional";
import { isUserJoinedOrg } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";
import { applyKerjaSamaRegionalToFlatBonus } from "../../penelitian_bonus_logic/3_riset_diplomasi_intelijen/4_Kerja Sama Organisasi Regional";

/**
 * Memeriksa apakah suatu negara tergabung dalam Organisasi Meteorologi Dunia (WMO)
 */
export function isMemberOfWMO(countryName: string): boolean {
  if (!countryName) return false;
  if (isUserJoinedOrg(countryName, "Organisasi Meteorologi Dunia (WMO)")) return true;
  const members = getOrgMembers("Organisasi Meteorologi Dunia (WMO)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan modifier risiko bencana alam WMO (dalam persentase, misal -5 untuk penurunan 5%)
 * Jika negara adalah anggota WMO: -5%
 * Jika bukan anggota WMO: 0%
 */
export function getWMODisasterRiskModifier(
  countryName: string,
  countryDetail?: Record<string, unknown> | null
): number {
  return isMemberOfWMO(countryName)
    ? applyKerjaSamaRegionalToFlatBonus(-5, countryDetail)
    : 0;
}
