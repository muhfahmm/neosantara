import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

export const OKI_FOOD_RESOURCES = new Set([
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
  "daging_olahan",
  "susu_olahan",
  "makanan_kemasan",
  "minuman_kemasan",
  "tepung",
  "gula_pasir",
  "minyak_goreng",
]);

/**
 * Memeriksa apakah suatu negara tergabung dalam Organisasi Kerja Sama Islam (OKI)
 */
export function isMemberOfOKI(countryName: string): boolean {
  if (!countryName) return false;
  const members = getOrgMembers("Organisasi Kerja Sama Islam (OKI)");
  const normName = countryName.toLowerCase().trim();
  return members.some((m) => m.country?.toLowerCase().trim() === normName);
}

/**
 * Mengembalikan pengganda produksi pangan OKI (+10% / 1.10 jika anggota OKI dan komoditas pangan)
 */
export function getOKIFoodProductionMultiplier(countryName: string, resourceKey: string): number {
  if (!isMemberOfOKI(countryName)) return 1.0;
  const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  return OKI_FOOD_RESOURCES.has(normalizedKey) ? 1.10 : 1.0;
}
