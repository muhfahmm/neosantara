import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

/**
 * Mendapatkan persentase bonus kekuatan militer laut (%) dari Komandan Armada.
 * Setiap level (blok) memberikan +1.0% Kekuatan Laut.
 * Jika terdapat laksamana/komandan armada diangkat, dihitung tiernya.
 */
export function getKomandanArmadaBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const level = getDepartmentLevel(countryDetail, "komandan-armada");
  const baseBonus = level * 1.0;

  const leaderTier = Number(countryDetail?.["menteri_komandan-armada"] ?? countryDetail?.menteri_komandan_armada ?? countryDetail?.keamanan_komandan_armada) || 0;
  const leaderBonus = leaderTier > 0
    ? [0, 5, 10, 15, 20, 50][leaderTier] ?? 0
    : 0;

  return baseBonus + leaderBonus;
}

/**
 * Mendapatkan pengali kekuatan militer laut dari Komandan Armada.
 */
export function getKomandanArmadaMultiplier(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const bonusPercent = getKomandanArmadaBonusPercent(countryDetail);
  if (bonusPercent <= 0) return 1;
  return 1 + bonusPercent / 100;
}

/**
 * Menerapkan bonus Komandan Armada ke kekuatan dasar militer laut.
 */
export function applyKomandanArmadaMilitaryPower(
  basePower: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(basePower) || basePower <= 0) return basePower;
  return Math.round(basePower * getKomandanArmadaMultiplier(countryDetail));
}
