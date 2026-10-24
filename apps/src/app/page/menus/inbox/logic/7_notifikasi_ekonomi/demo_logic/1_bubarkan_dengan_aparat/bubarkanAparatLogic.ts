import { DemonstrasiNotification } from '../demonstrasiEkonomiLogic';
import { terbitkanBeritaAI } from '@/app/logic/npc_ai_brain/core/aiNewsBridge';
import { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { DetailOpsiBubarkan, OPSI_BUBARKAN_MASSA } from './opsiBubarkanMassaConfig';

export const APARAT_OPERATION_COST = 5000000; // Default fallback 5.000.000 NEO

export interface AparatOperationResult {
  success: boolean;
  cost: number;
  isRiot: boolean; // True jika gagal / berubah menjadi kerusuhan massal
  casualties: number; // Jumlah korban jiwa
  kepuasanPenalty: number; // Kepuasan berkurang
  ratingPenalty: number; // Peringkat presiden berkurang
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
 * Mendukung 5 Opsi Pembubaran Massa:
 * 1. Water Cannon (1.000.000 NEO, 40% efektif, 0 korban)
 * 2. Gas Air Mata (2.500.000 NEO, 70% efektif, 5-20 korban)
 * 3. Brimob (5.000.000 NEO, 85% efektif, 50-200 korban)
 * 4. Militer (10.000.000 NEO, 95% efektif, 300-1000 korban)
 * 5. Jam Malam & Blokade (3.000.000 NEO, 75% efektif, 0 korban)
 */
export function executeAparatOperation({
  notification,
  currentBudget,
  tingkatKeamanan = 50,
  populasi = 50000000,
  currentDateStr = new Date().toISOString().slice(0, 10),
  playerCountry = 'Indonesia',
  selectedOption,
}: {
  notification: DemonstrasiNotification;
  currentBudget: number;
  tingkatKeamanan?: number;
  populasi?: number;
  currentDateStr?: string;
  playerCountry?: string;
  selectedOption?: DetailOpsiBubarkan;
}): {
  canProceed: boolean;
  errorMessage?: string;
  result?: AparatOperationResult;
} {
  const option = selectedOption || OPSI_BUBARKAN_MASSA[2]; // Fallback Brimob
  const operationalCost = option.cost;

  if (currentBudget < operationalCost) {
    return {
      canProceed: false,
      errorMessage: `Anggaran kas negara tidak mencukupi untuk operasi ${option.title} (${currentBudget.toLocaleString('id-ID')} NEO dari ${operationalCost.toLocaleString('id-ID')} NEO yang dibutuhkan).`,
    };
  }

  // 1. Roll peluang berhasil berdasarkan efektivitas opsi
  const roll = Math.random() * 100;
  // Jika tingkat keamanan sangat rendah (<40), kurangi peluang sebesar 15%
  const securityPenalty = tingkatKeamanan < 40 ? 15 : 0;
  const effectiveChance = Math.max(10, option.effectivenessPercent - securityPenalty);
  const isSuccess = roll <= effectiveChance;
  const isRiot = !isSuccess;

  // 2. Hitung Korban Jiwa berdasarkan range opsi
  const [minCas, maxCas] = option.casualtiesRange;
  let casualties = 0;
  if (maxCas > 0) {
    const rawCas = Math.floor(Math.random() * (maxCas - minCas + 1)) + minCas;
    // Jika gagal / ricuh, korban bertambah 25%
    casualties = isRiot ? Math.round(rawCas * 1.25) : rawCas;
  }

  // 3. Logika Penurunan / Pertambahan Massa Demonstran
  // - Water Cannon: Mengurangi 30% massa (tersisa 70%)
  // - Gas Air Mata: Mengurangi 60% massa (tersisa 40%)
  // - Aparat Antirusuh / Brimob: Mengurangi 90% massa (tersisa 10%)
  // - Militer: Mengurangi 95% s/d 100% massa (tersisa 0%)
  // - Jam Malam: Mengurangi 80% massa (tersisa 20%)
  // - Jika GAGAL (Riot): Jumlah massa justru bertambah +20% karena simpati publik
  const currentMassa = Number(notification.demonstratorCount || 50000);
  let remainingMassa = currentMassa;

  if (isRiot) {
    // Massa bertambah 20%
    remainingMassa = Math.round(currentMassa * 1.2);
  } else {
    if (option.id === 'water_cannon') {
      remainingMassa = Math.round(currentMassa * 0.7); // Mengurangi 30%
    } else if (option.id === 'gas_air_mata') {
      remainingMassa = Math.round(currentMassa * 0.4); // Mengurangi 60%
    } else if (option.id === 'brimob') {
      remainingMassa = Math.round(currentMassa * 0.1); // Mengurangi 90%
    } else if (option.id === 'militer') {
      remainingMassa = 0; // Mengurangi 100%
    } else if (option.id === 'jam_malam') {
      remainingMassa = Math.round(currentMassa * 0.2); // Mengurangi 80%
    } else {
      remainingMassa = 0;
    }
  }

  // 4. Status dan Penalti
  // Jika gagal, kepuasan & rating berkurang lebih banyak
  const kepuasanPenalty = isRiot ? option.kepuasanPenalty + 10 : option.kepuasanPenalty;
  const ratingPenalty = isRiot ? option.ratingPenalty + 5 : option.ratingPenalty;
  const nextStatus = isRiot ? 'kerusuhan' : (remainingMassa > 0 && option.id === 'water_cannon' ? 'aktif' : 'selesai');

  // Update teks kartu notifikasi asli di bawahnya
  let decisionText = '';
  if (isRiot) {
    if (option.id === 'water_cannon') {
      decisionText = `\n\n[KEPUTUSAN PEMERINTAH]: Water cannon disemprotkan namun demonstran melawan balik dengan barikade dan lemparan batu. Operasi gagal, simpati publik meluas dan massa membengkak (+20%) menjadi ${remainingMassa.toLocaleString('id-ID')} demonstran!`;
    } else {
      decisionText = `\n\n[KEPUTUSAN PEMERINTAH]: Operasi ${option.title} dilancarkan namun situasi di lapangan memburuk menjadi bentrokan berdarah. Tercatat ${casualties} korban jiwa, simpati publik memicu massa membengkak (+20%) menjadi ${remainingMassa.toLocaleString('id-ID')} demonstran!`;
    }
  } else {
    if (option.id === 'water_cannon') {
      decisionText = `\n\n[KEPUTUSAN PEMERINTAH]: Armada Water Cannon menyemprotkan air bertekanan tinggi. Massa berkurang 30% menyisakan ${remainingMassa.toLocaleString('id-ID')} demonstran yang masih bertahan di jalan.`;
    } else if (option.id === 'gas_air_mata') {
      decisionText = `\n\n[KEPUTUSAN PEMERINTAH]: Gas Air Mata ditembakkan mengurai kerumunan. Massa berkurang 60% menyisakan ${remainingMassa.toLocaleString('id-ID')} demonstran (${casualties} korban luka).`;
    } else if (option.id === 'jam_malam') {
      decisionText = `\n\n[KEPUTUSAN PEMERINTAH]: Pemerintah memberlakukan Jam Malam & Pemadaman Internet. Konsentrasi massa lumpuh berkurang 80% menyisakan ${remainingMassa.toLocaleString('id-ID')} demonstran.`;
    } else {
      decisionText = `\n\n[KEPUTUSAN PEMERINTAH]: Operasi ${option.title} dikerahkan dengan tegas. Massa demonstrasi berhasil dipukul mundur total (${casualties} korban jiwa/terluka).`;
    }
  }

  const updatedNotification: DemonstrasiNotification = {
    ...notification,
    demo_status: nextStatus,
    demonstratorCount: remainingMassa,
    message: `${notification.message}${decisionText}`,
  };

  const extraNotifications: NotificationMessage[] = [];

  // Jika Kerusuhan: Munculkan Notifikasi Kerusakan Infrastruktur di Inbox
  if (isRiot) {
    extraNotifications.push({
      id: `infrastruktur-rusak-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '⚠️ PERINGATAN: Infrastruktur Rusak Akibat Kericuhan Unjuk Rasa',
      sender: 'Kementerian Pekerjaan Umum & Keamanan Nasional',
      message: `Upaya pembubaran massa dengan ${option.title} gagal meredam aksi dan memicu aksi anarkis massa. Berbagai fasilitas umum mengalami kerusakan. Segera pulihkan stabilitas nasional!`,
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
      ? `Operasi ${option.title} Gagal! Kericuhan Meluas di ${playerCountry}`
      : `Pemerintah ${playerCountry} Kerahkan ${option.title}, Unjuk Rasa Berhasil Dibubarkan`,
    content: isRiot
      ? `Pengerahan ${option.title} oleh otoritas keamanan ${playerCountry} gagal membendung amarah massa unjuk rasa. Situasi berubah menjadi bentrokan terbuka dengan laporan ${casualties} korban.`
      : `Pemerintah ${playerCountry} mengambil tindakan tegas membubarkan demonstrasi menggunakan ${option.title}. Konsentrasi massa berhasil diurai dengan ${casualties} korban luka/jiwa dilaporkan.`,
    timestamp: currentDateStr,
    dateStr: currentDateStr,
    countryName: playerCountry,
  });

  // 5. Roll Risiko Kecaman Internasional (HAM & PBB)
  const affectedCountries: string[] = [];
  const triggerUn = option.unNotificationRisk === 'high' || option.unNotificationRisk === 'sanctions' || (option.unNotificationRisk === 'low' && Math.random() < 0.5);

  if (triggerUn) {
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
    const candidates = PRO_HUMAN_RIGHTS_COUNTRIES.filter(c => c.toLowerCase() !== playerCountry.toLowerCase());
    const count = option.unNotificationRisk === 'sanctions' ? 6 : Math.floor(Math.random() * 3) + 3;
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    affectedCountries.push(...shuffled.slice(0, count));

    const isSanctionMeeting = option.unNotificationRisk === 'sanctions';

    extraNotifications.push({
      id: `pbb-ham-condemn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: isSanctionMeeting 
        ? '🚨 PBB GELAR SIDANG DARURAT: SANKSI EMBARGO EKONOMI' 
        : '🌐 KECAMAN INTERNASIONAL: PELANGGARAN HAM',
      sender: 'Dewan Keamanan & Dewan HAM PBB',
      message: isSanctionMeeting
        ? `Dewan Keamanan PBB menggelar Rapat Darurat mengecam keras penggunaan kekuatan militer bersenjata berat di ${playerCountry} yang menelan hingga ${casualties} korban jiwa. Usulan Resolusi Sanksi Embargo Ekonomi segera dimasukkan ke agenda pemungutan suara!`
        : `Dewan HAM Perserikatan Bangsa-Bangsa (PBB) mengecam represifitas pengerahan ${option.title} di ${playerCountry} (${casualties} korban tercatat). Hubungan bilateral dengan negara-negara penggiat HAM (${affectedCountries.join(', ')}) merosot tajam!`,
      timestamp: currentDateStr,
      type: 'peringkat',
      value: 0,
      isRead: false,
    });
  }

  // 6. Buat ResultModal response
  const resultModal = isRiot
    ? {
        title: '🔥 OPERASI GAGAL / RICUH!',
        message: option.id === 'water_cannon'
          ? `Water Cannon gagal memukul mundur demonstran! Massa mengejek aparat dan demonstrasi semakin membesar. Kepuasan -${kepuasanPenalty} poin dan Peringkat Presiden -${ratingPenalty} poin.`
          : `Aparat kewalahan! Pengerahan ${option.title} memicu bentrokan (${casualties} korban jiwa). Kepuasan -${kepuasanPenalty} poin dan Peringkat Presiden -${ratingPenalty} poin!`,
        type: 'error' as const,
      }
    : {
        title: '🚨 Operasi Pembubaran Selesai',
        message: `Massa unjuk rasa berhasil dibubarkan dengan ${option.title}. ${casualties > 0 ? `Tercatat ${casualties} korban jiwa/terluka.` : 'Tidak ada korban jiwa.'} Kepuasan Rakyat -${kepuasanPenalty} poin dan Peringkat Presiden -${ratingPenalty} poin.`,
        type: 'success' as const,
      };

  return {
    canProceed: true,
    result: {
      success: isSuccess,
      cost: operationalCost,
      isRiot,
      casualties,
      kepuasanPenalty,
      ratingPenalty,
      resultModal,
      hasHamCondemnation: triggerUn,
      updatedNotification,
      extraNotifications,
      affectedCountries,
    },
  };
}
