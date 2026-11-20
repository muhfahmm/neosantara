import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface SistemEkonomiChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_sistem_ekonomi';
  sliderValue: number;
  systemName: string;
  policyChoices: Record<string, 'A' | 'B'>;
}

export function generateSistemEkonomiChangeNotification(
  sliderValue: number,
  systemName: string,
  policyChoices: Record<string, 'A' | 'B'>,
  dateStr: string
): SistemEkonomiChangeNotification {
  const isCapitalist = sliderValue >= 50;
  const titleKey = 'side_inbox.economicChange.system.title';
  const titleParams = { systemName, sliderValue };
  const senderKey = 'side_inbox.economicChange.system.sender';
  const messageKey = 'side_inbox.economicChange.system.message';
  const messageParams = { systemName, sliderValue };

  return {
    id: `sistem-ekonomi-change-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp: dateStr,
    type: isCapitalist ? 'kepuasan' : 'kesejahteraan',
    value: sliderValue,
    isRead: false,
    tradeType: 'perubahan_sistem_ekonomi',
    sliderValue,
    systemName,
    policyChoices,
  };
}
