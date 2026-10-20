import { getCabinetMinistryBonusPercent } from "./ministryBonusUtils";

export function getKementerianKebudayaanRatingDecayReductionPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  return getCabinetMinistryBonusPercent(countryDetail, "kebudayaan");
}

/**
 * Apply Kementerian Kebudayaan bonus ke threshold (legacy - months-based)
 * @deprecated Use applyKementerianKebudayaanDecayMultiplierBonus() instead
 */
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

/**
 * Apply Kementerian Kebudayaan bonus ke decay multiplier (fractional system)
 * 
 * Ministry bonus reduces decay pressure by reducing the multiplier.
 * Example: 20% bonus + 0.6 multiplier → 0.6 * (1 - 0.2) = 0.48 multiplier
 * 
 * @param baseMultiplier Base decay multiplier (0-1)
 * @param countryDetail Country data
 * @returns Adjusted multiplier after bonus (0-1)
 */
export function applyKementerianKebudayaanDecayMultiplierBonus(
  baseMultiplier: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseMultiplier) || baseMultiplier <= 0) return baseMultiplier;

  const bonusPercent = getKementerianKebudayaanRatingDecayReductionPercent(countryDetail);
  if (bonusPercent <= 0) return baseMultiplier;

  // Apply bonus: reduce multiplier by the bonus percentage
  const bonusFraction = Math.min(bonusPercent, 90) / 100;
  const adjustedMultiplier = baseMultiplier * (1 - bonusFraction);
  
  return Math.max(0, Math.min(1, adjustedMultiplier));
}
