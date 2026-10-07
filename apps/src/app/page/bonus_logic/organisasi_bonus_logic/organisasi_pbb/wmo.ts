import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

/**
 * Memeriksa apakah suatu negara tergabung dalam Organisasi Meteorologi Dunia (WMO)
 */
export function isMemberOfWMO(countryName: string): boolean {
  if (!countryName) return false;
  const members = getOrgMembers("Organisasi Meteorologi Dunia (WMO)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan modifier risiko bencana alam WMO (dalam persentase, misal -5 untuk penurunan 5%)
 * Jika negara adalah anggota WMO: -5%
 * Jika bukan anggota WMO: 0%
 */
export function getWMODisasterRiskModifier(countryName: string): number {
  return isMemberOfWMO(countryName) ? -5 : 0;
}
