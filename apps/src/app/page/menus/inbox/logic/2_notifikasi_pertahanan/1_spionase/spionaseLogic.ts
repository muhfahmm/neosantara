import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export type SpionaseLevel = 'ringan' | 'sedang' | 'berat';

export interface SpionaseNotification extends NotificationMessage {
  tradeType: 'spionase';
  partnerCountry: string;
  targetCountry?: string;
  level?: SpionaseLevel;
  costEM?: number;
  effectText?: string;
  isHandled?: boolean;
  remainingResponseDays?: number;
  // Properti untuk spionase ofensif pemain
  isOffensive?: boolean;
  operationResult?: 'success' | 'failed';
  operationTarget?: string;
}

const SPIONASE_POOL = [
  {
    level: 'ringan' as SpionaseLevel,
    title: '🕵️ Spionase Ringan: Penyusupan Perbatasan',
    message: (partner: string) => `Lapor Komandan! Agen intelijen asing asal ${partner} terdeteksi mencoba melintasi pos perbatasan tanpa izin resmi. Penjaga batas berhasil memblokir pergerakan awal mereka.`,
    costEM: 20000,
    effectText: '-5% Kekuatan & HP Militer (30-60 hari jika dibiarkan)'
  },
  {
    level: 'sedang' as SpionaseLevel,
    title: '⚠️ Spionase Sedang: Infiltrasi Pangkalan Militer',
    message: (partner: string) => `Peringatan Keamanan! Agen spionase ${partner} menyusup ke instalasi militer wilayah timur. Beberapa dokumen rahasia efektivitas persenjataan berisiko bocor!`,
    costEM: 10000,
    effectText: '-5% Kekuatan & HP Militer (30-60 hari jika dibiarkan)'
  },
  {
    level: 'berat' as SpionaseLevel,
    title: '🚨 Spionase Berat: Jaringan Mata-Mata Besar',
    message: (partner: string) => `DARURAT INTELIJEN! Jaringan mata-mata tingkat tinggi dari ${partner} membocorkan data strategis riset nasional dan posisi armada armada militer kita!`,
    costEM: 15000,
    effectText: '-5% Kekuatan & HP Militer (30-60 hari jika dibiarkan)'
  }
];

export function generateSpionaseNotification(
  partnerCountry: string,
  dateStr: string,
  targetCountry?: string,
): SpionaseNotification {
  const roll = Math.random();
  // 22% ringan, 12% sedang, 6% berat
  let item = SPIONASE_POOL[0];
  if (roll < 0.15) {
    item = SPIONASE_POOL[2]; // berat
  } else if (roll < 0.45) {
    item = SPIONASE_POOL[1]; // sedang
  }

  return {
    id: `spionase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: item.title,
    sender: `Badan Intelijen Negara (${partnerCountry})`,
    message: item.message(partnerCountry),
    timestamp: dateStr,
    type: 'peringkat',
    value: 0,
    isRead: false,
    priority: 'critical',
    tradeType: 'spionase',
    partnerCountry,
    ...(targetCountry ? { targetCountry } : {}),
    level: item.level,
    costEM: item.costEM,
    effectText: item.effectText,
    isHandled: false
  };
}

export function generatePlayerSpionaseResultNotification(
  targetCountry: string,
  succeeded: boolean,
  dateStr: string,
  operationTarget?: string,
): SpionaseNotification {
  const targetLabel = operationTarget || 'Informasi Intelijen Negara';
  const title = succeeded
    ? `🕵️ Misi Spionase Berhasil: ${targetCountry}`
    : `❌ Misi Spionase Gagal: ${targetCountry}`;

  const message = succeeded
    ? `Laporan Operasi Intelijen: Agen spionase kita telah berhasil menyusup dan mengekstraksi data strategis (${targetLabel}) dari target ${targetCountry}. Seluruh dokumen rahasia lawan berhasil dienkripsi dan dikirim ke markas pusat.`
    : `Laporan Darurat Intelijen: Misi spionase terhadap ${targetCountry} (${targetLabel}) mengalami kegagalan. Agen penyusup kita terdeteksi oleh jaringan kontra-intelijen lawan dan terpaksa melakukan evakuasi darurat.`;

  const effectText = succeeded
    ? `Data intelijen (${targetLabel}) negara ${targetCountry} berhasil diamankan.`
    : `Misi gagal. Agen gagal mendapatkan data ${targetLabel}.`;

  return {
    id: `player-spionase-result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    sender: 'Badan Intelijen Negara (Operasi Khusus)',
    message,
    timestamp: dateStr,
    type: 'peringkat',
    value: succeeded ? 100 : 0,
    isRead: false,
    priority: succeeded ? 'normal' : 'critical',
    tradeType: 'spionase',
    partnerCountry: targetCountry,
    targetCountry,
    level: 'ringan',
    isHandled: true,
    isOffensive: true,
    operationResult: succeeded ? 'success' : 'failed',
    operationTarget: targetLabel,
    effectText,
  };
}
