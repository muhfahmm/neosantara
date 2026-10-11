import { getCabinetMinistryBonusPercent } from "./ministryBonusUtils";

export function getKementerianLingkunganHidupDisasterReductionPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  return getCabinetMinistryBonusPercent(countryDetail, "lingkungan");
}

export function applyKementerianLingkunganHidupDisasterRiskReduction(
  baseChance: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const reductionPercent = getKementerianLingkunganHidupDisasterReductionPercent(countryDetail);
  const safeChance = Number.isFinite(baseChance) ? Math.max(0, baseChance) : 0;
  return safeChance * (1 - Math.min(reductionPercent, 100) / 100);
}

export function applyKementerianLingkunganHidupDisasterImpactReduction(
  baseImpact: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const reductionPercent = getKementerianLingkunganHidupDisasterReductionPercent(countryDetail);
  const safeImpact = Number.isFinite(baseImpact) ? Math.max(0, baseImpact) : 0;
  return Math.max(0, Math.round(safeImpact * (1 - Math.min(reductionPercent, 100) / 100)));
}
