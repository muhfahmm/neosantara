import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface SubsidiChangeNotification extends NotificationMessage {
  tradeType: 'kebijakan_subsidi';
  subsidyName: string;
  isSubsidized: boolean;
}

export function generateSubsidiChangeNotification(
  subsidyName: string,
  isSubsidized: boolean,
  dateStr: string
): SubsidiChangeNotification {
  const action = isSubsidized ? 'granted' : 'withdrawn';
  const titleKey = `side_inbox.economicChange.subsidy.${action}Title`;
  const titleParams = { subsidyName };
  const senderKey = 'side_inbox.economicChange.subsidy.sender';
  const messageKey = `side_inbox.economicChange.subsidy.${action}Message`;
  const messageParams = { subsidyName };

  return {
    id: `subsidi-change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp: dateStr,
    type: isSubsidized ? 'kesejahteraan' : 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'kebijakan_subsidi',
    subsidyName,
    isSubsidized
  };
}
