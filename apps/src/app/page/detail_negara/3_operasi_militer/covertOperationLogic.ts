import { getMilitaryResearchLevelBonus } from '@/app/page/bonus_logic/militaryResearchBonus';

export type CovertOperationType = 'spionase' | 'sabotase';

export interface CovertOperationResult {
  operation: CovertOperationType;
  targetCountry: string;
  successChance: number;
  succeeded: boolean;
}

export const COVERT_OPERATION_SUCCESS_CHANCE = 50;

export function getCovertOperationSuccessChance(
  operation: CovertOperationType,
  countryDetail?: Record<string, unknown> | null,
) {
  const researchId = operation === 'spionase' ? 'spionase_strategis' : 'sabotase_terarah';
  const completedResearch = Array.isArray(countryDetail?.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(researchId)) return COVERT_OPERATION_SUCCESS_CHANCE;

  const researchLevels = countryDetail?.research_levels &&
    typeof countryDetail.research_levels === 'object'
    ? countryDetail.research_levels as Record<string, unknown>
    : {};
  const level = Number(researchLevels[researchId]) || 1;
  const researchBonus = getMilitaryResearchLevelBonus(researchId, level) || 0;

  return Math.min(100, COVERT_OPERATION_SUCCESS_CHANCE + researchBonus);
}

export function resolveCovertOperation(
  operation: CovertOperationType,
  countryDetail?: Record<string, unknown> | null,
) {
  const successChance = getCovertOperationSuccessChance(operation, countryDetail);
  return {
    successChance,
    succeeded: Math.random() * 100 < successChance,
  };
}
