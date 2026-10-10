import { RESEARCH_CARD_LEVEL_BONUS } from "../../researchCardLevelBonus";

export const KERJA_SAMA_ORGANISASI_REGIONAL_RESEARCH_ID = "bonus_organisasi_regional";

export function getKerjaSamaOrganisasiRegionalBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(KERJA_SAMA_ORGANISASI_REGIONAL_RESEARCH_ID)) return 0;

  const researchLevels = countryDetail.research_levels &&
    typeof countryDetail.research_levels === "object"
    ? countryDetail.research_levels as Record<string, unknown>
    : {};
  const storedLevel = Number(researchLevels[KERJA_SAMA_ORGANISASI_REGIONAL_RESEARCH_ID]) || 1;
  const level = Math.min(
    RESEARCH_CARD_LEVEL_BONUS.length - 1,
    Math.max(1, Math.floor(storedLevel))
  );

  return RESEARCH_CARD_LEVEL_BONUS[level];
}

export function applyKerjaSamaRegionalToMultiplier(
  multiplier: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(multiplier)) return multiplier;

  const researchBonusPercent = getKerjaSamaOrganisasiRegionalBonusPercent(countryDetail);
  if (researchBonusPercent <= 0) return multiplier;

  return 1 + (multiplier - 1) * (1 + researchBonusPercent / 100);
}

export function applyKerjaSamaRegionalToFlatBonus(
  bonus: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(bonus)) return bonus;

  const researchBonusPercent = getKerjaSamaOrganisasiRegionalBonusPercent(countryDetail);
  return bonus * (1 + researchBonusPercent / 100);
}
