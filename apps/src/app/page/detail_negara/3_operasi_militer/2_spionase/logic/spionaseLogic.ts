import { getMilitaryResearchLevelBonus } from '@/app/page/bonus_logic/militaryResearchBonus';
import type { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import type { SpionaseEconomicIntelReport } from './spionaseEkonomiLogic';
import type { SpionaseMilitaryIntelReport } from './spionaseMiliterLogic';
import { createInboxNotificationText, getDefaultInboxText } from '@/app/page/menus/inbox/logic/notificationMessage';

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
    costEM: 20000,
  },
  {
    level: 'sedang' as SpionaseLevel,
    costEM: 10000,
  },
  {
    level: 'berat' as SpionaseLevel,
    costEM: 15000,
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
  const textPrefix = 'side_inbox.dynamicNotifications.espionage';
  const titleKey = `${textPrefix}.incomingTitles.${item.level}`;
  const messageKey = `${textPrefix}.incomingMessages.${item.level}`;
  const senderKey = `${textPrefix}.incomingSender`;
  const effectTextKey = `${textPrefix}.incomingEffect`;
  const titleParams = { partner: partnerCountry };
  const messageParams = { partner: partnerCountry };

  return {
    id: `spionase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(senderKey, messageParams),
    senderKey,
    senderParams: messageParams,
    ...createInboxNotificationText(messageKey, messageParams),
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
    effectText: getDefaultInboxText(effectTextKey),
    effectTextKey,
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
  const textPrefix = 'side_inbox.dynamicNotifications.espionage';
  const defaultTargetKey = `${textPrefix}.targets.default`;
  const targetKey = operationTarget === 'Intelijen Militer & Pertahanan'
    ? `${textPrefix}.targets.military`
    : operationTarget === 'Intelijen Ekonomi & Anggaran'
      ? `${textPrefix}.targets.economy`
      : operationTarget
        ? undefined
        : defaultTargetKey;
  const targetLabel = targetKey
    ? getDefaultInboxText(targetKey)
    : operationTarget ?? getDefaultInboxText(defaultTargetKey);
  const titleKey = `${textPrefix}.${succeeded ? 'offensiveSuccessTitle' : 'offensiveFailureTitle'}`;
  const messageKey = !succeeded
    ? `${textPrefix}.offensiveFailureMessage`
    : militaryReport
      ? `${textPrefix}.offensiveMilitaryMessage`
      : economicReport
        ? `${textPrefix}.offensiveEconomyMessage`
        : `${textPrefix}.offensiveGenericMessage`;
  const effectTextKey = !succeeded
    ? `${textPrefix}.offensiveFailureEffect`
    : militaryReport
      ? `${textPrefix}.offensiveMilitaryEffect`
      : economicReport
        ? `${textPrefix}.offensiveEconomyEffect`
        : `${textPrefix}.offensiveSuccessEffect`;
  const titleParams = { country: targetCountry };
  const messageParams = {
    country: targetCountry,
    target: targetLabel,
    totalUnits: militaryReport?.totalUnits ?? 0,
    landUnits: militaryReport?.groups.darat.totalUnits ?? 0,
    airUnits: militaryReport?.groups.udara.totalUnits ?? 0,
    navalUnits: militaryReport?.groups.laut.totalUnits ?? 0,
    budget: economicReport?.budget ?? 0,
    dailyTax: economicReport?.estimatedDailyTaxRevenue ?? 0,
  };
  const effectTextParams = {
    target: targetLabel,
    totalUnits: messageParams.totalUnits,
    budget: messageParams.budget,
    dailyTax: messageParams.dailyTax,
  };
  const messageParamKeys: Record<string, string> = targetKey ? { target: targetKey } : {};
  const senderKey = `${textPrefix}.offensiveSender`;

  return {
    id: `player-spionase-result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText(messageKey, messageParams, messageParamKeys),
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
    effectText: getDefaultInboxText(effectTextKey, effectTextParams),
    effectTextKey,
    effectTextParams,
    effectTextParamKeys: messageParamKeys,
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
