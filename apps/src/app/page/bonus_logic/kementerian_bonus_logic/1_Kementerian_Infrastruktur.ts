import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

/**
 * Mendapatkan persentase bonus kecepatan pembangunan (%) dari Kementerian Infrastruktur.
 * Setiap level (blok) kabinet Kementerian Infrastruktur memberikan +1.0% kecepatan pembangunan.
 * Jika menteri diangkat (menteri_infrastruktur), tambahan bonus tier kandidat (5%, 10%, 15%, 20%, 50%).
 */
export function getKementerianInfrastrukturBuildSpeedBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  // Level departemen Kementerian Infrastruktur (1 - 20)
  const level = getDepartmentLevel(countryDetail, "infrastruktur");
  const baseBonus = level * 1.0; // 1% per level / blok

  // Bonus tambahan dari menteri yang ditunjuk (jika ada)
  const ministerTier = Number(countryDetail?.menteri_infrastruktur) || 0;
  const ministerBonus = ministerTier > 0
    ? [0, 5, 10, 15, 20, 50][ministerTier] ?? 0
    : 0;

  return baseBonus + ministerBonus;
}

/**
 * Mengaplikasikan pengurangan waktu pembangunan berdasarkan bonus Kementerian Infrastruktur.
 * Mengurangi waktu hari pembangunan dengan rumus:
 * waktuEfektif = ceil(baseDays / (1 + bonusPercent / 100))
 * atau setara dengan mempercepat kecepatan pembangunan.
 */
export function applyKementerianInfrastrukturBuildTimeDiscount(
  baseDays: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!baseDays || baseDays <= 0 || !countryDetail) return baseDays;

  const bonusPercent = getKementerianInfrastrukturBuildSpeedBonusPercent(countryDetail);
  if (bonusPercent <= 0) return baseDays;

  const mult = 1 + bonusPercent / 100;
  return Math.max(1, Math.ceil(baseDays / mult));
}
