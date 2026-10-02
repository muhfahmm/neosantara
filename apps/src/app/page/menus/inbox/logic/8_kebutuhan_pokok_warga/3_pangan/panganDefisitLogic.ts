import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface PanganDefisitNotification extends NotificationMessage {
  tradeType: 'defisit_pangan';
  deficitCount: number;
  totalSectors: number;
  deficitCommodityNames: string[];
}

export function generatePanganDefisitNotification(
  deficitCount: number,
  totalSectors: number,
  deficitCommodityNames: string[],
  dateStr: string
): PanganDefisitNotification {
  const sampleNames = deficitCommodityNames.slice(0, 4).join(', ');
  const extraText = deficitCommodityNames.length > 4 ? ` dan ${deficitCommodityNames.length - 4} komoditas lainnya` : '';

  return {
    id: `pangan-defisit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: `🌾 KRISIS PANGAN NASIONAL: ${deficitCount} Komoditas Mengalami Defisit!`,
    sender: `Kementerian Pertanian & Badan Pangan Nasional`,
    message: `Sebanyak ${deficitCount} komoditas pangan nasional (termasuk ${sampleNames}${extraText}) saat ini dalam kondisi defisit produksi dibanding tingkat konsumsi warga. Defisit di 6 sektor atau lebih menandakan ancaman krisis pangan serius. Segera tingkatkan produksi agrikultur, peternakan, perikanan, atau olahan pangan nasional!`,
    timestamp: dateStr,
    type: 'kepuasan',
    value: deficitCount,
    isRead: false,
    tradeType: 'defisit_pangan',
    deficitCount,
    totalSectors,
    deficitCommodityNames,
  };
}
