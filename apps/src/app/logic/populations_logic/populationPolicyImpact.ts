export const MAX_POPULATION_POLICY_MODIFIER_PERCENT = 0.75;
export const POPULATION_POLICY_IMPACT_FACTOR = 0.25;

export interface PopulationPolicyImpact {
  taxMonthlyModifierPercent: number;
  economicMonthlyModifierPercent: number;
  totalMonthlyModifierPercent: number;
  scaleFactor: number;
  wasCapped: boolean;
}

export function calculatePopulationPolicyImpact(
  taxMonthlyModifierPercent: number,
  economicMonthlyModifierPercent: number,
): PopulationPolicyImpact {
  const rawTaxModifier = taxMonthlyModifierPercent * POPULATION_POLICY_IMPACT_FACTOR;
  const rawEconomicModifier =
    economicMonthlyModifierPercent * POPULATION_POLICY_IMPACT_FACTOR;
  const rawTotal = rawTaxModifier + rawEconomicModifier;
  const totalMonthlyModifierPercent = Math.max(
    -MAX_POPULATION_POLICY_MODIFIER_PERCENT,
    Math.min(MAX_POPULATION_POLICY_MODIFIER_PERCENT, rawTotal),
  );
  const scaleFactor =
    rawTotal === 0 ? 1 : totalMonthlyModifierPercent / rawTotal;
  return {
    taxMonthlyModifierPercent: rawTaxModifier * scaleFactor,
    economicMonthlyModifierPercent: rawEconomicModifier * scaleFactor,
    totalMonthlyModifierPercent,
    scaleFactor,
    wasCapped: rawTotal !== totalMonthlyModifierPercent,
  };
}
