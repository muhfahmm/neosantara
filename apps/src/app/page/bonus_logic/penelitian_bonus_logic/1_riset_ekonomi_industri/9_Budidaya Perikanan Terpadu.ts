import { PRODUCTION_BAN_CATEGORIES } from "../../../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";
import { getResearchCardBonus, getResearchCardLevel } from "../../researchCardLevelBonus";

export const PERIKANAN_MODERN_RESEARCH_ID = "perikanan_modern";
export const PERIKANAN_TARGET_SECTOR = "perikanan";

const PERIKANAN_CATEGORY = PRODUCTION_BAN_CATEGORIES.find((cat) => cat.id === PERIKANAN_TARGET_SECTOR);
export const PERIKANAN_RESOURCES = new Set<string>(
  PERIKANAN_CATEGORY ? PERIKANAN_CATEGORY.products : ["udang", "mutiara", "ikan"]
);

/**
 * Menghitung persentase bonus produksi dari penelitian "Budidaya Perikanan Terpadu" (perikanan_modern).
 * Level 1 = +2%, Level 2 = +4%, Level 3 = +7%, Level 4 = +10%, Level 5 = +15%.
 */
export function getBudidayaPerikananTerpaduBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  if (!countryDetail) return 0;

  const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  if (!PERIKANAN_RESOURCES.has(normalizedKey)) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(PERIKANAN_MODERN_RESEARCH_ID)) {
    return 0;
  }

  return getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, PERIKANAN_MODERN_RESEARCH_ID)
  );
}

/**
 * Menghitung pengali (multiplier) produksi dari penelitian Budidaya Perikanan Terpadu.
 */
export function getBudidayaPerikananTerpaduProductionMultiplier(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  const bonusPercent = getBudidayaPerikananTerpaduBonusPercent(countryDetail, resourceKey);
  return 1 + bonusPercent / 100;
}
