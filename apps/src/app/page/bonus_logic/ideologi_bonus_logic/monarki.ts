export const MONARCHY_MILITARY_STRENGTH_BONUS = 0.15;

export function getMonarchyMilitaryStrengthMultiplier(ideology: unknown): number {
  return String(ideology || '').trim().toLowerCase() === 'monarki'
    ? 1 + MONARCHY_MILITARY_STRENGTH_BONUS
    : 1;
}
