export const LIBERALISM_TAX_REVENUE_BONUS = 0.25;

export function applyLiberalismTaxRevenueBonus(
  baseRevenue: number,
  ideology: unknown
): number {
  if (String(ideology || "").trim().toLowerCase() !== "liberalisme") return baseRevenue;
  return Math.round(baseRevenue * (1 + LIBERALISM_TAX_REVENUE_BONUS));
}
