import {
  getResearchCardBonus,
  getResearchCardLevel,
} from "../../researchCardLevelBonus";

export const PENYEBARAN_IDEOLOGI_RESEARCH_ID = "penyebaran_ideologi";
export const BASE_IDEOLOGY_SUCCESS_CHANCE_PERCENT = 75;

export function getPenyebaranIdeologiBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(PENYEBARAN_IDEOLOGI_RESEARCH_ID)) return 0;

  return getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, PENYEBARAN_IDEOLOGI_RESEARCH_ID)
  );
}

export function getIdeologySuccessChancePercent(
  countryDetail: Record<string, unknown> | null | undefined,
  baseChancePercent = BASE_IDEOLOGY_SUCCESS_CHANCE_PERCENT
): number {
  const safeBaseChance = Number.isFinite(baseChancePercent)
    ? Math.min(100, Math.max(0, baseChancePercent))
    : BASE_IDEOLOGY_SUCCESS_CHANCE_PERCENT;

  return Math.min(100, safeBaseChance + getPenyebaranIdeologiBonusPercent(countryDetail));
}
