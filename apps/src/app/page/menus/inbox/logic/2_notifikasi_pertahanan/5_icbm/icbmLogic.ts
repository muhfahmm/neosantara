import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface ICBMNotification extends NotificationMessage {
  tradeType: 'icbm';
  launcherCountry: string;
  targetCity: string;
  costEM?: number;
  effectText?: string;
  isHandled?: boolean;
}

export function generateICBMNotification(
  launcherCountry: string,
  targetCity: string,
  dateStr: string
): ICBMNotification {
  return {
    id: `icbm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `☢️ DETEKSI PELUNCURAN RUDAL NUKLIR (ICBM)!`,
    sender: `Komando Pertahanan Udara & Antariksa Nasional`,
    message: `PERINGATAN DARURAT TINGKAT TERTINGGI! Radar pertahanan terdeteksi peluncuran Rudal Balistik Antar-Benua (ICBM) bertulu ledak hulu nuklir dari negara ${launcherCountry} mengarah langsung ke ${targetCity}! Waktu benturan diperkirakan dalam hitungan menit!`,
    timestamp: dateStr,
    type: 'peringkat',
    value: 0,
    isRead: false,
    tradeType: 'icbm',
    launcherCountry,
    targetCity,
    costEM: 500,
    effectText: 'Kehancuran Kota Total & Jutaan Korban jika Gagal Dicegat',
    isHandled: false
  };
}
