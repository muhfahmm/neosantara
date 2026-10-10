import { RESEARCH_CARD_LEVEL_BONUS } from "../../researchCardLevelBonus";

export const STRUKTUR_JET_RESEARCH_ID = "struktur_jet";

/**
 * Menghitung persentase bonus HP / durabilitas armada udara (dalam %)
 * dari penelitian "Struktur Jet Diperkuat" (struktur_jet).
 * Level 1 = +2%, Level 2 = +4%, Level 3 = +7%, Level 4 = +10%, Level 5 = +15%.
 */
export function getHPUdaraBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(STRUKTUR_JET_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = countryDetail.research_levels && typeof countryDetail.research_levels === "object"
    ? (countryDetail.research_levels as Record<string, unknown>)
    : {};

  const storedLevel = Number(researchLevels[STRUKTUR_JET_RESEARCH_ID]) || 1;
  const level = Math.min(RESEARCH_CARD_LEVEL_BONUS.length - 1, Math.max(1, Math.floor(storedLevel)));

  return RESEARCH_CARD_LEVEL_BONUS[level];
}

export function getHPUdaraMultiplier(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const percent = getHPUdaraBonusPercent(countryDetail);
  return 1 + percent / 100;
}
