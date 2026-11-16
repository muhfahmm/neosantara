import { getMilitaryResearchLevelBonus } from '@/app/page/bonus_logic/militaryResearchBonus';
import type { SabotageUnitLoss } from '@/app/page/detail_negara/3_operasi_militer/covertEffectsLogic';
import type { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface SabotaseOperationResult {
  operation: 'sabotase';
  targetCountry: string;
  operationTarget?: string;
  successChance: number;
  succeeded: boolean;
  losses?: SabotageUnitLoss[];
}

export type SabotaseType = 'infrastruktur' | 'militer' | 'siber' | 'nuklir';

export interface SabotaseNotification extends NotificationMessage {
  tradeType: 'sabotase';
  partnerCountry: string;
  targetCountry?: string;
  sabotaseType?: SabotaseType;
  costEM?: number;
  effectText?: string;
  isHandled?: boolean;
  remainingResponseDays?: number;
  isOffensive?: boolean;
  operationResult?: 'success' | 'failed';
  operationTarget?: string;
  lossesDetail?: string;
}

export const SABOTASE_BASE_SUCCESS_CHANCE = 50;

const SABOTASE_POOL = [
  {
    sabotaseType: 'infrastruktur' as SabotaseType,
    title: '💣 Sabotase Infrastruktur Nasional',
    message: (partner: string) => `Pipa minyak, jembatan komersial, dan jaringan transportasi utama diduga disabotase oleh kelompok suruhan dari ${partner}!`,
    costEM: 8000,
    effectText: '-5% bangunan listrik dan mineral energi (jika dibiarkan)'
  },
  {
    sabotaseType: 'militer' as SabotaseType,
    title: '🔥 Sabotase Militer: Ledakan Gudang Amunisi',
    message: (partner: string) => `Gudang alutsista dan instalasi militer utama mengalami ledakan sabotase terencana yang dipicu oleh agen asing ${partner}!`,
    costEM: 15000,
    effectText: '-5% Alutsista (permanen jika dibiarkan)'
  },
  {
    sabotaseType: 'siber' as SabotaseType,
    title: '⚡ Sabotase Siber: Kelumpuhan Jaringan Komunikasi',
    message: (partner: string) => {
      void partner;
      return 'Serangan peretas siber berskala besar melumpuhkan radar dan sistem pertahanan udara nasional selama beberapa hari!';
    },
    costEM: 10000,
    effectText: '-5% Alutsista (permanen jika dibiarkan)'
  },
  {
    sabotaseType: 'nuklir' as SabotaseType,
    title: '☢️ Sabotase Fasilitas Nuklir!',
    message: (partner: string) => `BAHAYA MAKSIMAL! Terjadi infiltrasi sabotase pada reaktor nuklir nasional oleh infiltran dari ${partner}! Risiko kebocoran nuklir tinggi!`,
    costEM: 200,
    effectText: '-5% Alutsista (permanen jika dibiarkan)'
  }
];

export function generateSabotaseNotification(
  partnerCountry: string,
  dateStr: string,
  targetCountry?: string,
): SabotaseNotification {
  const roll = Math.random();
  let item = SABOTASE_POOL[0];
  if (roll < 0.10) {
    item = SABOTASE_POOL[3];
  } else if (roll < 0.35) {
    item = SABOTASE_POOL[2];
  } else if (roll < 0.65) {
    item = SABOTASE_POOL[1];
  }

  return {
    id: `sabotase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: item.title,
    sender: 'Kementerian Pertahanan & Keamanan',
    message: item.message(partnerCountry),
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 0,
    isRead: false,
    priority: 'critical',
    tradeType: 'sabotase',
    partnerCountry,
    ...(targetCountry ? { targetCountry } : {}),
    sabotaseType: item.sabotaseType,
    costEM: item.costEM,
    effectText: item.effectText,
    isHandled: false
  };
}

export function generatePlayerSabotaseResultNotification(
  targetCountry: string,
  succeeded: boolean,
  dateStr: string,
  operationTarget?: string,
  lossesText?: string,
): SabotaseNotification {
  const targetLabel = operationTarget || 'Fasilitas & Pabrik Militer';
  const title = succeeded
    ? `💣 Misi Sabotase Berhasil: ${targetCountry}`
    : `❌ Misi Sabotase Gagal: ${targetCountry}`;

  const message = succeeded
    ? `Laporan Operasi Tempur Rahasia: Tim sabotase elit kita sukses meledakkan dan melumpuhkan target (${targetLabel}) di wilayah ${targetCountry}. Kerusakan signifikan terkonfirmasi pada instalasi lawan tanpa meninggalkan jejak!`
    : `Laporan Darurat Lapangan: Operasi sabotase terhadap ${targetCountry} (${targetLabel}) digagalkan! Sistem pertahanan dan pengamanan instalasi lawan berhasil mendeteksi pergerakan tim penyabot kita sebelum peledak diaktifkan.`;

  const effectText = succeeded
    ? (lossesText || `Fasilitas (${targetLabel}) lawan berhasil dirusak dan kekuatan militer target berkurang.`)
    : `Misi gagal. Instalasi ${targetLabel} target tetap utuh.`;

  return {
    id: `player-sabotase-result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    sender: 'Komando Pasukan Khusus & Intelijen Tempur',
    message,
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: succeeded ? 100 : 0,
    isRead: false,
    priority: succeeded ? 'normal' : 'critical',
    tradeType: 'sabotase',
    partnerCountry: targetCountry,
    targetCountry,
    sabotaseType: 'militer',
    isHandled: true,
    isOffensive: true,
    operationResult: succeeded ? 'success' : 'failed',
    operationTarget: targetLabel,
    lossesDetail: lossesText,
    effectText,
  };
}

export function getSabotaseSuccessChance(
  countryDetail?: Record<string, unknown> | null,
): number {
  const researchId = 'sabotase_terarah';
  const completedResearch = Array.isArray(countryDetail?.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(researchId)) return SABOTASE_BASE_SUCCESS_CHANCE;

  const researchLevels = countryDetail?.research_levels &&
    typeof countryDetail.research_levels === 'object'
    ? countryDetail.research_levels as Record<string, unknown>
    : {};
  const level = Number(researchLevels[researchId]) || 1;
  const researchBonus = getMilitaryResearchLevelBonus(researchId, level) || 0;

  return Math.min(100, SABOTASE_BASE_SUCCESS_CHANCE + researchBonus);
}

export function resolveSabotaseOperation(
  countryDetail?: Record<string, unknown> | null,
  operationTarget?: string,
): { operationTarget?: string; successChance: number; succeeded: boolean } {
  const successChance = getSabotaseSuccessChance(countryDetail);
  return {
    operationTarget,
    successChance,
    succeeded: Math.random() * 100 < successChance,
  };
}
