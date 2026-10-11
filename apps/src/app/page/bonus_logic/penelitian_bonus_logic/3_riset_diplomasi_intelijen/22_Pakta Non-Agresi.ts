import { getResearchCardBonus, getResearchCardLevel } from "../../researchCardLevelBonus";

export const PAKTA_NON_AGRESI_RESEARCH_ID = "pakta_non_agresi";

export function getNonAggressionPactAcceptanceChancePercent(
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
  if (!completedResearch.includes(PAKTA_NON_AGRESI_RESEARCH_ID)) {
    return safeRelationPercent;
  }

  const bonusPercent = getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, PAKTA_NON_AGRESI_RESEARCH_ID)
  );
  return Math.min(100, safeRelationPercent + bonusPercent);
}
