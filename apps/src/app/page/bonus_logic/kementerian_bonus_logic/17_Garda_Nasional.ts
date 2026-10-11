import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

/**
 * Mendapatkan persentase pengurangan separatisme (%) dari Garda Nasional (Departemen Keamanan).
 * Setiap level (blok) Garda Nasional memberikan -1.0% separatisme di wilayah kependudukan.
 * Jika terdapat komandan/pimpinan garda nasional, dihitung tiernya.
 */
export function getGardaNasionalSeparatismeReductionBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const level = getDepartmentLevel(countryDetail, "garda-nasional");
  const baseBonus = level * 1.0;

  const leaderTier = Number(countryDetail?.["menteri_garda-nasional"] ?? countryDetail?.menteri_garda_nasional ?? countryDetail?.keamanan_garda_nasional) || 0;
  const leaderBonus = leaderTier > 0
    ? [0, 5, 10, 15, 20, 50][leaderTier] ?? 0
    : 0;

  return baseBonus + leaderBonus;
}

/**
 * Menerapkan pengurangan risiko / tingkat separatisme dari Garda Nasional.
 */
export function applyGardaNasionalSeparatismeReduction(
  separatismeRisk: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(separatismeRisk) || separatismeRisk <= 0 || !countryDetail) return separatismeRisk;

  const reductionPercent = getGardaNasionalSeparatismeReductionBonusPercent(countryDetail);
  if (reductionPercent <= 0) return separatismeRisk;

  return Math.max(0, separatismeRisk - reductionPercent);
}
