import {
  getResearchCardBonus,
  getResearchCardLevel,
} from "../../researchCardLevelBonus";

export const DOKTRIN_PERTAHANAN_DIRI_RESEARCH_ID = "pertahanan_diri";

export function getDoktrinPertahananDiriBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(DOKTRIN_PERTAHANAN_DIRI_RESEARCH_ID)) return 0;

  return getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, DOKTRIN_PERTAHANAN_DIRI_RESEARCH_ID)
  );
}

export function applyDoktrinPertahananDiriBonus(
  baseAttackChancePercent: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseAttackChancePercent)) return 0;

  return Math.max(
    0,
    Math.min(100, baseAttackChancePercent - getDoktrinPertahananDiriBonusPercent(countryDetail))
  );
}
