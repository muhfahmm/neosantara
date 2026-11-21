import type { InboxMessageParams } from '../../notificationMessage';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface NotificationMessage {
  id: string;
  title: string;
  titleKey?: string;
  titleParams?: InboxMessageParams;
  titleParamKeys?: Record<string, string>;
  sender: string;
  senderKey?: string;
  senderParams?: InboxMessageParams;
  message: string;
  messageKey?: string;
  messageParams?: InboxMessageParams;
  messageParamKeys?: Record<string, string>;
  attackerCountry?: string;
  targetCountry?: string;
  transferredCash?: number;
  lossPercent?: number;
  lootLosses?: Array<{ unitKey: string; quantity: number }>;
  sabotageResult?: {
    infrastructure: boolean;
    losses: Array<{ unitKey: string; lostQuantity: number; remainingQuantity: number }>;
  };
  annexationResult?: {
    attackerCountry: string;
    targetCountry: string;
    cityName?: string;
    pbbOccupation: boolean;
    countryCollapsed: boolean;
    cityFound: boolean;
    lossPercent: number;
    losses: Array<{ unitKey: string; quantity: number }>;
  };
  effectText?: string;
  effectTextKey?: string;
  effectTextParams?: InboxMessageParams;
  effectTextParamKeys?: Record<string, string>;
  timestamp: string;
  type: 'kepuasan' | 'peringkat' | 'kesejahteraan';
  value: number;
  isRead: boolean;
  priority?: 'normal' | 'critical';
  diplomacyArrivalDate?: string;
  diplomacyArrivalDays?: number;
  isHandled?: boolean;
  status?: string;
  provinceIncident?: {
    kind: 'demonstration' | 'referendum';
    targetCountry: string;
    handled?: boolean;
  };
}

/**
 * Logika pesan peringatan dini untuk indikator Kepuasan Rakyat.
 * Dipicu ketika nilai kepuasan turun ke angka 20-25 (di atas batas kritis modal 10).
 */
export function getKepuasanWarningMessage(value: number, dateStr: string): NotificationMessage {
  const titleKey = 'side_inbox.ratingWarning.title';
  const senderKey = 'side_inbox.ratingWarning.sender';

  return {
    id: `kepuasan-warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey),
    titleKey,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText('side_inbox.notificationMessages.ratings.satisfaction', {
      value: Math.round(value),
    }),
    timestamp: dateStr,
    type: 'kepuasan',
    value: Math.round(value),
    isRead: false
  };
}
