import { getMilitaryResearchLevelBonus } from '@/app/page/bonus_logic/militaryResearchBonus';

export interface SpionaseOperationResult {
  operation: 'spionase';
  targetCountry: string;
  operationTarget?: string;
  successChance: number;
  succeeded: boolean;
}

export const SPIONASE_BASE_SUCCESS_CHANCE = 50;

export function getSpionaseSuccessChance(
  countryDetail?: Record<string, unknown> | null,
): number {
  const researchId = 'spionase_strategis';
  const completedResearch = Array.isArray(countryDetail?.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(researchId)) return SPIONASE_BASE_SUCCESS_CHANCE;

  const researchLevels = countryDetail?.research_levels &&
    typeof countryDetail.research_levels === 'object'
    ? countryDetail.research_levels as Record<string, unknown>
    : {};
  const level = Number(researchLevels[researchId]) || 1;
  const researchBonus = getMilitaryResearchLevelBonus(researchId, level) || 0;

  return Math.min(100, SPIONASE_BASE_SUCCESS_CHANCE + researchBonus);
}

export function resolveSpionaseOperation(
  countryDetail?: Record<string, unknown> | null,
  operationTarget?: string,
): { operationTarget?: string; successChance: number; succeeded: boolean } {
  const successChance = getSpionaseSuccessChance(countryDetail);
  return {
    operationTarget,
    successChance,
    succeeded: Math.random() * 100 < successChance,
  };
}
