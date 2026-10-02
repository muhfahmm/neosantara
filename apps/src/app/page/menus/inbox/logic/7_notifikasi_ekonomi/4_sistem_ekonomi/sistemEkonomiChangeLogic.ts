import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface SistemEkonomiChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_sistem_ekonomi';
  sliderValue: number;
  systemName: string;
  policyChoices: Record<string, 'A' | 'B'>;
}

export function generateSistemEkonomiChangeNotification(
  sliderValue: number,
  systemName: string,
  policyChoices: Record<string, 'A' | 'B'>,
  dateStr: string
): SistemEkonomiChangeNotification {
  const isCapitalist = sliderValue >= 50;

  return {
    id: `sistem-ekonomi-change-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: `📊 REFORMASI SISTEM EKONOMI: ${systemName} (${sliderValue}%)`,
    sender: `Kementerian Koordinator Bidang Perekonomian & Dewan Ekonomi Nasional`,
    message: `Pemerintah telah memperbarui orientasi spektrum kebijakan dan sistem ekonomi nasional menjadi ${systemName} (Skor Spektrum: ${sliderValue}%). Penyesuaian ini mengubah arah regulasi penetapan harga, kepemilikan aset strategis, regulasi tenaga kerja, serta aturan perdagangan luar negeri.`,
    timestamp: dateStr,
    type: isCapitalist ? 'kepuasan' : 'kesejahteraan',
    value: sliderValue,
    isRead: false,
    tradeType: 'perubahan_sistem_ekonomi',
    sliderValue,
    systemName,
    policyChoices,
  };
}
