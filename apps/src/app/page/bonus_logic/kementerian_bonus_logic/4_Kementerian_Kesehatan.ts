import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

/**
 * Mendapatkan persentase pengurangan korban jiwa pandemi dan epidemi (%) dari Kementerian Kesehatan.
 * Setiap level (blok) kabinet Kementerian Kesehatan memberikan -1.0% kematian akibat pandemi dan epidemi.
 * Jika menteri diangkat (menteri_kesehatan), terdapat tambahan bonus tier kandidat (5%, 10%, 15%, 20%, 50%).
 */
export function getKementerianKesehatanPandemicReductionBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  // Level departemen Kementerian Kesehatan (1 - 20)
  const level = getDepartmentLevel(countryDetail, "kesehatan");
  const baseBonus = level * 1.0; // 1% per level / blok

  // Bonus tambahan dari kandidat menteri (jika ada yang direkrut)
  const ministerTier = Number(countryDetail?.menteri_kesehatan) || 0;
  const ministerBonus = ministerTier > 0
    ? [0, 5, 10, 15, 20, 50][ministerTier] ?? 0
    : 0;

  return baseBonus + ministerBonus;
}

/**
 * Mengaplikasikan pengurangan korban jiwa pandemi/epidemi berdasarkan bonus Kementerian Kesehatan.
 * Rumus: max(0, floor(deaths * (1 - bonusPercent / 100)))
 */
export function applyKementerianKesehatanPandemicFatalityReduction(
  deaths: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(deaths) || deaths <= 0 || !countryDetail) return deaths;

  const reductionPercent = getKementerianKesehatanPandemicReductionBonusPercent(countryDetail);
  if (reductionPercent <= 0) return deaths;

  const multiplier = Math.max(0, 1 - reductionPercent / 100);
  return Math.max(0, Math.floor(deaths * multiplier));
}
