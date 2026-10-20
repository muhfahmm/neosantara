/**
 * peringkatCalculator.ts
 * Utility untuk menghitung dan memanajemen penurunan peringkat presiden berdasarkan kepuasan
 * 
 * Logika:
 * - Peringkat turun secara otomatis seiring waktu (bulan yang berlalu)
 * - Kecepatan penurunan bergantung pada level kepuasan saat ini
 * - Decay multiplier (0.1-1.0) ditentukan dari kepuasan untuk fractional decay
 * - Counter di-scale jika tier kepuasan berubah untuk smooth transition
 * - Event dapat memberikan boost rating ke pemain
 * 
 * FRACTIONAL DECAY SYSTEM:
 * - Kepuasan ≤ 25 (kritis) = 0.1 decay multiplier per month
 * - Kepuasan ≤ 40 (buruk) = 0.3 decay multiplier per month
 * - Kepuasan ≤ 65 (sedang) = 0.6 decay multiplier per month
 * - Kepuasan ≤ 80 (baik) = 0.85 decay multiplier per month
 * - Kepuasan > 80 (sangat baik) = 1.0 decay multiplier per month
 */
import { 
  applyKementerianKebudayaanRatingDecayReduction,
  applyKementerianKebudayaanDecayMultiplierBonus 
} from "@/app/page/bonus_logic";

// ─── Helper: Hitung perbedaan bulan antara dua tanggal ────────────────────

export function getMonthsDifference(d1Str: string, d2Str: string): number {
  try {
    const d1 = new Date(d1Str);
    const d2 = new Date(d2Str);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  } catch {
    return 0;
  }
}

// ─── NEW: Hitung decay multiplier berdasarkan level kepuasan ──────────────

/**
 * Menentukan decay multiplier (0.1-1.0) per bulan berdasarkan kepuasan
 * Semakin buruk kepuasan, semakin kecil multiplier (decay lebih lambat)
 * 
 * FRACTIONAL DECAY TIERS:
 * - kepuasan ≤ 25 (kritis): 0.1 multiplier (10% normal decay per month)
 * - kepuasan ≤ 40 (buruk): 0.3 multiplier (30% normal decay per month)
 * - kepuasan ≤ 65 (sedang): 0.6 multiplier (60% normal decay per month)
 * - kepuasan ≤ 80 (baik): 0.85 multiplier (85% normal decay per month)
 * - kepuasan > 80 (sangat baik): 1.0 multiplier (100% normal decay per month)
 * 
 * Contoh: Dengan multiplier 0.1, rating turun 0.1 per bulan, 
 * jadi butuh 10 bulan untuk turun 1 poin (vs 1 bulan tanpa multiplier)
 */
export function getDecayMultiplierFromSatisfaction(
  kepuasan: number,
  keterbukaanScore?: number,
  serviceDeficitPressure = 0,
  lowSectorCount = 0,
): number {
  let baseMultiplier = 1.0;
  if (kepuasan <= 25) {
    baseMultiplier = 0.1;  // KRITIS
  } else if (kepuasan <= 40) {
    baseMultiplier = 0.3;  // BURUK
  } else if (kepuasan <= 65) {
    baseMultiplier = 0.6;  // SEDANG
  } else if (kepuasan <= 80) {
    baseMultiplier = 0.85; // BAIK
  }
  // else baseMultiplier = 1.0 (SANGAT BAIK)

  // Jika ada low sector, percepat decay (reduce multiplier)
  // Old system capped threshold to 6 months; equivalent is reducing multiplier
  // Strategy: reduce multiplier by 5% per low sector (up to reasonable limit)
  if (lowSectorCount > 0) {
    const sectorReduction = Math.min(0.4, lowSectorCount * 0.05); // Max 40% reduction
    baseMultiplier = baseMultiplier * (1 - sectorReduction);
  }

  // Jika Indeks Keterbukaan rendah (< 50), akselerasi decay
  if (keterbukaanScore !== undefined && keterbukaanScore < 50) {
    // Multiplier keterbukaan: 0.4 + (keterbukaan/50)*0.5 = 0.4-0.9x
    const keterbukaaFactor = Math.max(0.4, 0.4 + (keterbukaanScore / 50) * 0.5);
    baseMultiplier = baseMultiplier * keterbukaaFactor;
  }

  // Jika ada service deficit pressure, kurangi multiplier (akselerasi decay)
  if (serviceDeficitPressure > 0) {
    const serviceFactor = 1 - Math.min(1, Math.max(0, serviceDeficitPressure)) * 0.5;
    baseMultiplier = baseMultiplier * serviceFactor;
  }

  return Math.min(1, Math.max(0, baseMultiplier));
}

