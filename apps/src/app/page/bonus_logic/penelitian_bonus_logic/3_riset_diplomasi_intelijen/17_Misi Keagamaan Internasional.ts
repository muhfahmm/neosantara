import {
  getResearchCardBonus,
  getResearchCardLevel,
} from "../../researchCardLevelBonus";

export const MISI_KEAGAMAAN_INTERNASIONAL_RESEARCH_ID = "misionaris";
export const BASE_MISSIONARY_SUCCESS_CHANCE_PERCENT = 75;

export function getMisiKeagamaanInternasionalBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(MISI_KEAGAMAAN_INTERNASIONAL_RESEARCH_ID)) return 0;

  return getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, MISI_KEAGAMAAN_INTERNASIONAL_RESEARCH_ID)
  );
}

export function getMissionarySuccessChancePercent(
  countryDetail: Record<string, unknown> | null | undefined,
  baseChancePercent = BASE_MISSIONARY_SUCCESS_CHANCE_PERCENT
): number {
  const safeBaseChance = Number.isFinite(baseChancePercent)
    ? Math.min(100, Math.max(0, baseChancePercent))
    : BASE_MISSIONARY_SUCCESS_CHANCE_PERCENT;

  return Math.min(100, safeBaseChance + getMisiKeagamaanInternasionalBonusPercent(countryDetail));
}
