import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

/**
 * Mendapatkan persentase bonus kekuatan militer darat (%) dari Komandan Angkatan Darat.
 * Setiap level (blok) memberikan +1.0% Kekuatan Darat.
 * Jika terdapat jenderal/komandan angkatan darat diangkat, dihitung tiernya.
 */
export function getKomandanAngkatanDaratBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const level = getDepartmentLevel(countryDetail, "komandan-angkatan-darat");
  const baseBonus = level * 1.0;

  const leaderTier = Number(countryDetail?.["menteri_komandan-angkatan-darat"] ?? countryDetail?.menteri_komandan_angkatan_darat ?? countryDetail?.keamanan_komandan_angkatan_darat) || 0;
  const leaderBonus = leaderTier > 0
    ? [0, 5, 10, 15, 20, 50][leaderTier] ?? 0
    : 0;

  return baseBonus + leaderBonus;
}

/**
 * Mendapatkan pengali kekuatan militer darat dari Komandan Angkatan Darat.
 */
export function getKomandanAngkatanDaratMultiplier(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const bonusPercent = getKomandanAngkatanDaratBonusPercent(countryDetail);
  if (bonusPercent <= 0) return 1;
  return 1 + bonusPercent / 100;
}

/**
 * Menerapkan bonus Komandan Angkatan Darat ke kekuatan dasar militer darat.
 */
export function applyKomandanAngkatanDaratMilitaryPower(
  basePower: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(basePower) || basePower <= 0) return basePower;
  return Math.round(basePower * getKomandanAngkatanDaratMultiplier(countryDetail));
}
