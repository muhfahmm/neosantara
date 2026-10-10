import {
  getResearchCardBonus,
  getResearchCardLevel,
  normalizeResearchLevels,
} from "../../researchCardLevelBonus";

export const MITIGASI_BENCANA_RESEARCH_ID = "mitigasi_bencana";

/**
 * Menghitung persentase pengurangan dampak/korban bencana alam (dalam %)
 * dari penelitian "Mitigasi Bencana Alam" (mitigasi_bencana).
 * Level 1 = 2%, Level 2 = 4%, Level 3 = 7%, Level 4 = 10%, Level 5 = 15%.
 */
export function getMitigasiBencanaBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(MITIGASI_BENCANA_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = normalizeResearchLevels(countryDetail.research_levels);
  const level = getResearchCardLevel(researchLevels, MITIGASI_BENCANA_RESEARCH_ID);

  return getResearchCardBonus(level);
}

/**
 * Mengaplikasikan pengurangan estimasi korban/kerusakan bencana alam.
 */
export function applyMitigasiBencanaFatalityReduction(
  casualties: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(casualties) || casualties <= 0) return casualties;
  const reductionPercent = getMitigasiBencanaBonusPercent(countryDetail);
  if (reductionPercent <= 0) return casualties;

  return Math.max(0, Math.floor(casualties * (1 - reductionPercent / 100)));
}
