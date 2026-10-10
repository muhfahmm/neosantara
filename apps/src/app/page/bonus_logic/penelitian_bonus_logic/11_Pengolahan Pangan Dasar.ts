import { PRODUCTION_BAN_CATEGORIES } from "../../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";
import { RESEARCH_CARD_LEVEL_BONUS } from "../researchCardLevelBonus";

export const PENGOLAHAN_PANGAN_RESEARCH_ID = "pengolahan_pangan";
export const OLAHAN_PANGAN_TARGET_SECTOR = "olahan pangan";

const OLAHAN_PANGAN_CATEGORY = PRODUCTION_BAN_CATEGORIES.find((cat) => cat.id === OLAHAN_PANGAN_TARGET_SECTOR);
export const OLAHAN_PANGAN_RESOURCES = new Set<string>(
  OLAHAN_PANGAN_CATEGORY
    ? OLAHAN_PANGAN_CATEGORY.products
    : ["air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu", "beras"]
);

/**
 * Menghitung persentase bonus produksi dari penelitian "Pengolahan Pangan Dasar" (pengolahan_pangan).
 * Level 1 = +2%, Level 2 = +4%, Level 3 = +7%, Level 4 = +10%, Level 5 = +15%.
 */
export function getPengolahanPanganDasarBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  if (!countryDetail) return 0;

  const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  if (!OLAHAN_PANGAN_RESOURCES.has(normalizedKey)) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(PENGOLAHAN_PANGAN_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = countryDetail.research_levels && typeof countryDetail.research_levels === "object"
    ? (countryDetail.research_levels as Record<string, unknown>)
    : {};

  const storedLevel = Number(researchLevels[PENGOLAHAN_PANGAN_RESEARCH_ID]) || 1;
  const level = Math.min(RESEARCH_CARD_LEVEL_BONUS.length - 1, Math.max(1, Math.floor(storedLevel)));

  return RESEARCH_CARD_LEVEL_BONUS[level];
}

/**
 * Menghitung pengali (multiplier) produksi dari penelitian Pengolahan Pangan Dasar.
 */
export function getPengolahanPanganDasarProductionMultiplier(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  const bonusPercent = getPengolahanPanganDasarBonusPercent(countryDetail, resourceKey);
  return 1 + bonusPercent / 100;
}
