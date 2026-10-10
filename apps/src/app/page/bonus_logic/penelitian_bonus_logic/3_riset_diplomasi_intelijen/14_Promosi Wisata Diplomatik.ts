import {
  getResearchCardBonus,
  getResearchCardLevel,
} from "../../researchCardLevelBonus";

export const PROMOSI_WISATA_DIPLOMATIK_RESEARCH_ID = "bonus_tempat_wisata";

export function getPromosiWisataDiplomatikBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(PROMOSI_WISATA_DIPLOMATIK_RESEARCH_ID)) return 0;

  return getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, PROMOSI_WISATA_DIPLOMATIK_RESEARCH_ID)
  );
}

export function applyPromosiWisataDiplomatikBonus(
  tourismIncome: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(tourismIncome)) return tourismIncome;

  const bonusPercent = getPromosiWisataDiplomatikBonusPercent(countryDetail);
  return tourismIncome * (1 + bonusPercent / 100);
}
