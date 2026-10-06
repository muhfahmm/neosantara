export const HINDU_POPULATION_GROWTH_BONUS = 0.08;

export function applyHinduPopulationGrowthBonus(
  populationChange: number,
  religion: unknown
): number {
  const normalizedReligion = String(religion || "").trim().toLowerCase();
  if (normalizedReligion !== "hindu" || populationChange === 0) return populationChange;

  const multiplier = populationChange > 0
    ? 1 + HINDU_POPULATION_GROWTH_BONUS
    : 1 - HINDU_POPULATION_GROWTH_BONUS;
  return Math.round(populationChange * multiplier);
}
