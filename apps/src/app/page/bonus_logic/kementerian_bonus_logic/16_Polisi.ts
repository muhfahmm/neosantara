import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

/**
 * Mendapatkan persentase pengurangan tingkat kriminalitas (%) dari Polisi (Departemen Keamanan).
 * Setiap level (blok) Polisi memberikan -1.0% tingkat kriminalitas.
 * Jika terdapat kepala/pimpinan polisi (misal menteri_polisi / keamanan_polisi), dihitung tiernya.
 */
export function getPolisiCrimeReductionBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const level = getDepartmentLevel(countryDetail, "polisi");
  const baseBonus = level * 1.0;

  const leaderTier = Number(countryDetail?.menteri_polisi ?? countryDetail?.keamanan_polisi) || 0;
  const leaderBonus = leaderTier > 0
    ? [0, 5, 10, 15, 20, 50][leaderTier] ?? 0
    : 0;

  return baseBonus + leaderBonus;
}

/**
 * Menerapkan pengurangan tingkat kriminalitas dari Polisi.
 */
export function applyPolisiCrimeReduction(
  crimeRate: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(crimeRate) || crimeRate <= 0 || !countryDetail) return crimeRate;

  const reductionPercent = getPolisiCrimeReductionBonusPercent(countryDetail);
  if (reductionPercent <= 0) return crimeRate;

  const multiplier = Math.max(0.05, 1 - reductionPercent / 100);
  return Math.max(0.01, crimeRate * multiplier);
}
