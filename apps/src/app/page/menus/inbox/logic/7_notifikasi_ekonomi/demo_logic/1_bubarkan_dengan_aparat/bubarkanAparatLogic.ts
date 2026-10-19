import { DemonstrasiNotification } from '../demonstrasiEkonomiLogic';
import { terbitkanBeritaAI } from '@/app/logic/npc_ai_brain/core/aiNewsBridge';
import { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export const APARAT_OPERATION_COST = 5000000; // 5.000.000 NEO

export interface AparatOperationResult {
  success: boolean;
  cost: number;
  isRiot: boolean; // True jika gagal / berubah menjadi kerusuhan massal
  casualties: number; // Jumlah korban jiwa
  kepuasanPenalty: number; // -15 (sukses) atau -25 (kerusuhan)
  ratingPenalty: number; // -10 (sukses) atau -15 (kerusuhan)
  resultModal: {
    title: string;
    message: string;
    type: 'success' | 'error';
  };
  hasHamCondemnation: boolean; // Jika terkena kecaman HAM
  updatedNotification: DemonstrasiNotification;
  extraNotifications: NotificationMessage[];
  affectedCountries: string[]; // Negara HAM yang hubungannya turun -20
}

/**
 * Logika Eksekusi Operasi Aparat (Hard Power):
 * 1. Biaya: 5.000.000 NEO.
 * 2. Cek Tingkat Keamanan: Jika tingkat_keamanan < 50, ada peluang 50% memicu kerusuhan (gagal).
 * 3. Kalkulasi Korban Jiwa: Skala 5 s/d 500 jiwa dipengaruhi populasi & severity.
 * 4. Pengurangan Statistik:
 *    - Berhasil: Kepuasan -15, Peringkat Presiden -10, status 'selesai' ("DITANGANI (APARAT)").
 *    - Kerusuhan: Kepuasan -25, Peringkat Presiden -15, status 'kerusuhan' ("KERUSUHAN"), notifikasi infrastruktur rusak.
 * 5. Berita Menu News: "Pemerintah Kerahkan Aparat, Demonstrasi Berakhir Ricuh"
 * 6. Kecaman HAM: Roll 15% atau jika korban jiwa > 0, PBB mengecam pelanggaran HAM & hubungan dengan 3-5 negara turun -20 poin.
 */
export function executeAparatOperation({
  notification,
  currentBudget,
  tingkatKeamanan = 50,
  populasi = 50000000,
  currentDateStr = new Date().toISOString().slice(0, 10),
  playerCountry = 'Indonesia',
}: {
  notification: DemonstrasiNotification;
  currentBudget: number;
  tingkatKeamanan?: number;
  populasi?: number;
  currentDateStr?: string;
  playerCountry?: string;
}): {
  canProceed: boolean;
  errorMessage?: string;
  result?: AparatOperationResult;
} {
  if (currentBudget < APARAT_OPERATION_COST) {
    return {
      canProceed: false,
      errorMessage: `Anggaran kas negara tidak mencukupi untuk pengerahan operasi aparat gabungan (${currentBudget.toLocaleString('id-ID')} NEO dari ${APARAT_OPERATION_COST.toLocaleString('id-ID')} NEO yang dibutuhkan).`,
    };
  }

  // 1. Roll peluang kerusuhan (jika tingkat keamanan < 50, peluang 50% kerusuhan)
  const isSecurityLow = tingkatKeamanan < 50;
  const isRiot = isSecurityLow ? Math.random() < 0.5 : Math.random() < 0.08;

  // 2. Hitung Korban Jiwa (skala 5 s/d 500 jiwa dipengaruhi populasi & severity)
  const severityMultiplier = notification.severity === 'ekstrem' ? 1.8 : 1.0;
  const populationScale = Math.min(3.0, Math.max(0.5, Math.log10(Math.max(100000, populasi)) / 7.5));
  const baseCasualties = Math.floor(Math.random() * (isRiot ? 350 : 120)) + (isRiot ? 25 : 5);
  const casualties = Math.min(500, Math.max(5, Math.round(baseCasualties * severityMultiplier * populationScale)));

  // 3. Status dan Penalti
  const kepuasanPenalty = isRiot ? 25 : 15;
  const ratingPenalty = isRiot ? 15 : 10;
  const nextStatus = isRiot ? 'kerusuhan' : 'selesai';

  // Update teks kartu notifikasi asli di bawahnya
  const decisionText = isRiot
    ? `\n\n[KEPUTUSAN PEMERINTAH]: Pasukan aparat diterjunkan namun kewalahan menghadapi eskalasi massa. Terjadi bentrokan berdarah yang memakan ${casualties} korban jiwa. Aksi protes berubah menjadi kerusuhan brutal yang melumpuhkan fasilitas umum.`
    : `\n\n[KEPUTUSAN PEMERINTAH]: Aparat keamanan telah dikerahkan ke jalanan. Massa berhasil dipukul mundur dan dibubarkan. Namun, otoritas mencatat ${casualties} korban jiwa/luka parah dan citra pemerintahan Anda kini dipandang otoriter oleh publik.`;

  const updatedNotification: DemonstrasiNotification = {
    ...notification,
    demo_status: nextStatus,
    message: `${notification.message}${decisionText}`,
  };

  const extraNotifications: NotificationMessage[] = [];

  // Jika Kerusuhan: Munculkan Notifikasi Kerusakan Infrastruktur di Inbox
  if (isRiot) {
    extraNotifications.push({
      id: `infrastruktur-rusak-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '⚠️ PERINGATAN: Infrastruktur Negara Rusak Akibat Kerusuhan',
      sender: 'Kementerian Pekerjaan Umum & Keamanan Nasional',
      message: `Kerusuhan massal meluas di berbagai distrik vital menyusul pembubaran unjuk rasa oleh aparat. Fasilitas transportasi publik, gedung administrasi, dan sentra komersial mengalami kerusakan berat akibat pembakaran massa anarkis. Segera lakukan renovasi fasilitas umum!`,
      timestamp: currentDateStr,
      type: 'kesejahteraan',
      value: 0,
      isRead: false,
    });
  }

  // 4. Publikasikan Berita di Menu News
  terbitkanBeritaAI({
    id: `news-aparat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'update_geopolitik',
    category: 'operasi_militer',
    headline: isRiot
      ? `Kerusuhan Massal Meletus di ${playerCountry}: Aparat Gagal Redam Unjuk Rasa!`
      : `Pemerintah Kerahkan Aparat, Demonstrasi di ${playerCountry} Berakhir Ricuh`,
    content: isRiot
      ? `Pengerahan aparat keamanan di ${playerCountry} gagal menghentikan unjuk rasa dan justru memicu eskalasi kerusuhan brutal. Sedikitnya ${casualties} korban jiwa dilaporkan sementara fasilitas publik dibakar massa.`
      : `Pemerintah ${playerCountry} mengerahkan aparat kepolisian dan militer bersenjata lengkap membubarkan paksa massa unjuk rasa. Operasi dilaporkan menelan ${casualties} korban jiwa dan memicu perdebatan sengit terkait kebebasan berpendapat.`,
    timestamp: currentDateStr,
    dateStr: currentDateStr,
    countryName: playerCountry,
  });

  // 5. Roll Risiko Kecaman Internasional (HAM)
  // Peluang 100% jika korban jiwa > 0 atau minimal 15% roll
  const hamRoll = Math.random() < 0.85 || casualties > 0;
  const affectedCountries: string[] = [];

  if (hamRoll) {
    // 3 - 5 negara HAM yang hubungannya turun -20 poin
    const PRO_HUMAN_RIGHTS_COUNTRIES = [
      'Amerika Serikat',
      'Inggris',
      'Jerman',
      'Prancis',
      'Kanada',
      'Australia',
      'Belanda',
      'Swedia',
    ];
    // Ambil 3-5 negara secara acak selain negara pemain
    const candidates = PRO_HUMAN_RIGHTS_COUNTRIES.filter(c => c.toLowerCase() !== playerCountry.toLowerCase());
    const count = Math.floor(Math.random() * 3) + 3; // 3 - 5 negara
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    affectedCountries.push(...shuffled.slice(0, count));

    extraNotifications.push({
      id: `pbb-ham-condemn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '🌐 KECAMAN INTERNASIONAL: PELANGGARAN HAM',
      sender: 'Perserikatan Bangsa-Bangsa (PBB)',
      message: `Dewan HAM Perserikatan Bangsa-Bangsa (PBB) mengutuk keras tindakan represif aparat pemerintah ${playerCountry} yang menelan ${casualties} korban jiwa warga sipil. Hubungan bilateral dengan negara-negara mitra (${affectedCountries.join(', ')}) anjlok -20 poin, serta memicu eskalasi usulan Resolusi Sanksi Internasional!`,
      timestamp: currentDateStr,
      type: 'peringkat',
      value: 0,
      isRead: false,
    });
  }

  // 6. Buat ResultModal response
  const resultModal = isRiot
    ? {
        title: '🔥 OPERASI GAGAL: KERUSUHAN MASSAL!',
        message: `Aparat kewalahan! Tindakan represif memicu kemarahan yang lebih besar. Massa mulai membakar fasilitas umum dan bentrok dengan polisi (${casualties} korban jiwa tercatat). Kepuasan Rakyat anjlok -25 poin dan Peringkat Presiden turun -15 poin!`,
        type: 'error' as const,
      }
    : {
        title: '🚨 Operasi Pembubaran Aparat Selesai',
        message: `Pasukan gabungan berhasil membubarkan konsentrasi demonstran. Namun penertiban represif ini memakan ${casualties} korban jiwa. Kepuasan Rakyat turun -15 poin dan Peringkat Presiden terpotong -10 poin.`,
        type: 'error' as const,
      };

  return {
    canProceed: true,
    result: {
      success: true,
      cost: APARAT_OPERATION_COST,
      isRiot,
      casualties,
      kepuasanPenalty,
      ratingPenalty,
      resultModal,
      hasHamCondemnation: hamRoll,
      updatedNotification,
      extraNotifications,
      affectedCountries,
    },
  };
}
