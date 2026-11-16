import { getMilitaryResearchLevelBonus } from '@/app/page/bonus_logic/militaryResearchBonus';
import type { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import type { SpionaseEconomicIntelReport } from './spionaseEkonomiLogic';
import type { SpionaseMilitaryIntelReport } from './spionaseMiliterLogic';

export interface SpionaseOperationResult {
  operation: 'spionase';
  targetCountry: string;
  operationTarget?: string;
  successChance: number;
  succeeded: boolean;
  militaryReport?: SpionaseMilitaryIntelReport;
  economicReport?: SpionaseEconomicIntelReport;
}

export type SpionaseLevel = 'ringan' | 'sedang' | 'berat';

export interface SpionaseNotification extends NotificationMessage {
  tradeType: 'spionase';
  partnerCountry: string;
  targetCountry?: string;
  level?: SpionaseLevel;
  costEM?: number;
  effectText?: string;
  isHandled?: boolean;
  remainingResponseDays?: number;
  isOffensive?: boolean;
  operationResult?: 'success' | 'failed';
  operationTarget?: string;
  militaryReport?: SpionaseMilitaryIntelReport;
  economicReport?: SpionaseEconomicIntelReport;
}

export const SPIONASE_BASE_SUCCESS_CHANCE = 50;

const SPIONASE_POOL = [
  {
    level: 'ringan' as SpionaseLevel,
    title: '🕵️ Spionase Ringan: Penyusupan Perbatasan',
    message: (partner: string) => `Lapor Komandan! Agen intelijen asing asal ${partner} terdeteksi mencoba melintasi pos perbatasan tanpa izin resmi. Penjaga batas berhasil memblokir pergerakan awal mereka.`,
    costEM: 20000,
    effectText: '-5% Kekuatan & HP Militer (30-60 hari jika dibiarkan)'
  },
  {
    level: 'sedang' as SpionaseLevel,
    title: '⚠️ Spionase Sedang: Infiltrasi Pangkalan Militer',
    message: (partner: string) => `Peringatan Keamanan! Agen spionase ${partner} menyusup ke instalasi militer wilayah timur. Beberapa dokumen rahasia efektivitas persenjataan berisiko bocor!`,
    costEM: 10000,
    effectText: '-5% Kekuatan & HP Militer (30-60 hari jika dibiarkan)'
  },
  {
    level: 'berat' as SpionaseLevel,
    title: '🚨 Spionase Berat: Jaringan Mata-Mata Besar',
    message: (partner: string) => `DARURAT INTELIJEN! Jaringan mata-mata tingkat tinggi dari ${partner} membocorkan data strategis riset nasional dan posisi armada armada militer kita!`,
    costEM: 15000,
    effectText: '-5% Kekuatan & HP Militer (30-60 hari jika dibiarkan)'
  }
];

export function generateSpionaseNotification(
  partnerCountry: string,
  dateStr: string,
  targetCountry?: string,
): SpionaseNotification {
  const roll = Math.random();
  let item = SPIONASE_POOL[0];
  if (roll < 0.15) {
    item = SPIONASE_POOL[2];
  } else if (roll < 0.45) {
    item = SPIONASE_POOL[1];
  }

  return {
    id: `spionase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: item.title,
    sender: `Badan Intelijen Negara (${partnerCountry})`,
    message: item.message(partnerCountry),
    timestamp: dateStr,
    type: 'peringkat',
    value: 0,
    isRead: false,
    priority: 'critical',
    tradeType: 'spionase',
    partnerCountry,
    ...(targetCountry ? { targetCountry } : {}),
    level: item.level,
    costEM: item.costEM,
    effectText: item.effectText,
    isHandled: false
  };
}

export function generatePlayerSpionaseResultNotification(
  targetCountry: string,
  succeeded: boolean,
  dateStr: string,
  operationTarget?: string,
  militaryReport?: SpionaseMilitaryIntelReport,
  economicReport?: SpionaseEconomicIntelReport,
): SpionaseNotification {
  const targetLabel = operationTarget || 'Informasi Intelijen Negara';
  const title = succeeded
    ? `🕵️ Misi Spionase Berhasil: ${targetCountry}`
    : `❌ Misi Spionase Gagal: ${targetCountry}`;

  const message = succeeded
    ? militaryReport
      ? `Laporan Operasi Intelijen: Agen berhasil mengekstraksi data militer (${targetLabel}) dari ${targetCountry}. Rincian jumlah unit darat, udara, dan laut terlampir.`
      : economicReport
        ? `Laporan Operasi Intelijen: Agen berhasil memperoleh data fiskal (${targetLabel}) dari ${targetCountry}. Rincian anggaran dan tarif pajak terlampir.`
        : `Laporan Operasi Intelijen: Agen spionase kita telah berhasil menyusup dan mengekstraksi data strategis (${targetLabel}) dari target ${targetCountry}. Seluruh dokumen rahasia lawan berhasil dienkripsi dan dikirim ke markas pusat.`
    : `Laporan Darurat Intelijen: Misi spionase terhadap ${targetCountry} (${targetLabel}) mengalami kegagalan. Agen penyusup kita terdeteksi oleh jaringan kontra-intelijen lawan dan terpaksa melakukan evakuasi darurat.`;

  const militaryReportSummary = militaryReport
    ? `Total ${militaryReport.totalUnits.toLocaleString('id-ID')} unit; darat ${militaryReport.groups.darat.totalUnits.toLocaleString('id-ID')}, udara ${militaryReport.groups.udara.totalUnits.toLocaleString('id-ID')}, laut ${militaryReport.groups.laut.totalUnits.toLocaleString('id-ID')}.`
    : undefined;
  const economicReportSummary = economicReport
    ? `Anggaran ${economicReport.budget.toLocaleString('id-ID')} NEO; estimasi pajak ${economicReport.estimatedDailyTaxRevenue.toLocaleString('id-ID')} NEO/hari.`
    : undefined;
  const effectText = succeeded
    ? militaryReportSummary
      ? `Data militer (${targetLabel}) berhasil diamankan. ${militaryReportSummary}`
      : economicReportSummary
        ? `Data fiskal (${targetLabel}) berhasil diamankan. ${economicReportSummary}`
        : `Data intelijen (${targetLabel}) negara ${targetCountry} berhasil diamankan.`
    : `Misi gagal. Agen gagal mendapatkan data ${targetLabel}.`;

  return {
    id: `player-spionase-result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    sender: 'Badan Intelijen Negara (Operasi Khusus)',
    message,
    timestamp: dateStr,
    type: 'peringkat',
    value: succeeded ? 100 : 0,
    isRead: false,
    priority: succeeded ? 'normal' : 'critical',
    tradeType: 'spionase',
    partnerCountry: targetCountry,
    targetCountry,
    level: 'ringan',
    isHandled: true,
    isOffensive: true,
    operationResult: succeeded ? 'success' : 'failed',
    operationTarget: targetLabel,
    ...(militaryReport ? { militaryReport } : {}),
    ...(economicReport ? { economicReport } : {}),
    effectText,
  };
}

export function getSpionaseSuccessChance(
  countryDetail?: Record<string, unknown> | null,
): number {
  const researchId = 'spionase_strategis';
  const completedResearch = Array.isArray(countryDetail?.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(researchId)) return SPIONASE_BASE_SUCCESS_CHANCE;

  const researchLevels = countryDetail?.research_levels &&
    typeof countryDetail.research_levels === 'object'
    ? countryDetail.research_levels as Record<string, unknown>
    : {};
  const level = Number(researchLevels[researchId]) || 1;
  const researchBonus = getMilitaryResearchLevelBonus(researchId, level) || 0;

  return Math.min(100, SPIONASE_BASE_SUCCESS_CHANCE + researchBonus);
}

export function resolveSpionaseOperation(
  countryDetail?: Record<string, unknown> | null,
  operationTarget?: string,
): { operationTarget?: string; successChance: number; succeeded: boolean } {
  const successChance = getSpionaseSuccessChance(countryDetail);
  return {
    operationTarget,
    successChance,
    succeeded: Math.random() * 100 < successChance,
  };
}
