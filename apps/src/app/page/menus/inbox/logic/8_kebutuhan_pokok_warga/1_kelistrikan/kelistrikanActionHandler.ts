/**
 * kelistrikanActionHandler.ts
 * Sistem untuk menangani aksi saat notifikasi kelistrikan diklik/ditangani
 * Menurunkan rating saat notifikasi kelistrikan kurang ditangani
 */

export interface KelistrikanEventImpact {
  // Langsung menurunkan rating sebesar 1 poin per notifikasi
  ratingDecrease: number;
  // Mengurangi kepuasan publik tentang kelistrikan
  kepuasanListrikDecrease: number;
  // Dampak pada kepuasan umum
  generalSatisfactionDecrease: number;
  // Pesan yang ditampilkan
  impactMessage: string;
}

/**
 * Hitung dampak notifikasi kelistrikan kurang terhadap sistem kepuasan
 * Setiap notifikasi kelistrikan kurang menurunkan rating sebesar 1 poin
 */
export function calculateKelistrikanImpact(
  deficitMW: number,
  severity: 'ringan' | 'sedang' | 'berat' | 'kritis'
): KelistrikanEventImpact {
  let ratingDecrease = 1; // Default: semua notifikasi turun 1 poin

  // Semakin berat severity, semakin besar dampaknya
  if (severity === 'sedang') {
    ratingDecrease = 1;
  } else if (severity === 'berat') {
    ratingDecrease = 2;
  } else if (severity === 'kritis') {
    ratingDecrease = 3;
  }

  // Kepuasan listrik berkurang tergantung defisit
  const kepuasanListrikDecrease = Math.min(30, Math.ceil(deficitMW / 100));
  
  // Kepuasan umum berkurang lebih kecil
  const generalSatisfactionDecrease = Math.ceil(kepuasanListrikDecrease / 3);

  const impactMessage = `Krisis kelistrikan telah mengurangi peringkat Anda sebesar ${ratingDecrease} poin.`;

  return {
    ratingDecrease,
    kepuasanListrikDecrease,
    generalSatisfactionDecrease,
    impactMessage,
  };
}

/**
 * Hitung dampak total yang harus diterapkan ke country data
 * Fungsi ini dipanggil saat notifikasi kelistrikan ditangani/diterima
 */
export function applyKelistrikanNotificationImpact(
  countryData: Record<string, any>,
  deficitMW: number,
  severity: 'ringan' | 'sedang' | 'berat' | 'kritis'
): Record<string, any> {
  const impact = calculateKelistrikanImpact(deficitMW, severity);

  const updated = { ...countryData };

  // Terapkan penurunan rating langsung
  if (typeof updated.presidentRating === 'number') {
    updated.presidentRating = Math.max(0, updated.presidentRating - impact.ratingDecrease);
  } else if (typeof updated.rating_presiden === 'number') {
    updated.rating_presiden = Math.max(0, updated.rating_presiden - impact.ratingDecrease);
  } else if (typeof updated.peringkat === 'number') {
    updated.peringkat = Math.max(0, updated.peringkat - impact.ratingDecrease);
  }

  // Terapkan penurunan kepuasan umum
  if (typeof updated.kepuasan === 'number') {
    updated.kepuasan = Math.max(0, updated.kepuasan - impact.generalSatisfactionDecrease);
  } else if (typeof updated.kepuasan_publik === 'number') {
    updated.kepuasan_publik = Math.max(0, updated.kepuasan_publik - impact.generalSatisfactionDecrease);
  } else if (typeof updated.kepuasan_masyarakat === 'number') {
    updated.kepuasan_masyarakat = Math.max(0, updated.kepuasan_masyarakat - impact.generalSatisfactionDecrease);
  }

  return updated;
}