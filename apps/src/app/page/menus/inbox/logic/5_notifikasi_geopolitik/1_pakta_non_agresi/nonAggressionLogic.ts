import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface NonAggressionOfferNotification extends NotificationMessage {
  tradeType: 'penawaran_pakta_non_agresi';
  partnerCountry: string;
  isHandled?: boolean;
  status?: 'accepted' | 'rejected';
}

export function generateNonAggressionOfferNotification(
  partnerCountry: string,
  userCountryName: string,
  dateStr: string
): NonAggressionOfferNotification {
  return {
    id: `non-aggression-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `🕊️ Penawaran Pakta Non-Agresi: ${partnerCountry}`,
    sender: `Kementerian Luar Negeri & Diplomasi ${partnerCountry}`,
    message: `Presiden ${userCountryName || 'Nusantara'}, pemerintah ${partnerCountry} secara resmi mengajukan Pakta Non-Agresi bilateral. Kedua negara berjanji menjaga perdamaian, tidak melakukan agresi militer, serta menjaga stabilitas perbatasan. Apakah Anda bersedia menandatangani perjanjian non-agresi ini?`,
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 0,
    isRead: false,
    tradeType: 'penawaran_pakta_non_agresi',
    partnerCountry
  };
}
