import type { CountryData } from '../../../map_system/map-data';
import type { DiplomacyNewsData, DiplomacyNewsType } from './4_diplomasi/diplomasiNewsLogic';
import type { EconomyNewsData, EconomyNewsType } from './5_ekonomi_keuangan/ekonomiKeuanganNewsLogic';
import type { MilitaryAchievementNewsData } from './6_pencapaian_militer/pencapaianMiliterNewsLogic';

export type WorldNewsItemData =
  | DiplomacyNewsData
  | EconomyNewsData
  | MilitaryAchievementNewsData;

const worldEventTypes: Array<DiplomacyNewsType | EconomyNewsType | 'program_nuklir'> = [
  'pakta_non_agresi',
  'aliansi_pertahanan',
  'perjanjian_dagang',
  'kontrak_penelitian',
  'sanksi_ekonomi',
  'krisis_ekonomi',
  'pajak_baru',
  'program_nuklir',
];

const diplomacyHeadlines: Record<DiplomacyNewsType, string> = {
  pakta_non_agresi: 'Pakta Non-Agresi Baru Disepakati',
  aliansi_pertahanan: 'Aliansi Pertahanan Baru Terbentuk',
  perjanjian_dagang: 'Perjanjian Dagang Bilateral Ditandatangani',
  kontrak_penelitian: 'Kerja Sama Penelitian Internasional Dimulai',
  sanksi_ekonomi: 'Sanksi Ekonomi Diberlakukan',
};

function createWorldNews(
  id: string,
  type: WorldNewsItemData['type'],
  headline: string,
  content: string,
  dateStr: string,
  countryName: string,
): WorldNewsItemData {
  const common = { id, headline, content, timestamp: dateStr, dateStr, countryName };
  if (type === 'krisis_ekonomi' || type === 'pajak_baru') {
    return { ...common, type, category: 'ekonomi_keuangan' };
  }
  if (type === 'program_nuklir') {
    return { ...common, type, category: 'pencapaian_militer' };
  }
  return { ...common, type, category: 'diplomasi' };
}

export function generateWorldNewsEvents(
  countries: CountryData[],
  userCountryName: string,
  currentCursor: number,
  dateStr: string,
  eventCount = 3
): { news: WorldNewsItemData[]; nextCursor: number } {
  const normalizedUserCountry = userCountryName.trim().toLocaleLowerCase();
  const npcCountries = countries.filter(
    country => country.country.trim().toLocaleLowerCase() !== normalizedUserCountry
  );
  if (npcCountries.length === 0 || eventCount <= 0) {
    return { news: [], nextCursor: 0 };
  }

  const start = ((Math.floor(currentCursor) % npcCountries.length) + npcCountries.length) % npcCountries.length;
  const count = Math.min(Math.floor(eventCount), npcCountries.length);
  const news: WorldNewsItemData[] = [];

  for (let offset = 0; offset < count; offset += 1) {
    const countryIndex = (start + offset) % npcCountries.length;
    const actor = npcCountries[countryIndex];
    const partner = npcCountries[(countryIndex + 1) % npcCountries.length];
    const type = worldEventTypes[(start + offset) % worldEventTypes.length];
    const id = `world-news-${dateStr}-${actor.id}-${type}`;
    let headline: string;
    let content: string;

    switch (type) {
      case 'pakta_non_agresi':
        headline = diplomacyHeadlines[type];
        content = `Dalam simulasi geopolitik, ${actor.country} dan ${partner.country} menyepakati pakta non-agresi untuk meredakan ketegangan bilateral.`;
        break;
      case 'aliansi_pertahanan':
        headline = diplomacyHeadlines[type];
        content = `${actor.country} dan ${partner.country} membentuk aliansi pertahanan dalam perkembangan diplomatik simulasi.`;
        break;
      case 'perjanjian_dagang':
        headline = diplomacyHeadlines[type];
        content = `${actor.country} dan ${partner.country} menandatangani perjanjian dagang untuk memperluas kerja sama ekonomi.`;
        break;
      case 'kontrak_penelitian':
        headline = diplomacyHeadlines[type];
        content = `${actor.country} dan ${partner.country} memulai kontrak penelitian bersama untuk mengembangkan kerja sama ilmu pengetahuan dan teknologi.`;
        break;
      case 'sanksi_ekonomi':
        headline = diplomacyHeadlines[type];
        content = `${actor.country} memberlakukan sanksi ekonomi terhadap ${partner.country} di tengah meningkatnya ketegangan bilateral.`;
        break;
      case 'krisis_ekonomi':
        headline = 'Tekanan Fiskal Melanda';
        content = `${actor.country} menghadapi tekanan fiskal dalam simulasi ekonomi, mendorong pemerintah meninjau kembali prioritas anggaran.`;
        break;
      case 'pajak_baru':
        headline = 'Kebijakan Pajak Baru Diumumkan';
        content = `${actor.country} mengumumkan penyesuaian kebijakan pajak sebagai bagian dari strategi ekonomi nasional.`;
        break;
      case 'program_nuklir':
        headline = 'Program Nuklir Nasional Diumumkan';
        content = `${actor.country} mengumumkan dimulainya program nuklir nasional dalam perkembangan pertahanan simulasi.`;
        break;
    }

    news.push(createWorldNews(id, type, headline, content, dateStr, actor.country));
  }

  return {
    news,
    nextCursor: (start + count) % npcCountries.length,
  };
}
