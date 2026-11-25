import { getResearchCardLevel } from "../../researchCardLevelBonus";

export const KUDETA_STRATEGIS_RESEARCH_ID = "kudeta_strategis";

const COUP_SUCCESS_LEVEL_BONUSES = [0, 2, 4, 6, 8, 10] as const;

export function getCoupSuccessResearchLevelBonusPercent(level: number): number {
  if (!Number.isFinite(level) || level < 1) return 0;

  const normalizedLevel = Math.min(
    COUP_SUCCESS_LEVEL_BONUSES.length - 1,
    Math.floor(level)
  );
  return COUP_SUCCESS_LEVEL_BONUSES[normalizedLevel];
}

export function getCoupSuccessResearchBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const completedResearch = Array.isArray(countryDetail?.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(KUDETA_STRATEGIS_RESEARCH_ID)) return 0;

  return getCoupSuccessResearchLevelBonusPercent(
    getResearchCardLevel(countryDetail?.research_levels, KUDETA_STRATEGIS_RESEARCH_ID)
  );
}
