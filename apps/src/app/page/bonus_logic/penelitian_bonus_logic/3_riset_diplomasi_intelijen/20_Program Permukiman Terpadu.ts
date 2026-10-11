import {
  getResearchCardBonus,
  getResearchCardLevel,
  normalizeResearchLevels,
} from "../../researchCardLevelBonus";

export const PROGRAM_PERMUKIMAN_DIPLOMATIK_RESEARCH_ID = "isolasi_total_musuh";

/**
 * Menghitung persentase bonus kapasitas permukiman dari riset Program Permukiman Diplomatik (2% - 15%).
 */
export function getProgramPermukimanDiplomatikBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(PROGRAM_PERMUKIMAN_DIPLOMATIK_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = normalizeResearchLevels(countryDetail.research_levels);
  const level = getResearchCardLevel(researchLevels, PROGRAM_PERMUKIMAN_DIPLOMATIK_RESEARCH_ID);

  return getResearchCardBonus(level);
}

/**
 * Mengaplikasikan bonus kapasitas permukiman ke kapasitas dasar.
 */
export function applyProgramPermukimanDiplomatikBonus(
  baseCapacity: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseCapacity) || baseCapacity <= 0) return baseCapacity;

  const bonusPercent = getProgramPermukimanDiplomatikBonusPercent(countryDetail);
  if (bonusPercent <= 0) return baseCapacity;

  return Math.round(baseCapacity * (1 + bonusPercent / 100));
}
