import { RESEARCH_CARD_LEVEL_BONUS } from "../../researchCardLevelBonus";

export const KONTROL_PANDEMI_RESEARCH_ID = "pandemi_kontrol";

export function getKontrolPandemiBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(KONTROL_PANDEMI_RESEARCH_ID)) return 0;

  const researchLevels = countryDetail.research_levels &&
    typeof countryDetail.research_levels === "object"
    ? countryDetail.research_levels as Record<string, unknown>
    : {};
  const storedLevel = Number(researchLevels[KONTROL_PANDEMI_RESEARCH_ID]) || 1;
  const level = Math.min(
    RESEARCH_CARD_LEVEL_BONUS.length - 1,
    Math.max(1, Math.floor(storedLevel))
  );

  return RESEARCH_CARD_LEVEL_BONUS[level];
}

export function applyKontrolPandemiFatalityReduction(
  deaths: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const reductionPercent = getKontrolPandemiBonusPercent(countryDetail);
  if (reductionPercent <= 0 || !Number.isFinite(deaths)) return deaths;

  return Math.max(0, Math.floor(deaths * (1 - reductionPercent / 100)));
}
