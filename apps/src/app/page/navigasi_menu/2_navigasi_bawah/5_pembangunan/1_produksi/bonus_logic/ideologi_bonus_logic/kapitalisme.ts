export const CAPITALISM_TAX_REVENUE_BONUS = 0.5;

export function applyCapitalismTaxRevenueBonus(
  baseRevenue: number,
  ideology: unknown
): number {
  if (String(ideology || '').trim().toLowerCase() !== 'kapitalisme') return baseRevenue;
  return Math.round(baseRevenue * (1 + CAPITALISM_TAX_REVENUE_BONUS));
}
