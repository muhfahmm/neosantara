import { RESEARCH_CARD_LEVEL_BONUS } from "../../researchCardLevelBonus";

export const ALIANSI_PERTAHANAN_RESEARCH_ID = "aliansi_pertahanan";
export const BASE_DEFENSE_ALLIANCE_OFFER_CHANCE_PERCENT = 25;

export function getDefenseAllianceOfferChancePercent(
  countryDetail: Record<string, unknown> | null | undefined,
  baseChancePercent = BASE_DEFENSE_ALLIANCE_OFFER_CHANCE_PERCENT
): number {
  const safeBaseChance = Number.isFinite(baseChancePercent)
    ? Math.min(100, Math.max(0, baseChancePercent))
    : BASE_DEFENSE_ALLIANCE_OFFER_CHANCE_PERCENT;
  if (!countryDetail) return safeBaseChance;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(ALIANSI_PERTAHANAN_RESEARCH_ID)) return safeBaseChance;

  const researchLevels = countryDetail.research_levels &&
    typeof countryDetail.research_levels === "object"
    ? countryDetail.research_levels as Record<string, unknown>
    : {};
  const storedLevel = Number(researchLevels[ALIANSI_PERTAHANAN_RESEARCH_ID]) || 1;
  const level = Math.min(
    RESEARCH_CARD_LEVEL_BONUS.length - 1,
    Math.max(1, Math.floor(storedLevel))
  );
  const bonusPercent = RESEARCH_CARD_LEVEL_BONUS[level];

  return Math.min(100, safeBaseChance + bonusPercent);
}
