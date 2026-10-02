import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface HubunganPanasNotification extends NotificationMessage {
  tradeType: 'hubungan_panas';
  partnerCountry: string;
  relationScore: number;
  threshold: number;
}

export function generateHubunganPanasNotification(
  partnerCountry: string,
  relationScore: number,
  dateStr: string
): HubunganPanasNotification {
  let threshold = 20;
  if (relationScore <= 1) threshold = 1;
  else if (relationScore <= 5) threshold = 5;
  else if (relationScore <= 10) threshold = 10;
  else if (relationScore <= 15) threshold = 15;

  let title = `🚨 HUBUNGAN MEMBURUK: ${partnerCountry} (${relationScore}/100)`;
  let message = `Peringatan Diplomasi! Tingkat hubungan bilateral dengan ${partnerCountry} memburuk ke level kritis (${relationScore}/100). Suasana ketegangan geopolitik meningkat dan berpotensi memicu sanksi ekonomi, pengusiran diplomat, hingga konfrontasi militer jika tidak segera diperbaiki.`;

  if (threshold === 1) {
    title = `⚔️ AMBANG PERANG: Hubungan dengan ${partnerCountry} Hancur (${relationScore}/100)!`;
    message = `DARURAT NasionaL! Hubungan diplomatik dengan ${partnerCountry} mencapai titik terendah mutlak (${relationScore}/100). Kontak diplomatik hampir terputus total dan armada militer pihak lawan dalam kesiapsiagaan tempur tertinggi. Segera ambil tindakan diplomasi darurat!`;
  } else if (threshold === 5) {
    title = `💣 PERBATASAN TERANCAM: Hubungan ${partnerCountry} Kritis (${relationScore}/100)!`;
    message = `Lapor Presiden! Hubungan diplomatik dengan ${partnerCountry} merosot drastis hingga angka ${relationScore}/100. Pihak oposisi dan militer lawan mulai menempatkan persenjataan di garis perbatasan.`;
  } else if (threshold === 10) {
    title = `🔥 ANCAMAN KONFLIK: Hubungan ${partnerCountry} Sangat Buruk (${relationScore}/100)!`;
    message = `Ketegangan dengan ${partnerCountry} semakin panas (Skor ${relationScore}/100). Kedutaan besar melaporkan penurunan kerja sama dan peningkatan sentimen musuh di publik mereka.`;
  } else if (threshold === 15) {
    title = `⚠️ KETEGANGAN MEMANAS: Hubungan ${partnerCountry} Turun ke ${relationScore}/100!`;
    message = `Tingkat hubungan diplomatik dengan ${partnerCountry} mengalami kemerosotan signifikan hingga ${relationScore}/100 (dibawah batas aman 20). Disarankan segera mengirim delegasi damai atau bantuan diplomatik.`;
  }

  return {
    id: `hubungan-panas-${partnerCountry}-${threshold}-${dateStr.replace(/[^a-zA-Z0-9]/g, '')}`,
    title,
    sender: `Kementerian Luar Negeri & Intelijen Diplomasi`,
    message,
    timestamp: dateStr,
    type: 'peringkat',
    value: relationScore,
    isRead: false,
    tradeType: 'hubungan_panas',
    partnerCountry,
    relationScore,
    threshold
  };
}
