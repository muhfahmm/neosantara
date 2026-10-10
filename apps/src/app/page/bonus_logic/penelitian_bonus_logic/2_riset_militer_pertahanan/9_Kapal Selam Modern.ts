import { RESEARCH_CARD_LEVEL_BONUS } from "../../researchCardLevelBonus";

export const KAPAL_SELAM_DIESEL_RESEARCH_ID = "kapal_selam_diesel";
export const PANGKALAN_UDARA_BUILDING_KEY = "pangkalan_udara";

/**
 * Menghitung persentase bonus kapasitas (dalam %)
 * untuk Pangkalan Udara dari penelitian "Kapal Selam Modern" (kapal_selam_diesel).
 * Level 1 = +2%, Level 2 = +4%, Level 3 = +7%, Level 4 = +10%, Level 5 = +15%.
 */
export function getKapasitasPangkalanUdaraBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  buildingKey?: string
): number {
  if (!countryDetail) return 0;

  if (buildingKey && buildingKey !== PANGKALAN_UDARA_BUILDING_KEY) {
    return 0;
  }

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(KAPAL_SELAM_DIESEL_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = countryDetail.research_levels && typeof countryDetail.research_levels === "object"
    ? (countryDetail.research_levels as Record<string, unknown>)
    : {};

  const storedLevel = Number(researchLevels[KAPAL_SELAM_DIESEL_RESEARCH_ID]) || 1;
  const level = Math.min(RESEARCH_CARD_LEVEL_BONUS.length - 1, Math.max(1, Math.floor(storedLevel)));

  return RESEARCH_CARD_LEVEL_BONUS[level];
}
