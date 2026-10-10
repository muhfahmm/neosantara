import { PRODUCTION_BAN_CATEGORIES } from "../../../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";
import { RESEARCH_CARD_LEVEL_BONUS } from "../../researchCardLevelBonus";

export const PETERNAKAN_GENETIKA_RESEARCH_ID = "peternakan_genetika";
export const PETERNAKAN_GENETIKA_TARGET_SECTOR = "peternakan";

const PETERNAKAN_CATEGORY = PRODUCTION_BAN_CATEGORIES.find((cat) => cat.id === PETERNAKAN_GENETIKA_TARGET_SECTOR);
export const PETERNAKAN_GENETIKA_RESOURCES = new Set<string>(
  PETERNAKAN_CATEGORY ? PETERNAKAN_CATEGORY.products : ["ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing"]
);

/**
 * Menghitung persentase diskon/pengurangan waktu pembangunan (dalam %)
 * untuk sektor Peternakan dari penelitian "Genetika & Pakan Ternak" (peternakan_genetika).
 * Level 1 = 2%, Level 2 = 4%, Level 3 = 7%, Level 4 = 10%, Level 5 = 15%.
 */
export function getGenetikaPakanTernakBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey?: string
): number {
  if (!countryDetail) return 0;

  if (resourceKey) {
    const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
    if (!PETERNAKAN_GENETIKA_RESOURCES.has(normalizedKey)) return 0;
  }

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(PETERNAKAN_GENETIKA_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = countryDetail.research_levels && typeof countryDetail.research_levels === "object"
    ? (countryDetail.research_levels as Record<string, unknown>)
    : {};

  const storedLevel = Number(researchLevels[PETERNAKAN_GENETIKA_RESEARCH_ID]) || 1;
  const level = Math.min(RESEARCH_CARD_LEVEL_BONUS.length - 1, Math.max(1, Math.floor(storedLevel)));

  return RESEARCH_CARD_LEVEL_BONUS[level];
}
