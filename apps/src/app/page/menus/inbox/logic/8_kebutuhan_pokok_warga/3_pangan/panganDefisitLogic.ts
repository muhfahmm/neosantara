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
    title: `⚠️ DEFISIT PANGAN: ${deficitCount} dari ${totalSectors} Kategori Perlu Perhatian`,
    sender: `Kementerian Pertanian & Badan Pangan Nasional`,
    message: `Coverage kebutuhan pangan untuk ${deficitCount} dari ${totalSectors} kategori inti berada di bawah target (termasuk ${sampleNames}${extraText}). Kategori yang digunakan adalah pangan pokok, protein hewani, protein nabati, sayur, serta olahan dan kebutuhan dasar. Tingkatkan produksi, impor, atau distribusi pada kategori yang tertinggal.`,
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
