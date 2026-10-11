import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

/**
 * Nilai persentase bonus per tier kandidat menteri:
 * - Tier 1: 5% (Menteri 1, Biaya 500 NEO)
 * - Tier 2: 10% (Menteri 2, Biaya 1.500 NEO)
 * - Tier 3: 15% (Menteri 3, Biaya 3.000 NEO)
 * - Tier 4: 20% (Menteri 4, Biaya 5.000 NEO)
 * - Tier 5: 50% (Menteri 5, Biaya 10.000 NEO)
 */
export const MINISTER_CANDIDATE_TIER_BONUS_PERCENT: Record<number, number> = {
  1: 5,
  2: 10,
  3: 15,
  4: 20,
  5: 50,
};

/**
 * Mendapatkan persentase bonus kandidat menteri (5% - 50%) untuk departemen tertentu.
 * Nilai tier kandidat disimpan dalam countryDetail dengan format:
 * - `menteri_<departmentId>` (contoh: `menteri_infrastruktur`, `menteri_polisi`, dll)
 * - Fallback untuk format keamanan/layanan (`keamanan_<departmentId>`, dll).
 */
export function getKandidatMenteriBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  departmentId: string
): number {
  if (!countryDetail) return 0;

  const normalizedId = departmentId.replace(/-/g, "_");
  const rawTier =
    countryDetail[`menteri_${departmentId}`] ??
    countryDetail[`menteri_${normalizedId}`] ??
    countryDetail[`keamanan_${departmentId}`] ??
    countryDetail[`keamanan_${normalizedId}`] ??
    countryDetail[`layanan_${departmentId}`] ??
    countryDetail[`layanan_${normalizedId}`] ??
    0;

  const tier = Number(rawTier) || 0;
  return MINISTER_CANDIDATE_TIER_BONUS_PERCENT[tier] ?? 0;
}

/**
 * Menghitung total persentase bonus gabungan:
 * Level Kabinet (1% - 20%) + Bonus Kandidat Menteri (5% - 50%).
 *
 * Contoh:
 * - Level 8 + Kandidat Tier 3 (15%) = 8% + 15% = 23%.
 * - Level 20 + Kandidat Tier 5 (50%) = 20% + 50% = 70%.
 */
export function getTotalDepartmentBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  departmentId: string
): number {
  if (!countryDetail) return 0;

  const level = getDepartmentLevel(countryDetail, departmentId);
  const basePercent = level * 1.0;
  const ministerPercent = getKandidatMenteriBonusPercent(countryDetail, departmentId);

  return basePercent + ministerPercent;
}

/**
 * Mengecek apakah departemen memiliki menteri yang aktif menjabat.
 */
export function isKandidatMenteriHired(
  countryDetail: Record<string, unknown> | null | undefined,
  departmentId: string
): boolean {
  return getKandidatMenteriBonusPercent(countryDetail, departmentId) > 0;
}
