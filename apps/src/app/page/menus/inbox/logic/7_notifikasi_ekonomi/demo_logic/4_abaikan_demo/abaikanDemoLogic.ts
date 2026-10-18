import { DemonstrasiNotification } from '../demonstrasiEkonomiLogic';

export interface AbaikanDemoResult {
  success: boolean;
  message: string;
  updatedNotification: DemonstrasiNotification;
}

export const ABAIKAN_DAILY_KEPUASAN_DECAY = 1; // -1 per hari per demo yang diabaikan
export const ABAIKAN_DAILY_RATING_DECAY = 1;   // -1 per hari per demo yang diabaikan

/**
 * Logika Mengabaikan Demo:
 * - Tidak ada biaya (0 NEO)
 * - Status berubah menjadi "DIABAIKAN"
 * - Notifikasi tetap ada di Inbox
 */
export function executeAbaikanDemo(
  notification: DemonstrasiNotification
): AbaikanDemoResult {
  const updatedNotification: DemonstrasiNotification = {
    ...notification,
    demo_status: 'ignored',
  };

  return {
    success: true,
    message: `Pemerintah memilih untuk tidak merespons unjuk rasa ini. Status unjuk rasa kini ditandai "DIABAIKAN". Aksi protes tetap berlanjut di ruang publik.`,
    updatedNotification,
  };
}

/**
 * Logika Efek Harian untuk Demo yang Diabaikan:
 * - Kepuasan Rakyat turun -1 per hari per notifikasi demo yang berstatus 'ignored' atau 'aktif'
 * - Peringkat Presiden turun -1 per hari per notifikasi demo yang diabaikan
 * - Jika Peringkat Presiden mencapai 0 (<= 1), game over kudeta akan terpicu oleh sistem simulasi.
 */
export function calculateDailyIgnoredDemoPenalties(
  ignoredDemoCount: number
): {
  dailyKepuasanPenalty: number;
  dailyRatingPenalty: number;
} {
  return {
    dailyKepuasanPenalty: ignoredDemoCount * ABAIKAN_DAILY_KEPUASAN_DECAY,
    dailyRatingPenalty: ignoredDemoCount * ABAIKAN_DAILY_RATING_DECAY,
  };
}
