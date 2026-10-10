import {
  getResearchCardBonus,
  getResearchCardLevel,
  normalizeResearchLevels,
} from "../../researchCardLevelBonus";

export const DIPLOMASI_ACARA_NASIONAL_RESEARCH_ID = "efek_acara";

/**
 * Menghitung persentase peningkatan efek kepuasan Acara Nasional (dalam %)
 * dari penelitian "Diplomasi Acara Nasional" (efek_acara).
 * Level 1 = 2%, Level 2 = 4%, Level 3 = 7%, Level 4 = 10%, Level 5 = 15%.
 */
export function getDiplomasiAcaraBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(DIPLOMASI_ACARA_NASIONAL_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = normalizeResearchLevels(countryDetail.research_levels);
  const level = getResearchCardLevel(researchLevels, DIPLOMASI_ACARA_NASIONAL_RESEARCH_ID);

  return getResearchCardBonus(level);
}

/**
 * Mengaplikasikan peningkatan bonus persentase kepuasan acara nasional.
 * Contoh: Base 5% dengan bonus riset 10% -> 5 * 1.10 = 5.5% (dibulatkan menjadi 6%).
 */
export function applyDiplomasiAcaraSatisfactionBonus(
  baseSatisfactionPercent: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseSatisfactionPercent) || baseSatisfactionPercent <= 0) return baseSatisfactionPercent;
  const bonusPercent = getDiplomasiAcaraBonusPercent(countryDetail);
  if (bonusPercent <= 0) return Math.round(baseSatisfactionPercent);

  const boosted = baseSatisfactionPercent * (1 + bonusPercent / 100);
  return Math.round(boosted);
}
