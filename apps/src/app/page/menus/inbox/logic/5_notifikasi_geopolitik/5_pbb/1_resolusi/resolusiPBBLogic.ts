import { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface AIResolusiPBBNotification extends NotificationMessage {
  tradeType: 'usulan_resolusi_pbb';
  proposerCountry: string;
  targetCountry: string;
  relationScore: number;
  resolutionType: 'war_ban' | 'arms_embargo' | 'economic_embargo' | 'military_invasion' | 'production_ban';
  resolutionTitle: string;
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
    desc: 'Perdagangan ekonomi dilarang selama periode yang dipilih.'
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
  dateStr: string
): AIResolusiPBBNotification {
  const chosen = RESOLUTION_TYPES[Math.floor(Math.random() * RESOLUTION_TYPES.length)];
  const isWarBan = chosen.type === 'war_ban' || targetCountry?.toLowerCase().includes('dunia') || targetCountry?.toLowerCase().includes('global');

  const title = isWarBan
    ? `🏛️ USULAN RESOLUSI PBB: ${proposerCountry} (LARANGAN PERANG)`
    : `🏛️ USULAN RESOLUSI PBB: ${proposerCountry} ➔ ${targetCountry}`;

  const message = isWarBan
    ? `Kabar Diplomasi PBB! Negara ${proposerCountry} secara resmi mengajukan usulan "${chosen.title}" untuk seluruh dunia. Usulan ini: ${chosen.desc}. Pemungutan suara Majelis Umum PBB akan segera dilaksanakan!`
    : `Kabar Diplomasi PBB! Negara ${proposerCountry} secara resmi mengajukan usulan "${chosen.title}" yang menargetkan ${targetCountry} akibat ketegangan hubungan bilateral yang buruk (Skor: ${relationScore}/100). Usulan ini: ${chosen.desc}. Pemungutan suara Majelis Umum PBB akan segera dilaksanakan!`;

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
    resolutionTitle: chosen.title
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
  // Probabilitas 25% per bulan
  if (Math.random() >= 0.25) return null;

  const candidatePairs: Array<{ proposer: string; target: string; score: number }> = [];

  // Cari pasangan negara (AI vs User atau AI vs AI) yang skor hubungannya antara 1 s/d 20
  for (const proposer of allCountries) {
    if (!proposer || proposer === userCountryName) continue;

    const potentialTargets = [...allCountries, userCountryName].filter(c => c && c !== proposer);
    for (const target of potentialTargets) {
      const score = getRelationScore(proposer, target);
      if (score >= 1 && score <= 20) {
        candidatePairs.push({ proposer, target, score });
      }
    }
  }

  if (candidatePairs.length === 0) return null;

  const selectedPair = candidatePairs[Math.floor(Math.random() * candidatePairs.length)];
  return generateAIResolusiPBBNotification(
    selectedPair.proposer,
    selectedPair.target,
    selectedPair.score,
    dateStr
  );
}
