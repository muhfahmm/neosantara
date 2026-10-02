// 1_penawaran_perdagangan.ts
// Logika penawaran hubungan perdagangan dari AI ke User

import { getTradePartnersForCountry } from '../../../../../../../../json/database_mitra_perdagangan/tradeAgreementRegistry';
import { getEmbassiesForCountry } from '../../../../../../../../json/database_kedutaan_besar/embassyRegistry';
import { NotificationMessage } from '../1_notifikasi_pokok/1_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface TradeRelationOfferNotification extends NotificationMessage {
  tradeType: 'penawaran_hubungan_dagang';
  partnerCountry: string;
}

const normalizeSlug = (name?: string): string => {
  if (!name) return '';
  const slug = name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  // Alias mapping untuk penyebutan negara yang memiliki beberapa variasi nama
  const aliases: Record<string, string> = {
    'china': 'tiongkok',
    'republik_rakyat_cina': 'tiongkok',
    'republik_rakyat_tiongkok': 'tiongkok',
    'rrc': 'tiongkok',
    'usa': 'amerika_serikat',
    'us': 'amerika_serikat',
    'united_states': 'amerika_serikat',
    'uk': 'inggris',
    'united_kingdom': 'inggris'
  };

  return aliases[slug] || slug;
};

/**
 * Mengecek apakah AI mengajukan penawaran hubungan perdagangan ke User.
 * Sesuai Opsi 1 (Roll Bulanan 25%):
 * 1. Evaluasi dilakukan pada awal bulan (tanggal 1 atau saat bulan berganti).
 * 2. Peluang per roll: 25% per bulan (~3 tawaran/tahun).
 * 3. AI kandidat harus:
 *    - BELUM menjadi mitra dagang User (database_mitra_perdagangan)
 *    - TIDAK memiliki Kedutaan Besar di negara User (database_kedutaan_besar)
 */
export function checkAndGenerateTradeRelationOffers(
  userCountryName: string,
  existingNotifications: NotificationMessage[],
  dateStr: string,
  isMonthlyTick: boolean = true,
  playerTradePartners: any[] = [],
  removedTradePartners: any[] = [],
  playerEmbassies: any[] = [],
  removedEmbassies: any[] = []
): TradeRelationOfferNotification | null {
  if (!userCountryName || !isMonthlyTick) return null;

  const userSlug = normalizeSlug(userCountryName);

  // Pre-existing trade partners & embassy partners (static + dynamic)
  const staticTrade = getTradePartnersForCountry(userCountryName).map(c => normalizeSlug(c));
  const dynamicTrade = Array.isArray(playerTradePartners) ? playerTradePartners.map(c => normalizeSlug(c)) : [];
  const removedTradeSet = new Set(Array.isArray(removedTradePartners) ? removedTradePartners.map(c => normalizeSlug(c)) : []);
  const existingTradePartners = [
    ...staticTrade.filter(slug => !removedTradeSet.has(slug)),
    ...dynamicTrade
  ];

  const staticEmbassy = getEmbassiesForCountry(userCountryName).map(c => normalizeSlug(c));
  const dynamicEmbassy = Array.isArray(playerEmbassies) ? playerEmbassies.map((emb: any) => normalizeSlug(emb.mitra || emb.country || emb)) : [];
  const removedEmbassySet = new Set(Array.isArray(removedEmbassies) ? removedEmbassies.map(c => normalizeSlug(c)) : []);
  const existingEmbassyPartners = [
    ...staticEmbassy.filter(slug => !removedEmbassySet.has(slug)),
    ...dynamicEmbassy
  ];

  // Candidate pool negara-negara internasional
  const candidateCountries: string[] = [
    'Indonesia', 'Malaysia', 'Singapura', 'Brunei', 'Thailand', 'Vietnam', 'Filipina',
    'Jepang', 'Korea Selatan', 'Tiongkok', 'India', 'Australia', 'Selandia Baru',
    'Amerika Serikat', 'Inggris', 'Jerman', 'Prancis', 'Rusia', 'Arab Saudi', 'Turki',
    'Brasil', 'Afrika Selatan', 'Mesir', 'Kanada', 'Meksiko', 'Argentina'
  ];

  // Saring negara yang TIDAK memiliki kedutaan besar & BELUM punya hubungan dagang dengan User
  const validCandidates = candidateCountries.filter(country => {
    const slug = normalizeSlug(country);
    const hasEmbassy = existingEmbassyPartners.includes(slug);
    const hasTrade = existingTradePartners.includes(slug);
    const isUser = slug === userSlug;
    
    return !isUser && !hasEmbassy && !hasTrade;
  });

  if (validCandidates.length === 0) return null;

  // Peluang bulanan 25% (Opsi 1: Expected ~3 tawaran/tahun, kisaran 2-4)
  const TRADE_OFFER_CHANCE_PER_MONTH = 0.25;
  const roll = Math.random();

  if (roll < TRADE_OFFER_CHANCE_PER_MONTH) {
    // Pilih 1 negara kandidat secara acak
    const selectedPartner = validCandidates[Math.floor(Math.random() * validCandidates.length)];

    // Cek apakah sudah ada notifikasi pending untuk mitra ini agar tidak duplikat
    const isAlreadyNotified = existingNotifications.some(
      n => (n as any).tradeType === 'penawaran_hubungan_dagang' && (n as any).partnerCountry === selectedPartner
    );

    if (!isAlreadyNotified) {
      return createTradeRelationOfferNotification(selectedPartner, userCountryName, dateStr);
    }
  }

  return null;
}

export function createTradeRelationOfferNotification(
  partnerCountry: string,
  userCountryName: string,
  dateStr: string
): TradeRelationOfferNotification {
  return {
    id: `trade-offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `🤝 Penawaran Hubungan Dagang: ${partnerCountry}`,
    sender: `Kementerian Luar Negeri & Perdagangan ${partnerCountry}`,
    message: `Salam hangat untuk Presiden ${userCountryName || 'Nusantara'}. Negara ${partnerCountry} belum memiliki Kedutaan Besar resmi di negara Anda, namun kami melihat potensi ekonomi yang sangat besar untuk menjalin kerja sama perdagangan bilateral bilateral tanpa kedutaan besar. Kami secara resmi mengajukan penawaran pembukaan Hubungan Perdagangan. Apakah Anda berkenan menerima penawaran diplomasi ekonomi ini?`,
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'penawaran_hubungan_dagang',
    partnerCountry
  };
}