// ─── Tentukan threshold (bulan target) berdasarkan level kepuasan ─────────
// @deprecated: Use getDecayMultiplierFromSatisfaction() instead

/**
 * Menentukan threshold bulan sebelum rating berkurang 1 poin
 * Semakin buruk kepuasan, semakin cepat rating turun
 * 
 * @deprecated This function is kept for backward compatibility during migration to fractional decay.
 * Use getDecayMultiplierFromSatisfaction() for new code.
 */
export function getThresholdFromSatisfaction(
  kepuasan: number,
  keterbukaanScore?: number,
  serviceDeficitPressure = 0,
  lowSectorCount = 0,
): number {
  let baseThreshold = 12;
  if (kepuasan <= 25) {
    baseThreshold = 1;  // KRITIS: rating turun 1 poin setiap 1 bulan
  } else if (kepuasan <= 40) {
    baseThreshold = 3;  // BURUK: rating turun 1 poin setiap 3 bulan
  } else if (kepuasan <= 65) {
    baseThreshold = 6;  // SEDANG: rating turun 1 poin megenap 6 bulan
  } else if (kepuasan <= 80) {
    baseThreshold = 9;  // BAIK: rating turun 1 poin setiap 9 bulan
  } else {
    baseThreshold = 12; // SANGAT BAIK: rating turun 1 poin setiap 12 bulan (setahun)
  }

  // Jika Indeks Keterbukaan rendah (< 50), percepat penurunan (perkecil threshold bulan)
  if (keterbukaanScore !== undefined && keterbukaanScore < 50) {
    // Multiplier berkisar 0.5x - 0.9x tergantung seberapa rendah keterbukaan (misal: 10/50 -> 0.5x + 0.1 = 0.6x)
    const factor = Math.max(0.4, 0.4 + (keterbukaanScore / 50) * 0.5);
    baseThreshold = Math.max(1, Math.floor(baseThreshold * factor));
  }

  const serviceFactor = 1 - Math.min(1, Math.max(0, serviceDeficitPressure)) * 0.5;
  baseThreshold = Math.max(1, Math.floor(baseThreshold * serviceFactor));
  if (lowSectorCount > 0) baseThreshold = Math.min(baseThreshold, 6);
  return baseThreshold;
}

// ─── Scale counter jika tier multiplier berubah ────────────────────────────

/**
 * Skala ratingMonthCounter ketika multiplier tier berubah
 * Memastikan progress bar tetap smooth tanpa lonjakan
 * 
 * Contoh: Jika counter = 0.5 bulan dengan multiplier 0.6, dan multiplier berubah jadi 0.3,
 * maka counter di-scale menjadi (0.5/0.6)*0.3 = 0.25 agar persentase tetap sama
 */
export function scaleRatingCounterOnMultiplierChange(
  ratingMonthCounter: number,
  prevMultiplier: number,
  newMultiplier: number
): number {
  if (prevMultiplier <= 0 || newMultiplier <= 0 || prevMultiplier === newMultiplier) {
    return ratingMonthCounter;
  }
  // Scale proportionally: preserve the accumulation percentage
  return (ratingMonthCounter / prevMultiplier) * newMultiplier;
}

/**
 * Skala ratingMonthCounter ketika threshold berubah (legacy)
 * Memastikan progress bar tetap smooth tanpa lonjakan
 * 
 * @deprecated Use scaleRatingCounterOnMultiplierChange() instead
 */
export function scaleRatingCounterOnThresholdChange(
  ratingMonthCounter: number,
  prevThreshold: number,
  newThreshold: number
): number {
  if (prevThreshold <= 0 || prevThreshold === newThreshold) {
    return ratingMonthCounter;
  }
  return Math.round((ratingMonthCounter / prevThreshold) * newThreshold);
}

// ─── Hitung penurunan rating berdasarkan counter ────────────────────────────

