// 1_penawaran_kedutaan_besar.ts
// Logika notifikasi penawaran pembangunan Kedutaan Besar dari negara AI ke User

import { NotificationMessage } from '../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface EmbassyOfferNotification extends NotificationMessage {
  tradeType: 'penawaran_kedutaan_besar';
  partnerCountry: string;
}

export function createEmbassyOfferNotification(
  partnerCountry: string,
  userCountryName: string,
  dateStr: string
): EmbassyOfferNotification {
  return {
    id: `embassy-offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `🏛️ Penawaran Kedutaan Besar: ${partnerCountry}`,
    sender: `Kementerian Luar Negeri ${partnerCountry}`,
    message: `Salam hangat untuk Presiden ${userCountryName || 'Nusantara'}. Pemerintah ${partnerCountry} secara resmi mengajukan permohonan diplomatik untuk mendirikan bangunan Kedutaan Besar di ibu kota negara Anda guna mempererat hubungan diplomatik dan kerja sama bilateral antar negara. Apakah Anda berkenan menerima permohonan kedutaan besar ini?`,
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'penawaran_kedutaan_besar',
    partnerCountry
  };
}
