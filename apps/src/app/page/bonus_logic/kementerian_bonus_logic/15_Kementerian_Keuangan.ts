import { getCabinetMinistryBonusPercent } from "./ministryBonusUtils";

export function getKementerianKeuanganTaxRevenueBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  return getCabinetMinistryBonusPercent(countryDetail, "keuangan");
}

export function applyKementerianKeuanganTaxRevenueBonus(
  taxRevenue: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const bonusPercent = getKementerianKeuanganTaxRevenueBonusPercent(countryDetail);
  return taxRevenue * (1 + bonusPercent / 100);
}
