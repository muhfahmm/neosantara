import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface ResearchContractOfferNotification extends NotificationMessage {
  tradeType: 'penawaran_kontrak_penelitian';
  partnerCountry: string;
  isHandled?: boolean;
  status?: 'accepted' | 'rejected';
}

export function generateResearchContractOfferNotification(
  partnerCountry: string,
  userCountryName: string,
  dateStr: string
): ResearchContractOfferNotification {
  return {
    id: `research-contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `🔬 Penawaran Kontrak Penelitian Joint-R&D: ${partnerCountry}`,
    sender: `Kementerian Riset, Teknologi & Sains ${partnerCountry}`,
    message: `Presiden ${userCountryName || 'Nusantara'}, Konsorsium Riset Nasional ${partnerCountry} menawarkan kerja sama Kontrak Research & Development (R&D) Bersama. Dengan menandatangani kontrak riset ini, kedua negara akan saling berbagi ilmu pengetahuan dan mempercepat kecepatan riset (+25% Research Speed) di bidang teknologi strategis. Apakah Anda menerima kontrak riset bersama ini?`,
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 0,
    isRead: false,
    tradeType: 'penawaran_kontrak_penelitian',
    partnerCountry
  };
}
