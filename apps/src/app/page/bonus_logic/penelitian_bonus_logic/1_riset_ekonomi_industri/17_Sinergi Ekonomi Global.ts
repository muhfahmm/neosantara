import {
  getResearchCardBonus,
  getResearchCardLevel,
  normalizeResearchLevels,
} from "../../researchCardLevelBonus";

export const SINERGI_EKONOMI_GLOBAL_RESEARCH_ID = "tatanan_dunia_baru";

/**
 * Persentase bonus produksi semua lini (Kelistrikan, Mineral & Energi, Manufaktur, Peternakan, Agrikultur, Perikanan, Olahan Pangan).
 * Level 1 = +2%, Level 2 = +4%, Level 3 = +7%, Level 4 = +10%, Level 5 = +15%.
 */
export function getSinergiEkonomiGlobalBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(SINERGI_EKONOMI_GLOBAL_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = normalizeResearchLevels(countryDetail.research_levels);
  const level = getResearchCardLevel(researchLevels, SINERGI_EKONOMI_GLOBAL_RESEARCH_ID);

  return getResearchCardBonus(level);
}

/**
 * Mengaplikasikan pengali bonus produksi semua lini.
 */
export function applySinergiEkonomiGlobalMultiplier(
  baseProduction: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseProduction) || baseProduction <= 0) return baseProduction;

  const bonusPercent = getSinergiEkonomiGlobalBonusPercent(countryDetail);
  if (bonusPercent <= 0) return baseProduction;

  return baseProduction * (1 + bonusPercent / 100);
}
