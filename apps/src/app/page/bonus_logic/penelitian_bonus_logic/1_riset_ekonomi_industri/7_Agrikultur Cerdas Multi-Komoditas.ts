import { PRODUCTION_BAN_CATEGORIES } from "../../../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";
import { RESEARCH_CARD_LEVEL_BONUS } from "../../researchCardLevelBonus";

export const PERKEBUNAN_KOMODITAS_RESEARCH_ID = "perkebunan_komoditas";
export const AGRIKULTUR_TARGET_SECTOR = "agrikultur";

const AGRIKULTUR_CATEGORY = PRODUCTION_BAN_CATEGORIES.find((cat) => cat.id === AGRIKULTUR_TARGET_SECTOR);
export const AGRIKULTUR_RESOURCES = new Set<string>(
  AGRIKULTUR_CATEGORY
    ? AGRIKULTUR_CATEGORY.products
    : ["padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet"]
);

/**
 * Menghitung persentase bonus produksi dari penelitian "Agrikultur Cerdas Multi-Komoditas" (perkebunan_komoditas).
 * Level 1 = +2%, Level 2 = +4%, Level 3 = +7%, Level 4 = +10%, Level 5 = +15%.
 */
export function getAgrikulturCerdasBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  if (!countryDetail) return 0;

  const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  if (!AGRIKULTUR_RESOURCES.has(normalizedKey)) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(PERKEBUNAN_KOMODITAS_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = countryDetail.research_levels && typeof countryDetail.research_levels === "object"
    ? (countryDetail.research_levels as Record<string, unknown>)
    : {};

  const storedLevel = Number(researchLevels[PERKEBUNAN_KOMODITAS_RESEARCH_ID]) || 1;
  const level = Math.min(RESEARCH_CARD_LEVEL_BONUS.length - 1, Math.max(1, Math.floor(storedLevel)));

  return RESEARCH_CARD_LEVEL_BONUS[level];
}

/**
 * Menghitung pengali (multiplier) produksi dari penelitian Agrikultur Cerdas Multi-Komoditas.
 */
export function getAgrikulturCerdasProductionMultiplier(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  const bonusPercent = getAgrikulturCerdasBonusPercent(countryDetail, resourceKey);
  return 1 + bonusPercent / 100;
}
