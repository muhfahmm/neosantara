export const AUTHORITARIAN_MILITARY_STRENGTH_BONUS = 0.25;

export function getAuthoritarianMilitaryStrengthMultiplier(ideology: unknown): number {
  return String(ideology || '').trim().toLowerCase() === 'otoritarianisme'
    ? 1 + AUTHORITARIAN_MILITARY_STRENGTH_BONUS
    : 1;
}
