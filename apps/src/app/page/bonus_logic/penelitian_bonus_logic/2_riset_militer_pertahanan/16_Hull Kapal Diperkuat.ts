import { RESEARCH_CARD_LEVEL_BONUS } from "../../researchCardLevelBonus";

export const HULL_KAPAL_DIPERKUAT_RESEARCH_ID = "hull_kapal_diperkuat";

/**
 * Menghitung persentase bonus HP / durabilitas armada laut (dalam %)
 * dari penelitian "Hull Kapal Diperkuat" (hull_kapal_diperkuat).
 * Level 1 = +2%, Level 2 = +4%, Level 3 = +7%, Level 4 = +10%, Level 5 = +15%.
 */
export function getHPLautBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(HULL_KAPAL_DIPERKUAT_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = countryDetail.research_levels && typeof countryDetail.research_levels === "object"
    ? (countryDetail.research_levels as Record<string, unknown>)
    : {};

  const storedLevel = Number(researchLevels[HULL_KAPAL_DIPERKUAT_RESEARCH_ID]) || 1;
  const level = Math.min(RESEARCH_CARD_LEVEL_BONUS.length - 1, Math.max(1, Math.floor(storedLevel)));

  return RESEARCH_CARD_LEVEL_BONUS[level];
}

export function getHPLautMultiplier(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const percent = getHPLautBonusPercent(countryDetail);
  return 1 + percent / 100;
}
