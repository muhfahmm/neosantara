import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface PajakChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_pajak';
  taxName: string;
  oldRate: number;
  newRate: number;
  isIncrease: boolean;
}

export function generatePajakChangeNotification(
  taxName: string,
  oldRate: number,
  newRate: number,
  dateStr: string
): PajakChangeNotification {
  const isIncrease = newRate > oldRate;

  const title = isIncrease
    ? `📢 Protes Publik: Kenaikan Tarif ${taxName} (${oldRate}% ➔ ${newRate}%)`
    : `🎉 Apresiasi Publik: Penurunan Tarif ${taxName} (${oldRate}% ➔ ${newRate}%)`;

  const message = isIncrease
    ? `Serikat pekerja dan pelaku usaha menyampaikan gelombang kekecewaan atas keputusan pemerintah menaikkan tarif ${taxName} dari ${oldRate}% menjadi ${newRate}%. Kebijakan ini dinilai memberatkan daya beli dan meningkatkan beban modal industri.`
    : `Masyarakat luas dan kalangan industri menyambut hangat kebijakan pemerintah menurunkan tarif ${taxName} dari ${oldRate}% menjadi ${newRate}%. Langkah strategis ini diyakini akan merangsang konsumsi domestik dan daya saing investasi nasional.`;

  return {
    id: `pajak-change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    sender: `Direktorat Jenderal Pajak & Gabungan Asosiasi`,
    message,
    timestamp: dateStr,
    type: isIncrease ? 'kepuasan' : 'kesejahteraan',
    value: 0,
    isRead: false,
    tradeType: 'perubahan_pajak',
    taxName,
    oldRate,
    newRate,
    isIncrease
  };
}
