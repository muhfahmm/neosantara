import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

/**
 * Mendapatkan persentase pengurangan waktu riset/penelitian (%) dari departemen Sains dan Penelitian.
 * Setiap level (blok) kabinet Sains dan Penelitian memberikan -1.0% waktu riset (lebih cepat).
 * Jika menteri diangkat (menteri_sains), tambahan bonus tier kandidat (5%, 10%, 15%, 20%, 50%).
 *
 * Contoh: Level 7 menteri aktif = 7.0% pengurangan waktu riset (-7.0%).
 */
export function getSainsPenelitianResearchSpeedBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  // Level departemen Sains dan Penelitian (1 - 20)
  const level = getDepartmentLevel(countryDetail, "sains");
  const baseBonus = level * 1.0; // 1% per level / blok

  // Bonus tambahan dari kandidat menteri (jika ada yang direkrut)
  const ministerTier = Number(countryDetail?.menteri_sains) || 0;
  const ministerBonus = ministerTier > 0
    ? [0, 5, 10, 15, 20, 50][ministerTier] ?? 0
    : 0;

  return baseBonus + ministerBonus;
}

/**
 * Mengaplikasikan pengurangan durasi penelitian berdasarkan bonus Sains dan Penelitian.
 * Durasi dipotong sesuai persentase bonus:
 * durasiAkhir = max(1, round(baseDurationDays * (1 - bonusPercent / 100)))
 */
export function applySainsPenelitianResearchDurationDiscount(
  baseDurationDays: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!baseDurationDays || baseDurationDays <= 0 || !countryDetail) return baseDurationDays;

  const bonusPercent = getSainsPenelitianResearchSpeedBonusPercent(countryDetail);
  if (bonusPercent <= 0) return baseDurationDays;

  const multiplier = Math.max(0.1, 1 - bonusPercent / 100);
  return Math.max(1, Math.round(baseDurationDays * multiplier));
}
