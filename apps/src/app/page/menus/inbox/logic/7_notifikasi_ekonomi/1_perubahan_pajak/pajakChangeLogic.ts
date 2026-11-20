import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface PajakChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_pajak';
  taxName: string;
  oldRate: number;
  newRate: number;
  isIncrease: boolean;
}

export function generatePajakChangeNotification(
  taxName: string,
  oldRate: number,
  newRate: number,
  dateStr: string
): PajakChangeNotification {
  const isIncrease = newRate > oldRate;

  const direction = isIncrease ? 'increase' : 'decrease';
  const titleKey = `side_inbox.economicChange.tax.${direction}Title`;
  const titleParams = { taxName, oldRate, newRate };
  const senderKey = 'side_inbox.economicChange.tax.sender';
  const messageKey = `side_inbox.economicChange.tax.${direction}Message`;
  const messageParams = { taxName, oldRate, newRate };

  return {
    id: `pajak-change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp: dateStr,
    type: isIncrease ? 'kepuasan' : 'kesejahteraan',
    value: 0,
    isRead: false,
    tradeType: 'perubahan_pajak',
    taxName,
    oldRate,
    newRate,
    isIncrease
  };
}
