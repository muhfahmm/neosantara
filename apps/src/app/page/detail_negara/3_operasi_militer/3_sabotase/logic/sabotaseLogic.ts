import { getMilitaryResearchLevelBonus } from '@/app/page/bonus_logic/militaryResearchBonus';
import type { SabotageUnitLoss } from '@/app/page/detail_negara/3_operasi_militer/covertEffectsLogic';
import type { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { getDefaultInboxText } from '@/app/page/menus/inbox/logic/notificationMessage';

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
  operationTargetKey?: string;
  lossesDetail?: string;
}

export const SABOTASE_BASE_SUCCESS_CHANCE = 50;

const SABOTASE_POOL: Array<{ sabotaseType: SabotaseType; costEM: number }> = [
  { sabotaseType: 'infrastruktur', costEM: 8000 },
  { sabotaseType: 'militer', costEM: 15000 },
  { sabotaseType: 'siber', costEM: 10000 },
  { sabotaseType: 'nuklir', costEM: 200 },
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

  const textPrefix = 'side_inbox.dynamicNotifications.sabotage';
  const eventNameKey = `${textPrefix}.eventNames.${item.sabotaseType}`;
  const effectTextKey = `${textPrefix}.effects.${item.sabotaseType}`;
  const titleKey = 'side_inbox.defense.sabotaseTitle';
  const messageKey = `${textPrefix}.incomingMessage`;
  const titleParams = { partner: partnerCountry };
  const messageParams = {
    eventName: getDefaultInboxText(eventNameKey),
    partner: partnerCountry,
  };

  return {
    id: `sabotase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(`${textPrefix}.incomingSender`),
    senderKey: `${textPrefix}.incomingSender`,
    message: getDefaultInboxText(messageKey, messageParams),
    messageKey,
    messageParams,
    messageParamKeys: { eventName: eventNameKey },
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
    effectText: getDefaultInboxText(effectTextKey),
    effectTextKey,
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
  const textPrefix = 'side_inbox.dynamicNotifications.sabotage';
  const defaultTargetKey = `${textPrefix}.defaultTarget`;
  const targetIsDefault = !operationTarget || operationTarget === 'Fasilitas & Pabrik Militer' || operationTarget === 'Fasilitas Militer';
  const targetOptionKeys: Record<string, string> = {
    'Fasilitas & Pabrik Militer': `${textPrefix}.targetOptions.militaryFacility`,
    'Infrastruktur Listrik & Energi': `${textPrefix}.targetOptions.energyInfrastructure`,
    'Sabotase Produksi Pangan': `${textPrefix}.targetOptions.foodProduction`,
    'Sabotase Manufaktur': `${textPrefix}.targetOptions.manufacturing`,
  };
  const operationTargetKey = targetIsDefault
    ? defaultTargetKey
    : operationTarget
      ? targetOptionKeys[operationTarget]
      : undefined;
  const targetLabel = operationTargetKey
    ? getDefaultInboxText(operationTargetKey)
    : operationTarget ?? getDefaultInboxText(defaultTargetKey);
  const titleKey = `${textPrefix}.${succeeded ? 'offensiveSuccessTitle' : 'offensiveFailureTitle'}`;
  const messageKey = `${textPrefix}.${succeeded ? 'offensiveSuccessMessage' : 'offensiveFailureMessage'}`;
  const effectTextKey = `${textPrefix}.${succeeded ? 'offensiveSuccessEffect' : 'offensiveFailureEffect'}`;
  const titleParams = { country: targetCountry };
  const messageParams = { country: targetCountry, target: targetLabel };
  const effectTextParams = { target: targetLabel };

  return {
    id: `player-sabotase-result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(`${textPrefix}.offensiveSender`),
    senderKey: `${textPrefix}.offensiveSender`,
    message: getDefaultInboxText(messageKey, messageParams),
    messageKey,
    messageParams,
    messageParamKeys: operationTargetKey ? { target: operationTargetKey } : {},
    effectText: getDefaultInboxText(effectTextKey, effectTextParams),
    effectTextKey,
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
    operationTargetKey,
    effectTextParams,
    effectTextParamKeys: operationTargetKey ? { target: operationTargetKey } : {},
    // Keep the unit-loss data available for other notification consumers.
    lossesDetail: lossesText,
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
