// 1_penawaran_kedutaan_besar.ts
// Logika notifikasi penawaran pembangunan Kedutaan Besar dari negara AI ke User

import { getEmbassiesForCountry } from '../../../../../../../../json/database_kedutaan_besar/embassyRegistry';
import { NotificationMessage } from '../1_notifikasi_pokok/1_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface EmbassyOfferNotification extends NotificationMessage {
  tradeType: 'penawaran_kedutaan_besar';
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
 * Mengecek dan memicu notifikasi tawaran pembangunan Kedutaan Besar dari AI ke User.
 * Syarat:
 * 1. AI kandidat BELUM memiliki Kedutaan Besar di negara User.
 * 2. Dipicu secara berkala pada pergantian bulan (Opsi Roll Bulanan 25%).
 */
export function checkAndGenerateEmbassyOffers(
  userCountryName: string,
  existingNotifications: NotificationMessage[],
  dateStr: string,
  isMonthlyTick: boolean = true
): EmbassyOfferNotification | null {
  if (!userCountryName || !isMonthlyTick) return null;

  const userSlug = normalizeSlug(userCountryName);

  // Ambil daftar negara yang SUDAH memiliki kedutaan besar dengan User
  const existingEmbassyPartners = getEmbassiesForCountry(userCountryName).map(c => normalizeSlug(c));

  // Candidate pool negara-negara internasional
  const candidateCountries: string[] = [
    'Indonesia', 'Malaysia', 'Singapura', 'Brunei', 'Thailand', 'Vietnam', 'Filipina',
    'Jepang', 'Korea Selatan', 'Tiongkok', 'India', 'Australia', 'Selandia Baru',
    'Amerika Serikat', 'Inggris', 'Jerman', 'Prancis', 'Rusia', 'Arab Saudi', 'Turki',
    'Brasil', 'Afrika Selatan', 'Mesir', 'Kanada', 'Meksiko', 'Argentina'
  ];

  // Saring negara yang TIDAK/BELUM memiliki kedutaan besar di negara User
  const validCandidates = candidateCountries.filter(country => {
    const slug = normalizeSlug(country);
    const hasEmbassy = existingEmbassyPartners.includes(slug);
    const isUser = slug === userSlug;
    
    return !isUser && !hasEmbassy;
  });

  if (validCandidates.length === 0) return null;

  // Roll peluang bulanan 25%
  const EMBASSY_OFFER_CHANCE_PER_MONTH = 0.25;
  const roll = Math.random();

  if (roll < EMBASSY_OFFER_CHANCE_PER_MONTH) {
    const selectedPartner = validCandidates[Math.floor(Math.random() * validCandidates.length)];

    // Cek agar tidak ada notifikasi pending duplikat untuk mitra yang sama
    const isAlreadyNotified = existingNotifications.some(
      n => (n as any).tradeType === 'penawaran_kedutaan_besar' && (n as any).partnerCountry === selectedPartner
    );

    if (!isAlreadyNotified) {
      return createEmbassyOfferNotification(selectedPartner, userCountryName, dateStr);
    }
  }

  return null;
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
