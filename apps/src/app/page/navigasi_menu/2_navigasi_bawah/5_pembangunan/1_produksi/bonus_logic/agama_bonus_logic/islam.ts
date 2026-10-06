export const ISLAM_PRODUCTION_BONUS = 0.1;

const ISLAM_BONUS_RESOURCES = new Set([
  "uranium",
  "batu_bara",
  "minyak_bumi",
  "gas_alam",
  "garam",
  "litium",
  "logam_tanah_jarang",
  "bijih_besi",
  "ayam_unggas",
  "sapi_perah",
  "sapi_potong",
  "domba_kambing",
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
  "udang",
  "mutiara",
  "ikan",
  "air_mineral",
  "gula",
  "roti",
  "pengolahan_daging",
  "mie_instan",
  "minyak_goreng",
  "susu",
  "beras",
]);

export function getIslamProductionMultiplier(resourceKey: string): number {
  const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  return ISLAM_BONUS_RESOURCES.has(normalizedKey)
    ? 1 + ISLAM_PRODUCTION_BONUS
    : 1;
}
