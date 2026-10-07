import { getOrgMembers } from "@/../../json/database_organisasi_internasional";
import { isUserJoinedOrg } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";

/**
 * Memeriksa apakah suatu negara tergabung dalam BRICS
 */
export function isMemberOfBRICS(countryName: string): boolean {
  if (!countryName) return false;
  if (isUserJoinedOrg(countryName, "BRICS (Brasil, Rusia, India, China, Afrika Selatan)") || isUserJoinedOrg(countryName, "BRICS")) return true;
  const members = getOrgMembers("BRICS (Brasil, Rusia, India, China, Afrika Selatan)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan pengganda pendapatan negara BRICS (+10% / 1.10 jika anggota BRICS)
 */
export function getBRICSTaxRevenueMultiplier(countryName: string): number {
  return isMemberOfBRICS(countryName) ? 1.10 : 1.0;
}
