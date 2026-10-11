import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

/**
 * Mendapatkan persentase pengurangan jumlah kematian akibat bencana alam (%) dari Layanan Darurat.
 * Setiap level (blok) Layanan Darurat memberikan -1.0% jumlah kematian.
 * Jika terdapat kepala layanan darurat diangkat, dihitung tiernya.
 */
export function getLayananDaruratDisasterDeathReductionBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const level = getDepartmentLevel(countryDetail, "layanan-darurat");
  const baseBonus = level * 1.0;

  const leaderTier = Number(countryDetail?.["menteri_layanan-darurat"] ?? countryDetail?.menteri_layanan_darurat ?? countryDetail?.layanan_layanan_darurat) || 0;
  const leaderBonus = leaderTier > 0
    ? [0, 5, 10, 15, 20, 50][leaderTier] ?? 0
    : 0;

  return baseBonus + leaderBonus;
}

/**
 * Menerapkan pengurangan jumlah korban kematian akibat bencana alam dari Layanan Darurat.
 */
export function applyLayananDaruratDisasterDeathReduction(
  fatalities: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(fatalities) || fatalities <= 0 || !countryDetail) return fatalities;

  const reductionPercent = getLayananDaruratDisasterDeathReductionBonusPercent(countryDetail);
  if (reductionPercent <= 0) return fatalities;

  const multiplier = Math.max(0.05, 1 - reductionPercent / 100);
  return Math.round(fatalities * multiplier);
}
