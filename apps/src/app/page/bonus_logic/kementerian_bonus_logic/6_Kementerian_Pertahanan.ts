import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

/**
 * Mendapatkan persentase bonus kekuatan militer (%) dari Kementerian Pertahanan.
 * Berlaku untuk seluruh matra (Darat, Laut, Udara).
 * Setiap level (blok) kabinet Kementerian Pertahanan memberikan +1.0% Kekuatan Militer.
 * Jika menteri diangkat (menteri_pertahanan), terdapat tambahan bonus tier kandidat (5%, 10%, 15%, 20%, 50%).
 */
export function getKementerianPertahananMilitaryPowerBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  // Level departemen Kementerian Pertahanan (1 - 20)
  const level = getDepartmentLevel(countryDetail, "pertahanan");
  const baseBonus = level * 1.0; // 1% per level / blok

  // Bonus tambahan dari kandidat menteri
  const ministerTier = Number(countryDetail?.menteri_pertahanan) || 0;
  const ministerBonus = ministerTier > 0
    ? [0, 5, 10, 15, 20, 50][ministerTier] ?? 0
    : 0;

  return baseBonus + ministerBonus;
}

/**
 * Mendapatkan pengali kekuatan militer dari Kementerian Pertahanan.
 * Contoh: Bonus 15% -> pengali 1.15
 */
export function getKementerianPertahananMilitaryPowerMultiplier(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const bonusPercent = getKementerianPertahananMilitaryPowerBonusPercent(countryDetail);
  if (bonusPercent <= 0) return 1;
  return 1 + bonusPercent / 100;
}

/**
 * Mengaplikasikan bonus Kementerian Pertahanan ke base power unit militer.
 */
export function applyKementerianPertahananMilitaryPower(
  basePower: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(basePower) || basePower <= 0 || !countryDetail) return basePower;
  const mult = getKementerianPertahananMilitaryPowerMultiplier(countryDetail);
  return basePower * mult;
}
