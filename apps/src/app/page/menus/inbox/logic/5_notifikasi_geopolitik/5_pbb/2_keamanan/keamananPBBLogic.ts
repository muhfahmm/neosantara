import { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { chooseAIResolutionDuration } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/resolusiPBBUILogic';

export interface AIKeamananPBBNotification extends NotificationMessage {
  tradeType: 'usulan_keamanan_pbb';
  proposerCountry: string;
  targetCountry: string;
  relationScore: number;
  securityAction: 'military' | 'support' | 'economic' | 'naval' | 'full' | 'treasure';
  actionTitle: string;
  duration: string;
}

const SECURITY_ACTIONS: Array<{
  action: 'military' | 'support' | 'economic' | 'naval' | 'full' | 'treasure';
  title: string;
  desc: string;
}> = [
  {
    action: 'military',
    title: 'Invasi Militer',
    desc: 'Semua tentara bersatu dari semua negara menyerang negara yang dipilih.'
  },
  {
    action: 'support',
    title: 'Dukung Negara',
    desc: 'Dukungan kepada negara yang dipilih meningkatkan hubungan diplomatiknya dengan semua negara lain sebesar 10 unit.'
  },
  {
    action: 'economic',
    title: 'Blokade Ekonomi',
    desc: 'Selama periode yang dipilih, produksi pabrik dan tambang berkurang sebesar 50%.'
  },
  {
    action: 'naval',
    title: 'Blokade Laut',
    desc: 'Selama periode yang dipilih, produksi pabrik dan tambang berkurang sebesar 25%.'
  },
  {
    action: 'full',
    title: 'Blokade Penuh',
    desc: 'Selama periode yang dipilih, negara ini tidak dapat menandatangani kontrak apa pun atau berdagang.'
  },
  {
    action: 'treasure',
    title: 'Bantuan Logistik',
    desc: 'Memberikan bantuan sumber daya dan logistik ke negara yang dipilih.'
  }
];

/**
 * Generator notifikasi usulan Resolusi Dewan Keamanan PBB dari negara AI ke AI lain / User.
 * Syarat: Skor hubungan diplomatik antara pengusul & target berada pada kisaran 1 - 20 (Sangat Kritis / Musuh).
 */
export function generateAIKeamananPBBNotification(
  proposerCountry: string,
  targetCountry: string,
  relationScore: number,
  dateStr: string
): AIKeamananPBBNotification {
  const chosen = SECURITY_ACTIONS[Math.floor(Math.random() * SECURITY_ACTIONS.length)];
  const duration = chooseAIResolutionDuration(chosen.action, relationScore);

  return {
    id: `keamanan-pbb-${proposerCountry}-${targetCountry}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: `🛡️ DEWAN KEAMANAN PBB: ${proposerCountry} ➔ ${targetCountry}`,
    sender: `Dewan Keamanan Tertinggi PBB`,
    message: `DARURAT DEWAN KEAMANAN PBB! Negara ${proposerCountry} secara resmi mengajukan draf Operasi Kritis "${chosen.title}" terhadap ${targetCountry} selama ${duration} akibat hubungan diplomatik yang sangat buruk (Skor: ${relationScore}/100). Tindakan ini: ${chosen.desc}. Pemungutan suara Dewan Keamanan akan segera diselenggarakan!`,
    timestamp: dateStr,
    type: 'peringkat',
    value: relationScore,
    isRead: false,
    tradeType: 'usulan_keamanan_pbb',
    proposerCountry,
    targetCountry,
    relationScore,
    securityAction: chosen.action,
    actionTitle: chosen.title,
    duration
  };
}

/**
 * Mengecek dan mengevaluasi pemicu acak (25% per bulan ~ 3-5x per tahun)
 * untuk pengajuan Resolusi Dewan Keamanan PBB dari AI ke negara dengan skor hubungan 1-20.
 */
export function evaluateAIKeamananPBBTrigger(
  allCountries: string[],
  userCountryName: string,
  getRelationScore: (countryA: string, countryB: string) => number,
  dateStr: string
): AIKeamananPBBNotification | null {
  // Probabilitas kemunculan ditentukan oleh pemanggil (map-system) agar Resolusi PBB & DK PBB tidak bertabrakan.

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
  return generateAIKeamananPBBNotification(
    selectedPair.proposer,
    selectedPair.target,
    selectedPair.score,
    dateStr
  );
}
