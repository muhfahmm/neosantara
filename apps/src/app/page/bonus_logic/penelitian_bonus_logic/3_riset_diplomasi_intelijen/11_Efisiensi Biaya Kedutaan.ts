import {
  getResearchCardBonus,
  getResearchCardLevel,
} from "../../researchCardLevelBonus";

export const EFISIENSI_BIAYA_KEDUTAAN_RESEARCH_ID = "biaya_kedutaan";

export function getEfisiensiBiayaKedutaanBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(EFISIENSI_BIAYA_KEDUTAAN_RESEARCH_ID)) return 0;

  return getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, EFISIENSI_BIAYA_KEDUTAAN_RESEARCH_ID)
  );
}

export function getEffectiveEmbassyCost(
  baseCost: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseCost) || baseCost <= 0) return Math.max(0, baseCost || 0);

  const bonusPercent = getEfisiensiBiayaKedutaanBonusPercent(countryDetail);
  return Math.max(0, Number((baseCost * (1 - bonusPercent / 100)).toFixed(2)));
}
