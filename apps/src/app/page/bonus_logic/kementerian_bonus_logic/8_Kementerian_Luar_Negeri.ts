import { getCabinetMinistryBonusPercent } from "./ministryBonusUtils";

export function getKementerianLuarNegeriTreatyChanceBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  return getCabinetMinistryBonusPercent(countryDetail, "luar-negeri");
}

export function applyKementerianLuarNegeriTreatyChanceBonus(
  chancePercent: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const safeChance = Number.isFinite(chancePercent) ? chancePercent : 0;
  return Math.min(100, Math.max(0, safeChance + getKementerianLuarNegeriTreatyChanceBonusPercent(countryDetail)));
}
