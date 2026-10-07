export const BUDDHA_ENVIRONMENTAL_TAX_REVENUE_BONUS = 0.1;

export function applyBuddhaEnvironmentalTaxRevenueBonus(
  baseRevenue: number,
  religion: unknown
): number {
  const normalizedReligion = String(religion || "").trim().toLowerCase();
  if (normalizedReligion !== "buddha") return baseRevenue;

  return Math.round(baseRevenue * (1 + BUDDHA_ENVIRONMENTAL_TAX_REVENUE_BONUS));
}
