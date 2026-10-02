import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface TempatUmumDefisitNotification extends NotificationMessage {
  tradeType: 'defisit_tempat_umum';
  score: number;
  population: number;
}

export function generateTempatUmumDefisitNotification(
  score: number,
  population: number,
  dateStr: string
): TempatUmumDefisitNotification {
  const formattedPop = population.toLocaleString('id-ID');

  return {
    id: `tempat-umum-defisit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: `🏛️ KRISIS LAYANAN PUBLIK: Indeks Tempat Umum ${score}/100!`,
    sender: `Kementerian Pembangunan & Layanan Publik Nasional`,
    message: `Indeks Kepuasan Tempat Umum & Layanan Publik berada di tingkat sangat rendah yaitu ${score}/100 (dibawah batas minimum 20/100). Sarana publik seperti Infrastruktur, Pendidikan, Kesehatan, Penegakan Hukum, Olahraga, dan Komersial belum mencukupi kebutuhan ${formattedPop} jiwa populasi warga. Segera bangun berbagai fasilitas umum baru!`,
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: score,
    isRead: false,
    tradeType: 'defisit_tempat_umum',
    score,
    population,
  };
}
