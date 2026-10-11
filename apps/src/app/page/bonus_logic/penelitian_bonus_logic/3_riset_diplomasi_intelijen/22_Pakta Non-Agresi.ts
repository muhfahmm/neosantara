import { getResearchCardBonus, getResearchCardLevel } from "../../researchCardLevelBonus";
import { getKementerianLuarNegeriTreatyChanceBonusPercent } from "../../kementerian_bonus_logic/8_Kementerian_Luar_Negeri";

export const PAKTA_NON_AGRESI_RESEARCH_ID = "pakta_non_agresi";

export function getNonAggressionPactAcceptanceChancePercent(
  relationPercent: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const safeRelationPercent = Number.isFinite(relationPercent)
    ? Math.min(100, Math.max(0, relationPercent))
    : 0;
  const completedResearch = Array.isArray(countryDetail?.completed_research)
    ? countryDetail.completed_research
    : [];
  const researchBonus = completedResearch.includes(PAKTA_NON_AGRESI_RESEARCH_ID)
    ? getResearchCardBonus(
      getResearchCardLevel(countryDetail?.research_levels, PAKTA_NON_AGRESI_RESEARCH_ID)
    )
    : 0;
  const ministryBonus = getKementerianLuarNegeriTreatyChanceBonusPercent(countryDetail);
  return Math.min(100, safeRelationPercent + researchBonus + ministryBonus);
}
