import { getResearchCardBonus, getResearchCardLevel } from "../../researchCardLevelBonus";

export const KONTRAK_PENELITIAN_RESEARCH_ID = "bonus_organisasi_pbb";

/**
 * Menghitung persentase penerimaan/peluang tawaran Kontrak Penelitian
 * berdasarkan level riset (Level 1 = +2%, Level 2 = +4%, Level 3 = +7%, Level 4 = +10%, Level 5 = +15%).
 */
export function getResearchContractAcceptanceChancePercent(
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
  if (!completedResearch.includes(KONTRAK_PENELITIAN_RESEARCH_ID)) {
    return safeRelationPercent;
  }

  const bonusPercent = getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, KONTRAK_PENELITIAN_RESEARCH_ID)
  );
  return Math.min(100, safeRelationPercent + bonusPercent);
}
