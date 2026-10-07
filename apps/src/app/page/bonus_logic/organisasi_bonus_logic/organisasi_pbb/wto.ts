import { getOrgMembers } from "@/../../json/database_organisasi_internasional";
import { isUserJoinedOrg } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";

/**
 * Memeriksa apakah suatu negara tergabung dalam Organisasi Perdagangan Dunia (WTO)
 */
export function isMemberOfWTO(countryName: string): boolean {
  if (!countryName) return false;
  if (isUserJoinedOrg(countryName, "Organisasi Perdagangan Dunia (WTO)")) return true;
  const members = getOrgMembers("Organisasi Perdagangan Dunia (WTO)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan modifier harga jual produk (+15% jika anggota WTO, 0 jika bukan)
 */
export function getWTOSellPriceMultiplier(countryName: string): number {
  return isMemberOfWTO(countryName) ? 1.15 : 1.0;
}

/**
 * Mengembalikan modifier harga beli produk (-10% jika anggota WTO, 0 jika bukan)
 */
export function getWTOBuyPriceMultiplier(countryName: string): number {
  return isMemberOfWTO(countryName) ? 0.90 : 1.0;
}
