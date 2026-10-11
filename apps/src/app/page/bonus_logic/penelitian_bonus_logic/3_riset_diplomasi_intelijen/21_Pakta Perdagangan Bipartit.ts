import { getResearchCardBonus, getResearchCardLevel } from "../../researchCardLevelBonus";

export const PERJANJIAN_DAGANG_RESEARCH_ID = "perjanjian_dagang";

export function getTradeAgreementAcceptanceChancePercent(
  relationPercent: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const safeRelationPercent = Number.isFinite(relationPercent)
    ? Math.min(100, Math.max(0, relationPercent))
    : 0;
  if (!countryDetail) return safeRelationPercent;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(PERJANJIAN_DAGANG_RESEARCH_ID)) {
    return safeRelationPercent;
  }

  const bonusPercent = getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, PERJANJIAN_DAGANG_RESEARCH_ID)
  );
  return Math.min(100, safeRelationPercent + bonusPercent);
}
