import {
  getResearchCardBonus,
  getResearchCardLevel,
} from "../../researchCardLevelBonus";

export const ALOKASI_SUBSIDI_TERPADU_RESEARCH_ID = "intelijen_satelit_quantum";

export function getAlokasiSubsidiTerpaduBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(ALOKASI_SUBSIDI_TERPADU_RESEARCH_ID)) return 0;

  return getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, ALOKASI_SUBSIDI_TERPADU_RESEARCH_ID)
  );
}

export function applyAlokasiSubsidiTerpaduBonus(
  subsidyCost: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(subsidyCost)) return subsidyCost;

  const discountPercent = getAlokasiSubsidiTerpaduBonusPercent(countryDetail);
  return Math.max(0, subsidyCost * (1 - discountPercent / 100));
}
