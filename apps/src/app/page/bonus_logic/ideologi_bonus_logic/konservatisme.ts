export const CONSERVATISM_TAX_REVENUE_BONUS = 0.05;

export function applyConservatismTaxRevenueBonus(
  baseRevenue: number,
  ideology: unknown
): number {
  if (String(ideology || "").trim().toLowerCase() !== "konservatisme") return baseRevenue;
  return Math.round(baseRevenue * (1 + CONSERVATISM_TAX_REVENUE_BONUS));
}
