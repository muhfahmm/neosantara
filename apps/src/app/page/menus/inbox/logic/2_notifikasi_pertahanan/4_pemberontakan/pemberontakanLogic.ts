import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface PemberontakanNotification extends NotificationMessage {
  tradeType: 'pemberontakan';
  provinceName: string;
  rebelGroup: string;
  costEM?: number;
  effectText?: string;
  isHandled?: boolean;
}

export function generatePemberontakanNotification(
  provinceName: string,
  dateStr: string
): PemberontakanNotification {
  return {
    id: `pemberontakan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `🔥 Pemberontakan Bersenjata: Provinsi ${provinceName}`,
    sender: `Gubernur & Pangdam Provinsi ${provinceName}`,
    message: `Lapor Presiden! Terjadi gelombang demonstrasi radikal dan gerakan separatis bersenjata di wilayah provinsi ${provinceName}. Milisi lokal menuntut deklarasi kemerdekaan penuh dari kedaulatan negara!`,
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'pemberontakan',
    provinceName,
    rebelGroup: `Gerakan Kemerdekaan ${provinceName}`,
    costEM: 250,
    effectText: 'Risiko Deklarasi Kemerdekaan & Kehilangan Provinsi',
    isHandled: false
  };
}