/**
 * Menghitung berapa banyak rating berkurang dan reset counter
 * 
 * Contoh:
 * - counter = 18 bulan, threshold = 6
 * - ratingDecrease = floor(18 / 6) = 3 (rating berkurang 3 poin)
 * - newCounter = 18 % 6 = 0 (counter direset)
 */
export interface RatingDecreaseResult {
  ratingDecrease: number;
  newRatingMonthCounter: number;
}

export function calculateRatingDecrease(
  ratingMonthCounter: number,
  threshold: number
): RatingDecreaseResult {
  let ratingDecrease = 0;
  let newCounter = ratingMonthCounter;

  if (ratingMonthCounter >= threshold && threshold > 0) {
    ratingDecrease = Math.floor(ratingMonthCounter / threshold);
    newCounter = ratingMonthCounter % threshold;
  }

  return {
    ratingDecrease,
    newRatingMonthCounter: newCounter,
  };
}

// ─── Main: Update peringkat presiden berdasarkan waktu dan kepuasan ────────

export interface PresidentRatingState {
  presidentRating: number;
  rating_month_counter: number;
  last_rating_threshold: number;
}

export interface PresidentRatingInput {
  currentRating: number;
  ratingMonthCounter: number;
  lastRatingThreshold: number;
  monthsPassed: number;
  currentKepuasan: number;
  keterbukaanScore?: number;
  serviceDeficitPressure?: number;
  lowSectorCount?: number;
  additionalDecay?: number;
  currentCompletedBoost?: number; // Bonus dari event yang selesai
  hasUnhandledPopulationCrisis?: boolean; // Krisis wabah/pandemi/bencana yang belum teratasi setelah 1 bulan
  countryDetail?: Record<string, unknown> | null;
  lastDate?: string;
  currentDate: string;
}

export interface PresidentRatingOutput extends PresidentRatingState {
  nextRating: number;
  ratingDecreaseThisTick: number;
}

/**
 * Hitung peringkat presiden untuk simulasi tick ini menggunakan fractional decay system
 * 
 * Flow:
 * 1. Hitung bulan yang berlalu
 * 2. Tentukan multiplier decay dari kepuasan saat ini
 * 3. Apply Kementerian Kebudayaan bonus ke multiplier
 * 4. Scale counter jika multiplier tier berubah
 * 5. Akumulasikan fractional decay
 * 6. Hitung penurunan rating (floor dari counter)
 * 7. Apply boost dari event dan sector penalties
 * 8. Return peringkat baru dan state counter
 * 
 * FRACTIONAL DECAY: Counter dapat berupa nilai desimal (misal 0.5)
 * Rating berkurang hanya ketika floor(counter) berubah
 * 
 * CONTOH DECAY MULTIPLIER:
 * - Kepuasan 20 (KRITIS): multiplier 0.1 → 10 bulan untuk turun 1 poin
 * - Kepuasan 35 (BURUK): multiplier 0.3 → 3-4 bulan untuk turun 1 poin
 * - Kepuasan 50 (SEDANG): multiplier 0.6 → 1-2 bulan untuk turun 1 poin
 * - Kepuasan 75 (BAIK): multiplier 0.85 → 1 bulan untuk turun ~0.85 poin
 * - Kepuasan 90 (SANGAT BAIK): multiplier 1.0 → 1 bulan untuk turun 1 poin
 */
