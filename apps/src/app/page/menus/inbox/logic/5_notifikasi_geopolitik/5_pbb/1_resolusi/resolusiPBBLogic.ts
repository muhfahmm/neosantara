import { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { chooseAIResolutionDuration } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/resolusiPBBUILogic';
import { PRODUCTION_BAN_PRODUCTS, formatProductionProductName } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog';
import { isCountryAnnexed } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbVotingEligibility';
import { getIsoForCountryName } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbCountryIso';
import { getDisplayCountryName } from '@/app/logic/countryNameLogic';

export interface AIResolusiPBBNotification extends NotificationMessage {
  tradeType: 'usulan_resolusi_pbb';
  proposerCountry: string;
  targetCountry: string;
  relationScore: number;
  resolutionType: 'war_ban' | 'arms_embargo' | 'economic_embargo' | 'military_invasion' | 'production_ban';
  resolutionTitle: string;
  duration: string;
  productKey?: string;
  aiInvasionAttackChance?: number;
}

const RESOLUTION_TYPES: Array<{
  type: 'war_ban' | 'arms_embargo' | 'economic_embargo' | 'military_invasion' | 'production_ban';
  title: string;
  desc: string;
}> = [
  {
    type: 'war_ban',
    title: 'Larangan Perang',
    desc: 'Dilarang menyerang negara ini selama periode yang dipilih.'
  },
  {
    type: 'arms_embargo',
    title: 'Embargo Penjualan Senjata',
    desc: 'Perdagangan senjata dilarang selama periode yang dipilih.'
  },
  {
    type: 'economic_embargo',
    title: 'Embargo Ekonomi',
    desc: 'Produksi pabrik dan tambang serta pendapatan negara turun 60% selama periode yang dipilih.'
  },
  {
    type: 'military_invasion',
    title: 'Resolusi Invasi',
    desc: 'Resolusi memungkinkan negara diinvasi tanpa kecaman oleh negara lain.'
  },
  {
    type: 'production_ban',
    title: 'Larangan Produksi',
    desc: 'Produksi produk yang dipilih dihentikan selama periode yang dipilih.'
  }
];

/**
 * Generator notifikasi usulan Resolusi PBB dari negara AI ke AI lain / User.
 * Syarat: Skor hubungan diplomatik antara pengusul & target berada pada kisaran 1 - 20 (Buruk / Musuh).
 */
export function generateAIResolusiPBBNotification(
  proposerCountry: string,
  targetCountry: string,
  relationScore: number,
  dateStr: string,
  forcedResolutionType?: AIResolusiPBBNotification['resolutionType']
): AIResolusiPBBNotification {
  proposerCountry = getDisplayCountryName(proposerCountry);
  targetCountry = getDisplayCountryName(targetCountry);
  const chosen = forcedResolutionType
    ? RESOLUTION_TYPES.find(resolution => resolution.type === forcedResolutionType) || RESOLUTION_TYPES[0]
    : RESOLUTION_TYPES[Math.floor(Math.random() * RESOLUTION_TYPES.length)];
  const isWarBan = chosen.type === 'war_ban' || targetCountry?.toLowerCase().includes('dunia') || targetCountry?.toLowerCase().includes('global');

  const title = isWarBan
    ? `🏛️ USULAN RESOLUSI PBB: ${proposerCountry} (LARANGAN PERANG)`
    : `🏛️ USULAN RESOLUSI PBB: ${proposerCountry} ➔ ${targetCountry}`;
  const duration = chooseAIResolutionDuration(chosen.type, relationScore);
  const selectedProductionProduct = chosen.type === 'production_ban'
    ? PRODUCTION_BAN_PRODUCTS[Math.floor(Math.random() * PRODUCTION_BAN_PRODUCTS.length)]
    : undefined;
  const description = selectedProductionProduct
    ? `Produksi ${formatProductionProductName(selectedProductionProduct.key)} dihentikan selama periode yang dipilih.`
    : chosen.desc;

  const message = isWarBan
    ? `Kabar Diplomasi PBB! Negara ${proposerCountry} secara resmi mengajukan usulan "${chosen.title}" untuk seluruh dunia selama ${duration}. Usulan ini: ${description}. Pemungutan suara Majelis Umum PBB akan segera dilaksanakan!`
    : `Kabar Diplomasi PBB! Negara ${proposerCountry} secara resmi mengajukan usulan "${chosen.title}" yang menargetkan ${targetCountry} selama ${duration} akibat ketegangan hubungan bilateral yang buruk (Skor: ${relationScore}/100). Usulan ini: ${description}. Pemungutan suara Majelis Umum PBB akan segera dilaksanakan!`;

  return {
    id: `resolusi-pbb-${proposerCountry}-${targetCountry}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title,
    sender: `Sekretariat Jenderal Majelis Umum PBB`,
    message,
    timestamp: dateStr,
    type: 'peringkat',
    value: relationScore,
    isRead: false,
    tradeType: 'usulan_resolusi_pbb',
    proposerCountry,
    targetCountry: isWarBan ? 'Seluruh Dunia (Global)' : targetCountry,
    relationScore,
    resolutionType: chosen.type,
    resolutionTitle: chosen.title,
    duration,
    productKey: selectedProductionProduct?.key
  };
}

/**
 * Mengecek dan mengevaluasi pemicu acak (25% per bulan ~ 3-5x per tahun)
 * untuk pengajuan Resolusi PBB dari AI ke negara dengan skor hubungan 1-20.
 */
export function evaluateAIResolusiPBBTrigger(
  allCountries: string[],
  userCountryName: string,
  getRelationScore: (countryA: string, countryB: string) => number,
  dateStr: string
): AIResolusiPBBNotification | null {
  // Gunakan seluruh daftar negara jika ada, fallback ke allCountries
  const fullCountryList = Array.isArray(allCountries) && allCountries.length > 25
    ? allCountries
    : [
        ...allCountries,
        'Jepang', 'Amerika Serikat', 'Jerman', 'Inggris', 'Prancis', 'China',
        'Korea Selatan', 'Australia', 'Rusia', 'Arab Saudi', 'Kanada', 'Brasil',
        'India', 'Turki', 'Meksiko', 'Singapura', 'Malaysia', 'Thailand', 'Vietnam',
        'Afrika Selatan', 'Italia', 'Spanyol', 'Mesir', 'Iran', 'Israel', 'Ukraina',
        'Pakistan', 'Polandia', 'Argentina', 'Indonesia', 'Nigeria'
      ];

  const uniqueCountries = Array.from(new Set(fullCountryList.filter(Boolean)));
  const candidatePairs: Array<{ proposer: string; target: string; score: number }> = [];

  // Cari pasangan negara (AI vs User atau AI vs AI) yang skor hubungannya antara 1 s/d 30
  // (Range lebih luas 1-30 agar resolusi tidak selalu monoton negara yang sama)
  for (const proposer of uniqueCountries) {
    if (!proposer || proposer === userCountryName) continue;
    if (isCountryAnnexed(proposer, getIsoForCountryName(proposer))) continue;

    const potentialTargets = [...uniqueCountries, userCountryName].filter(c => c && c !== proposer);
    for (const target of potentialTargets) {
      const score = getRelationScore(proposer, target);
      if (score >= 1 && score <= 30) {
        candidatePairs.push({ proposer, target, score });
      }
    }
  }

  // Jika tidak ada hubungan buruk <30, ada kemungkinan 35% resolusi global (Larangan Perang / Larangan Produksi)
  if (candidatePairs.length === 0) {
    const globalProposers = uniqueCountries.filter(c => c !== userCountryName);
    if (globalProposers.length > 0) {
      const randomProposer = globalProposers[Math.floor(Math.random() * globalProposers.length)];
      const globalTypes: Array<AIResolusiPBBNotification['resolutionType']> = ['war_ban', 'production_ban'];
      const chosenGlobalType = globalTypes[Math.floor(Math.random() * globalTypes.length)];
      return generateAIResolusiPBBNotification(
        randomProposer,
        'Seluruh Dunia (Global)',
        50,
        dateStr,
        chosenGlobalType
      );
    }
    return null;
  }

  // Acak pasangan secara dinamis dan tidak terduga
  const selectedPair = candidatePairs[Math.floor(Math.random() * candidatePairs.length)];
  return generateAIResolusiPBBNotification(
    selectedPair.proposer,
    selectedPair.target,
    selectedPair.score,
    dateStr
  );
}
