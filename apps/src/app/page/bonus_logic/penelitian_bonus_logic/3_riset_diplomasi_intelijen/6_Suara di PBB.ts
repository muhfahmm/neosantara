import {
  getResearchCardBonus,
  getResearchCardLevel,
  normalizeResearchLevels,
} from "../../researchCardLevelBonus";

export const SUARA_PBB_RESEARCH_ID = "suara_pbb";

/**
 * Menghitung tambahan jumlah Suara di PBB dari penelitian "Suara di PBB" (suara_pbb).
 * Level 1 = +2, Level 2 = +4, Level 3 = +7, Level 4 = +10, Level 5 = +15 suara.
 */
export function getSuaraPBBResearchBonus(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(SUARA_PBB_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = normalizeResearchLevels(countryDetail.research_levels);
  const level = getResearchCardLevel(researchLevels, SUARA_PBB_RESEARCH_ID);

  return getResearchCardBonus(level);
}

/**
 * Mengaplikasikan bonus tambahan Suara PBB ke jumlah suara dasar suatu negara.
 */
export function applySuaraPBBResearchBonus(
  baseVotes: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseVotes)) return baseVotes;
  const bonusVotes = getSuaraPBBResearchBonus(countryDetail);
  return baseVotes + bonusVotes;
}