export function calculatePresidentRating(input: PresidentRatingInput): PresidentRatingOutput {
  const {
    currentRating,
    ratingMonthCounter,
    lastRatingThreshold,
    monthsPassed,
    currentKepuasan,
    keterbukaanScore,
    serviceDeficitPressure = 0,
    lowSectorCount = 0,
    additionalDecay = 0,
    currentCompletedBoost = 0,
    lastDate,
    currentDate,
  } = input;

  // Step 1: Determine previous multiplier from saved threshold field
  // For old saves, this might be a threshold in months (1-12); for new saves, it's a multiplier (0-1)
  // We use the actual value for now; counter scaling will work regardless
  const prevMultiplier = lastRatingThreshold && lastRatingThreshold > 0 ? lastRatingThreshold : 1.0;

  // Step 2: Hitung decay multiplier berdasarkan kepuasan saat ini
  const baseMultiplier = getDecayMultiplierFromSatisfaction(
    currentKepuasan,
    keterbukaanScore,
    serviceDeficitPressure,
    lowSectorCount,
  );

  // Step 3: Apply Kementerian Kebudayaan bonus ke multiplier
  let newMultiplier = applyKementerianKebudayaanDecayMultiplierBonus(
    baseMultiplier,
    input.countryDetail
  );

  // Jika ada krisis bencana alam/pandemi/epidemi yang tidak diatasi setelah 1 bulan pertama,
  // percepat penurunan peringkat: force multiplier ke 1.0 (normal decay rate)
  if (input.hasUnhandledPopulationCrisis) {
    newMultiplier = 1.0;
  }

  // DEBUG: Log decay multiplier examples for monitoring smooth progression
  // console.log(`[Decay] kepuasan=${currentKepuasan}, baseMultiplier=${baseMultiplier.toFixed(2)}, newMultiplier=${newMultiplier.toFixed(2)}, months=${monthsPassed}, counter_was=${ratingMonthCounter.toFixed(2)}`);
  // Examples of smooth 0.1-1.0 progression:
  // - kepuasan 20 (critical) → multiplier 0.1 → 10 months for -1 rating
  // - kepuasan 35 (poor) → multiplier 0.3 → 3.3 months for -1 rating
  // - kepuasan 50 (medium) → multiplier 0.6 → 1.67 months for -1 rating
  // - kepuasan 75 (good) → multiplier 0.85 → 1.18 months for -1 rating
  // - kepuasan 90 (excellent) → multiplier 1.0 → 1 month for -1 rating

  // Step 4: Scale counter jika multiplier tier berubah (untuk smooth transition)
  // This preserves player perception: if counter was at 50% through previous tier,
  // keep it at ~50% through new tier
  let newRatingMonthCounter = ratingMonthCounter;
  if (prevMultiplier > 0 && prevMultiplier !== newMultiplier) {
    newRatingMonthCounter = scaleRatingCounterOnMultiplierChange(
      ratingMonthCounter,
      prevMultiplier,
      newMultiplier
    );
  }

  // Step 5: Akumulasikan fractional decay dari bulan yang berlalu
  // Contoh: 1 bulan dengan multiplier 0.1 = 0.1 counter akumulasi
  // Dengan multiplier 0.6, 10 bulan = 6 counter akumulasi = 6 poin decay
  // PENTING: Gunakan newRatingMonthCounter yang sudah discale, bukan ratingMonthCounter asli
  if (monthsPassed > 0) {
    newRatingMonthCounter = newRatingMonthCounter + (monthsPassed * newMultiplier);
  }

  // Step 6: Hitung penurunan rating (floor dari counter)
  const ratingDecrease = Math.floor(newRatingMonthCounter);
  const finalCounter = newRatingMonthCounter - ratingDecrease;

  // Step 7: Apply boost dari event dan hitung rating baru
  const ratingAfterBoost = Math.min(100, currentRating + currentCompletedBoost);
  const totalDecrease = ratingDecrease + Math.max(0, additionalDecay);
  const nextRating = Math.max(0, ratingAfterBoost - totalDecrease);

  return {
    presidentRating: nextRating,
    rating_month_counter: finalCounter,
    last_rating_threshold: newMultiplier, // Store multiplier instead of threshold
    nextRating,
    ratingDecreaseThisTick: totalDecrease,
  };
}

// ─── Utility: Get rating color untuk UI ──────────────────────────────────

export function getPresidentRatingColor(rating: number): string {
  if (rating >= 80) return 'text-green-700 font-black';
  if (rating >= 60) return 'text-green-600';
  if (rating >= 40) return 'text-yellow-600';
  if (rating >= 20) return 'text-red-600';
  return 'text-red-700 font-black';
}

// ─── Utility: Cek apakah warning modal harus ditampilkan ─────────────────

export function shouldShowRatingWarning(rating: number): boolean {
  return rating <= 10;
}

// ─── Utility: Format rating untuk display ───────────────────────────────

export function formatPresidentRating(rating: number): string {
  return `${Math.max(0, Math.min(100, Math.round(rating)))}/100`;
}

// ─── Utility: Get rating status text ─────────────────────────────────────

export function getPresidentRatingStatus(rating: number): string {
  if (rating >= 80) return 'Sangat Populer';
  if (rating >= 60) return 'Populer';
  if (rating >= 40) return 'Netral';
  if (rating >= 20) return 'Tidak Populer';
  if (rating > 0) return 'Sangat Tidak Populer';
  return 'Destitusi (Pengasingan)';
}
