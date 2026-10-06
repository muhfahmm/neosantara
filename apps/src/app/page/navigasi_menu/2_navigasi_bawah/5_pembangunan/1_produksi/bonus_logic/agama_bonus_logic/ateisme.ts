export const ATHEISM_RESEARCH_SPEED_BONUS = 0.15;

export function applyAtheismResearchSpeedBonus(
  baseDurationDays: number,
  religion: unknown
): number {
  const normalizedReligion = String(religion || "").trim().toLowerCase();
  if (normalizedReligion !== "ateisme" || baseDurationDays <= 0) {
    return baseDurationDays;
  }

  return Math.max(1, Math.ceil(baseDurationDays / (1 + ATHEISM_RESEARCH_SPEED_BONUS)));
}
