import { getOrgMembers } from "@/../../json/database_organisasi_internasional";
import { isUserJoinedOrg } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";

export const FAO_BONUS_RESOURCES = new Set([
  // Peternakan
  "ayam_unggas",
  "sapi_perah",
  "sapi_potong",
  "domba_kambing",
  // Agrikultur
  "padi",
  "gandum",
  "jagung",
  "sayur",
  "umbi",
  "kedelai",
  "kelapa_sawit",
  "kopi",
  "teh",
  "kakao",
  "tebu",
  "karet",
  "beras",
  // Perikanan
  "udang",
  "mutiara",
  "ikan",
  // Olahan Pangan
  "air_mineral",
  "gula",
  "roti",
  "pengolahan_daging",
  "mie_instan",
  "minyak_goreng",
  "susu",
]);

/**
 * Memeriksa apakah suatu negara tergabung dalam Organisasi Pangan dan Pertanian (FAO)
 */
export function isMemberOfFAO(countryName: string): boolean {
  if (!countryName) return false;
  if (isUserJoinedOrg(countryName, "Organisasi Pangan dan Pertanian (FAO)")) return true;
  const members = getOrgMembers("Organisasi Pangan dan Pertanian (FAO)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan pengganda produksi FAO (+10% / 1.10 jika anggota FAO dan produk pangan)
 */
export function getFAOProductionMultiplier(countryName: string, resourceKey: string): number {
  if (!isMemberOfFAO(countryName)) return 1.0;
  const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  return FAO_BONUS_RESOURCES.has(normalizedKey) ? 1.10 : 1.0;
}
