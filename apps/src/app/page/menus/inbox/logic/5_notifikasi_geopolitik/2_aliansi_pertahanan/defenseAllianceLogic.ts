import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface DefenseAllianceOfferNotification extends NotificationMessage {
  tradeType: 'penawaran_aliansi_pertahanan';
  partnerCountry: string;
  isHandled?: boolean;
  status?: 'accepted' | 'rejected';
}

export function generateDefenseAllianceOfferNotification(
  partnerCountry: string,
  userCountryName: string,
  dateStr: string
): DefenseAllianceOfferNotification {
  return {
    id: `defense-alliance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `🛡️ Penawaran Aliansi Pertahanan Militer: ${partnerCountry}`,
    sender: `Dewan Keamanan & Pertahanan Tinggi ${partnerCountry}`,
    message: `Presiden ${userCountryName || 'Nusantara'}, pemerintah ${partnerCountry} mengajukan perjanjian Aliansi Pertahanan Bersama (Pact of Mutual Defense). Dalam perjanjian ini, kedua negara saling berkomitmen memberikan pertahanan militer penuh dan akses intelijen strategis jika terjadi invasi atau serangan dari pihak asing. Apakah Anda bersedia meratifikasi aliansi pertahanan ini?`,
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 0,
    isRead: false,
    tradeType: 'penawaran_aliansi_pertahanan',
    partnerCountry
  };
}
