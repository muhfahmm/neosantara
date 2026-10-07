import { getOrgMembers } from "@/../../json/database_organisasi_internasional";
import { isUserJoinedOrg } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";

/**
 * Memeriksa apakah suatu negara tergabung dalam G20 (Kelompok Duapuluh)
 */
export function isMemberOfG20(countryName: string): boolean {
  if (!countryName) return false;
  if (isUserJoinedOrg(countryName, "Kelompok Duapuluh (G20)") || isUserJoinedOrg(countryName, "G20")) return true;
  const members = getOrgMembers("Kelompok Duapuluh (G20)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan pengganda pendapatan negara G20 (+20% / 1.20 jika anggota G20)
 */
export function getG20TaxRevenueMultiplier(countryName: string): number {
  return isMemberOfG20(countryName) ? 1.20 : 1.0;
}
