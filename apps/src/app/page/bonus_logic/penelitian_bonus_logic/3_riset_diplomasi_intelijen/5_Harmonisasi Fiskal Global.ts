import {
  getResearchCardBonus,
  getResearchCardLevel,
  normalizeResearchLevels,
} from "../../researchCardLevelBonus";

export const HARMONISASI_FISKAL_GLOBAL_RESEARCH_ID = "hegemoni_diplomasi";

/**
 * Menghitung persentase peningkatan penerimaan pajak seluruh lini (dalam %)
 * dari penelitian "Harmonisasi Fiskal Global" (hegemoni_diplomasi / harmonisasi_fiskal_global).
 * Level 1 = 2%, Level 2 = 4%, Level 3 = 7%, Level 4 = 10%, Level 5 = 15%.
 */
export function getHarmonisasiFiskalGlobalBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  const isUnlocked =
    completedResearch.includes(HARMONISASI_FISKAL_GLOBAL_RESEARCH_ID) ||
    completedResearch.includes("harmonisasi_fiskal_global");

  if (!isUnlocked) {
    return 0;
  }

  const researchLevels = normalizeResearchLevels(countryDetail.research_levels);
  const level = Math.max(
    getResearchCardLevel(researchLevels, HARMONISASI_FISKAL_GLOBAL_RESEARCH_ID),
    getResearchCardLevel(researchLevels, "harmonisasi_fiskal_global")
  );

  return getResearchCardBonus(level);
}

/**
 * Mengaplikasikan pengali persentase bonus penerimaan pajak dari "Harmonisasi Fiskal Global".
 */
export function applyHarmonisasiFiskalGlobalTaxRevenueBonus(
  revenue: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(revenue) || revenue <= 0) return revenue;
  const bonusPercent = getHarmonisasiFiskalGlobalBonusPercent(countryDetail);
  if (bonusPercent <= 0) return revenue;
  return revenue * (1 + bonusPercent / 100);
}
