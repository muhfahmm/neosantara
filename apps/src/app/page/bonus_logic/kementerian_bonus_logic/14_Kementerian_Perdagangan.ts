import { getCabinetMinistryBonusPercent } from "./ministryBonusUtils";

export function getKementerianPerdaganganPriceBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  return getCabinetMinistryBonusPercent(countryDetail, "perdagangan");
}

export function getKementerianPerdaganganSellPriceMultiplier(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  return 1 + getKementerianPerdaganganPriceBonusPercent(countryDetail) / 100;
}

export function getKementerianPerdaganganBuyPriceMultiplier(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  return Math.max(0.1, 1 - getKementerianPerdaganganPriceBonusPercent(countryDetail) / 100);
}
