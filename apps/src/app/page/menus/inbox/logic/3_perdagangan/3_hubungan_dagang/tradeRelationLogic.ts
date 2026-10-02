import { NotificationMessage } from '../../1_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface TradeRelationOfferNotification extends NotificationMessage {
  tradeType: 'penawaran_hubungan_dagang';
  partnerCountry: string;
  isHandled?: boolean;
}

export function generateTradeRelationOfferNotification(
  partnerCountry: string,
  userCountryName: string,
  dateStr: string
): TradeRelationOfferNotification {
  return {
    id: `trade-relation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `🤝 Penawaran Perjanjian Dagang: ${partnerCountry}`,
    sender: `Kementerian Luar Negeri & Perdagangan ${partnerCountry}`,
    message: `Presiden ${userCountryName || 'Nusantara'}, pemerintah ${partnerCountry} bermaksud memperluas kemitraan strategis dan membuka jalur perdagangan bilateral dengan negara Anda. Dengan menandatangani Perjanjian Hubungan Dagang ini, kedua negara akan mendapatkan akses komoditas ekspor-impor eksklusif dan insentif tarif khusus. Apakah Anda setuju meratifikasi perjanjian hubungan dagang ini?`,
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 0,
    isRead: false,
    tradeType: 'penawaran_hubungan_dagang',
    partnerCountry
  };
}
