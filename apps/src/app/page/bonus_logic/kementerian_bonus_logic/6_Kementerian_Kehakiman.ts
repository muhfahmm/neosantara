import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

/**
 * Mendapatkan persentase pengurangan tingkat kriminalitas (%) dari Kementerian Kehakiman.
 * Setiap level (blok) kabinet Kementerian Kehakiman memberikan -1.0% tingkat kriminalitas.
 * Jika menteri diangkat (menteri_kehakiman), terdapat tambahan bonus tier kandidat (5%, 10%, 15%, 20%, 50%).
 */
export function getKementerianKehakimanCrimeReductionBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  // Level departemen Kementerian Kehakiman (1 - 20)
  const level = getDepartmentLevel(countryDetail, "kehakiman");
  const baseBonus = level * 1.0; // 1% per level / blok

  // Bonus tambahan dari kandidat menteri
  const ministerTier = Number(countryDetail?.menteri_kehakiman) || 0;
  const ministerBonus = ministerTier > 0
    ? [0, 5, 10, 15, 20, 50][ministerTier] ?? 0
    : 0;

  return baseBonus + ministerBonus;
}

/**
 * Menerapkan diskon/pengurangan tingkat kriminalitas berdasarkan bonus Kementerian Kehakiman.
 * Mengurangi tingkat kriminalitas:
 * adjusted = max(0.01, crimeRate * (1 - bonusPercent / 100))
 */
export function applyKementerianKehakimanCrimeReduction(
  crimeRate: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(crimeRate) || crimeRate <= 0 || !countryDetail) return crimeRate;

  const reductionPercent = getKementerianKehakimanCrimeReductionBonusPercent(countryDetail);
  if (reductionPercent <= 0) return crimeRate;

  const multiplier = Math.max(0.05, 1 - reductionPercent / 100);
  return Math.max(0.01, crimeRate * multiplier);
}
