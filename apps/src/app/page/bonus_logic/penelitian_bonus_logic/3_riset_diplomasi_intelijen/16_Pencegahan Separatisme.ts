import {
  getResearchCardBonus,
  getResearchCardLevel,
} from "../../researchCardLevelBonus";

export const PENCEGAHAN_SEPARATISME_RESEARCH_ID = "kontra_separatisme";

export function getPencegahanSeparatismeBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(PENCEGAHAN_SEPARATISME_RESEARCH_ID)) return 0;

  return getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, PENCEGAHAN_SEPARATISME_RESEARCH_ID)
  );
}

export function applyPencegahanSeparatismeBonus(
  riskPercent: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(riskPercent)) return 0;

  return Math.max(0, riskPercent - getPencegahanSeparatismeBonusPercent(countryDetail));
}
