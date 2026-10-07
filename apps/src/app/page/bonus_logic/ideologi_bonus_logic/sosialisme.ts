export const SOCIALISM_BIRTH_RATE_BONUS = 0.1;

export function applySocialismBirthRateBonus(
  populationChange: number,
  ideology: unknown
): number {
  if (String(ideology || '').trim().toLowerCase() !== 'sosialisme' || populationChange === 0) {
    return populationChange;
  }

  const multiplier = populationChange > 0
    ? 1 + SOCIALISM_BIRTH_RATE_BONUS
    : 1 - SOCIALISM_BIRTH_RATE_BONUS;
  return Math.round(populationChange * multiplier);
}
