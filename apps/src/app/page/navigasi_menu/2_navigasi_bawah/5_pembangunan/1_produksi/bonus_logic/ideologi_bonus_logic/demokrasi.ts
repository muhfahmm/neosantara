export const DEMOCRACY_TAX_REVENUE_BONUS = 0.1;

export function applyDemocracyTaxRevenueBonus(
  baseRevenue: number,
  ideology: unknown
): number {
  if (String(ideology || '').trim().toLowerCase() !== 'demokrasi') return baseRevenue;
  return Math.round(baseRevenue * (1 + DEMOCRACY_TAX_REVENUE_BONUS));
}
