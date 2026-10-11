import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

/**
 * Daftar ID inisiatif / program acara kepuasan yang dikategorikan sebagai acara olahraga.
 * Acara non-olahraga (seperti karnaval, konser, festival) tidak mendapatkan bonus ini.
 */
export const SPORT_EVENT_IDS = new Set([
  "piala_davis",
  "piala_dunia_rugbi",
  "olimpiade",
  "piala_dunia_fifa",
  "balap_f1",
]);

/**
 * Mengecek apakah suatu inisiatif / acara merupakan acara olahraga.
 */
export function isSportEvent(eventId: string): boolean {
  if (!eventId) return false;
  return SPORT_EVENT_IDS.has(eventId.toLowerCase().trim());
}

/**
 * Mendapatkan persentase bonus efektivitas kepuasan acara olahraga (%) dari Kementerian Olahraga.
 * Setiap level (blok) kabinet Kementerian Olahraga memberikan +1.0% efektivitas kepuasan acara.
 * Jika menteri diangkat (menteri_olahraga), terdapat tambahan bonus tier kandidat (5%, 10%, 15%, 20%, 50%).
 */
export function getKementerianOlahragaEventSatisfactionBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  // Level departemen Kementerian Olahraga (1 - 20)
  const level = getDepartmentLevel(countryDetail, "olahraga");
  const baseBonus = level * 1.0; // 1% per level / blok

  // Bonus tambahan dari kandidat menteri
  const ministerTier = Number(countryDetail?.menteri_olahraga) || 0;
  const ministerBonus = ministerTier > 0
    ? [0, 5, 10, 15, 20, 50][ministerTier] ?? 0
    : 0;

  return baseBonus + ministerBonus;
}

/**
 * Menerapkan peningkatan boost kepuasan khusus acara olahraga.
 * Acara non-olahraga (misal konser, festival, karnaval) tidak mengalami perubahan (mengembalikan baseSatisfactionBoost).
 */
export function applyKementerianOlahragaSatisfactionBoost(
  baseSatisfactionBoost: number,
  eventId: string,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseSatisfactionBoost) || baseSatisfactionBoost <= 0 || !countryDetail) {
    return baseSatisfactionBoost;
  }

  // Jika bukan acara olahraga, tidak mendapatkan penambahan dari kementerian olahraga
  if (!isSportEvent(eventId)) {
    return baseSatisfactionBoost;
  }

  const bonusPercent = getKementerianOlahragaEventSatisfactionBonusPercent(countryDetail);
  if (bonusPercent <= 0) return baseSatisfactionBoost;

  const boosted = baseSatisfactionBoost * (1 + bonusPercent / 100);
  return Math.round(boosted);
}
