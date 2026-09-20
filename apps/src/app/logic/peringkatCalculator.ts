/**
 * peringkatCalculator.ts
 * Utility untuk menghitung dan memanajemen penurunan peringkat presiden berdasarkan kepuasan
 * 
 * Logika:
 * - Peringkat turun secara otomatis seiring waktu (bulan yang berlalu)
 * - Kecepatan penurunan bergantung pada level kepuasan saat ini
 * - Threshold (target bulan sebelum rating -1) ditentukan dari kepuasan
 * - Counter di-scale jika tier kepuasan berubah untuk smooth transition
 * - Event dapat memberikan boost rating ke pemain
 */

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

// ─── Tentukan threshold (bulan target) berdasarkan level kepuasan ─────────

/**
 * Menentukan threshold bulan sebelum rating berkurang 1 poin
 * Semakin buruk kepuasan, semakin cepat rating turun
 */
export function getThresholdFromSatisfaction(kepuasan: number, keterbukaanScore?: number): number {
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

  return baseThreshold;
}

// ─── Scale counter jika tier threshold berubah ────────────────────────────

/**
 * Skala ratingMonthCounter ketika threshold berubah
 * Memastikan progress bar tetap smooth tanpa lonjakan
 * 
 * Contoh: Jika counter = 6 bulan dengan threshold 9, dan threshold berubah jadi 6,
 * maka counter di-scale menjadi (6/9)*6 = 4 bulan agar persentase tetap sama
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
  currentCompletedBoost?: number; // Bonus dari event yang selesai
  lastDate?: string;
  currentDate: string;
}

export interface PresidentRatingOutput extends PresidentRatingState {
  nextRating: number;
  ratingDecreaseThisTick: number;
}

/**
 * Hitung peringkat presiden untuk simulasi tick ini
 * 
 * Flow:
 * 1. Hitung bulan yang berlalu
 * 2. Tambahkan ke counter
 * 3. Tentukan threshold dari kepuasan saat ini
 * 4. Scale counter jika threshold berubah
 * 5. Hitung penurunan rating
 * 6. Apply boost dari event
 * 7. Return peringkat baru dan state counter
 */
export function calculatePresidentRating(input: PresidentRatingInput): PresidentRatingOutput {
  const {
    currentRating,
    ratingMonthCounter,
    lastRatingThreshold,
    monthsPassed,
    currentKepuasan,
    keterbukaanScore,
    currentCompletedBoost = 0,
    lastDate,
    currentDate,
  } = input;

  // Step 1: Hitung bulan yang berlalu
  let newRatingMonthCounter = ratingMonthCounter;
  if (monthsPassed > 0) {
    newRatingMonthCounter += monthsPassed;
  }

  // Step 2: Tentukan threshold berdasarkan kepuasan & keterbukaan saat ini
  const newThreshold = getThresholdFromSatisfaction(currentKepuasan, keterbukaanScore);

  // Step 3: Scale counter jika tier kepuasan berubah
  const prevThreshold = lastRatingThreshold || newThreshold;
  if (prevThreshold !== newThreshold && prevThreshold > 0) {
    newRatingMonthCounter = scaleRatingCounterOnThresholdChange(
      newRatingMonthCounter,
      prevThreshold,
      newThreshold
    );
  }

  // Step 4: Hitung penurunan rating
  const { ratingDecrease, newRatingMonthCounter: finalCounter } =
    calculateRatingDecrease(newRatingMonthCounter, newThreshold);

  // Step 5: Apply boost dari event dan hitung rating baru
  const ratingAfterBoost = Math.min(100, currentRating + currentCompletedBoost);
  const nextRating = Math.max(0, ratingAfterBoost - ratingDecrease);

  return {
    presidentRating: nextRating,
    rating_month_counter: finalCounter,
    last_rating_threshold: newThreshold,
    nextRating,
    ratingDecreaseThisTick: ratingDecrease,
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
