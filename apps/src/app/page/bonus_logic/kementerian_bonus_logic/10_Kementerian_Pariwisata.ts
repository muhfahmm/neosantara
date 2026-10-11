import { getCabinetMinistryBonusPercent } from "./ministryBonusUtils";

export function getKementerianPariwisataIncomeBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  return getCabinetMinistryBonusPercent(countryDetail, "pariwisata");
}

export function applyKementerianPariwisataIncomeBonus(
  tourismIncome: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const bonusPercent = getKementerianPariwisataIncomeBonusPercent(countryDetail);
  return tourismIncome * (1 + bonusPercent / 100);
}
