import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export type SpionaseLevel = 'ringan' | 'sedang' | 'berat';

export interface SpionaseNotification extends NotificationMessage {
  tradeType: 'spionase';
  partnerCountry: string;
  level: SpionaseLevel;
  costEM?: number;
  effectText?: string;
  isHandled?: boolean;
}

const SPIONASE_POOL = [
  {
    level: 'ringan' as SpionaseLevel,
    title: '🕵️ Spionase Ringan: Penyusupan Perbatasan',
    message: (partner: string) => `Lapor Komandan! Agen intelijen asing asal ${partner} terdeteksi mencoba melintasi pos perbatasan tanpa izin resmi. Penjaga batas berhasil memblokir pergerakan awal mereka.`,
    costEM: 50,
    effectText: '+5% Approval Rakyat (jika ditangkap)'
  },
  {
    level: 'sedang' as SpionaseLevel,
    title: '⚠️ Spionase Sedang: Infiltrasi Pangkalan Militer',
    message: (partner: string) => `Peringatan Keamanan! Agen spionase ${partner} menyusup ke instalasi militer wilayah timur. Beberapa dokumen rahasia efektivitas persenjataan berisiko bocor!`,
    costEM: 100,
    effectText: '-5% Efektivitas Militer (7 hari jika dibiarkan)'
  },
  {
    level: 'berat' as SpionaseLevel,
    title: '🚨 Spionase Berat: Jaringan Mata-Mata Besar',
    message: (partner: string) => `DARURAT INTELIJEN! Jaringan mata-mata tingkat tinggi dari ${partner} membocorkan data strategis riset nasional dan posisi armada armada militer kita!`,
    costEM: 150,
    effectText: '-15% Efektivitas Militer (14 hari) + Bocor 1 Riset'
  }
];

export function generateSpionaseNotification(
  partnerCountry: string,
  dateStr: string
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
    tradeType: 'spionase',
    partnerCountry,
    level: item.level,
    costEM: item.costEM,
    effectText: item.effectText,
    isHandled: false
  };
}
