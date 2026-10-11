import {
  getResearchCardBonus,
  getResearchCardLevel,
} from "../../researchCardLevelBonus";

export const SANKSI_EKONOMI_RESEARCH_ID = "sanksi_ekonomi";

/**
 * Persentase tambahan efek sanksi ekonomi musuh (+2% per level hingga +15%).
 */
export function getPerangkatSanksiEkonomiBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(SANKSI_EKONOMI_RESEARCH_ID)) return 0;

  return getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, SANKSI_EKONOMI_RESEARCH_ID)
  );
}

/**
 * Menghitung total persentase pengurangan sanksi ekonomi (Base 5% + Bonus Riset 0..15%).
 */
export function calculateSanctionReductionPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  basePercent: number = 5
): number {
  const bonusPercent = getPerangkatSanksiEkonomiBonusPercent(countryDetail);
  return basePercent + bonusPercent;
}
