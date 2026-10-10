import { RESEARCH_CARD_LEVEL_BONUS } from "../../researchCardLevelBonus";

export const TANK_GENERASI5_RESEARCH_ID = "tank_generasi5";

/**
 * Menghitung persentase bonus kekuatan pasukan darat (dalam %)
 * dari penelitian "Tank Tempur Generasi 5" (tank_generasi5).
 * Level 1 = +2%, Level 2 = +4%, Level 3 = +7%, Level 4 = +10%, Level 5 = +15%.
 */
export function getKekuatanDaratBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(TANK_GENERASI5_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = countryDetail.research_levels && typeof countryDetail.research_levels === "object"
    ? (countryDetail.research_levels as Record<string, unknown>)
    : {};

  const storedLevel = Number(researchLevels[TANK_GENERASI5_RESEARCH_ID]) || 1;
  const level = Math.min(RESEARCH_CARD_LEVEL_BONUS.length - 1, Math.max(1, Math.floor(storedLevel)));

  return RESEARCH_CARD_LEVEL_BONUS[level];
}

export function getKekuatanDaratMultiplier(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const percent = getKekuatanDaratBonusPercent(countryDetail);
  return 1 + percent / 100;
}
