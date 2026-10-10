import { getOrgMembers } from "@/../../json/database_organisasi_internasional";
import { isUserJoinedOrg } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";
import { applyKerjaSamaRegionalToFlatBonus } from "../../penelitian_bonus_logic/3_riset_diplomasi_intelijen/4_Kerja Sama Organisasi Regional";

/**
 * Memeriksa apakah suatu negara tergabung dalam Interpol
 */
export function isMemberOfInterpol(countryName: string): boolean {
  if (!countryName) return false;
  if (isUserJoinedOrg(countryName, "Interpol")) return true;
  const members = getOrgMembers("Interpol");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan modifier risiko kejahatan (dalam persentase, misal -5 untuk penurunan 5%)
 * Jika negara adalah anggota Interpol: -5%
 * Jika bukan anggota Interpol: 0%
 */
export function getInterpolCrimeRiskModifier(
  countryName: string,
  countryDetail?: Record<string, unknown> | null
): number {
  return isMemberOfInterpol(countryName)
    ? applyKerjaSamaRegionalToFlatBonus(-5, countryDetail)
    : 0;
}
