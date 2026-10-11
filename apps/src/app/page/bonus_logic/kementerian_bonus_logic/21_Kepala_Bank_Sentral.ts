import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

/**
 * Mendapatkan persentase peningkatan batas aman rasio pinjaman (%) dari Kepala Bank Sentral.
 * Nilai dasar rasio aman adalah 60%. Setiap level memberikan +1.0% (misal level 9 -> +9%, batas aman menjadi 69%).
 * Jika terdapat kepala bank sentral diangkat, dihitung tiernya.
 */
export function getBankSentralLoanSafeLimitBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const level = getDepartmentLevel(countryDetail, "bank-sentral");
  const baseBonus = level * 1.0;

  const leaderTier = Number(countryDetail?.["menteri_bank-sentral"] ?? countryDetail?.menteri_bank_sentral ?? countryDetail?.layanan_bank_sentral) || 0;
  const leaderBonus = leaderTier > 0
    ? [0, 5, 10, 15, 20, 50][leaderTier] ?? 0
    : 0;

  return baseBonus + leaderBonus;
}

/**
 * Menghitung batas aman rasio hutang/pinjaman (default base: 60%).
 */
export function getSafeDebtLimitRatio(
  countryDetail: Record<string, unknown> | null | undefined,
  baseLimit = 60
): number {
  const bonus = getBankSentralLoanSafeLimitBonusPercent(countryDetail);
  return baseLimit + bonus;
}

/**
 * Mengaplikasikan pengali batas pinjaman maksimal / kapasitas pinjaman (multiplier: 1 + bonus%).
 */
export function applyBankSentralMaxLoanBonus(
  baseMaxLoan: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseMaxLoan) || baseMaxLoan <= 0) return baseMaxLoan;
  const bonus = getBankSentralLoanSafeLimitBonusPercent(countryDetail);
  if (bonus <= 0) return baseMaxLoan;
  return Math.round(baseMaxLoan * (1 + bonus / 100));
}
