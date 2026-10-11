import { getCabinetMinistryBonusPercent } from "./ministryBonusUtils";

export function getKementerianKebudayaanRatingDecayReductionPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  return getCabinetMinistryBonusPercent(countryDetail, "kebudayaan");
}

export function applyKementerianKebudayaanRatingDecayReduction(
  baseThresholdMonths: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseThresholdMonths) || baseThresholdMonths <= 0) return baseThresholdMonths;

  const reductionPercent = getKementerianKebudayaanRatingDecayReductionPercent(countryDetail);
  if (reductionPercent <= 0) return baseThresholdMonths;

  const reductionFraction = Math.min(reductionPercent, 90) / 100;
  return Math.ceil(baseThresholdMonths / (1 - reductionFraction));
}
