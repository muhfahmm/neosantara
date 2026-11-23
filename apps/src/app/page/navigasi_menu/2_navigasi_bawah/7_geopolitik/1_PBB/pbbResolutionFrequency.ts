export const PBB_RESOLUTION_ANNUAL_CHANCE_PERCENT = {
  generalAssemblyRegular: 15,
  securityCouncilRegular: 10,
  generalAssemblyInvasion: 30,
  securityCouncilInvasionAgainstViolator: 60,
} as const;

export const PBB_UNAUTHORIZED_ATTACK_SANCTION_CHANCE_PERCENT = 60;

export type PbbChancePeriod = "day" | "month" | "year";

export function getPbbChancePercentForPeriod(
  annualChancePercent: number,
  period: PbbChancePeriod,
  daysInYear = 365,
): number {
  if (!Number.isFinite(annualChancePercent)) return 0;

  const annualChance = Math.min(100, Math.max(0, annualChancePercent)) / 100;
  const periodsPerYear = period === "day"
    ? Math.max(1, daysInYear)
    : period === "month"
      ? 12
      : 1;

  return (1 - Math.pow(1 - annualChance, 1 / periodsPerYear)) * 100;
}

export function rollPbbChancePercent(
  chancePercent: number,
  rng: () => number = Math.random,
): boolean {
  if (!Number.isFinite(chancePercent)) return false;
  const chance = Math.min(100, Math.max(0, chancePercent));
  return rng() * 100 < chance;
}
