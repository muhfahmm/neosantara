import { NotificationMessage } from '../1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

/**
 * Logika pesan peringatan dini untuk Indeks Kesejahteraan Rakyat.
 * Dipicu ketika kesejahteraan turun ke angka 15-20 (di atas batas kritis modal 10).
 */
export function getKesejahteraanWarningMessage(value: number, dateStr: string): NotificationMessage {
  const titleKey = 'side_inbox.ratingWarning.welfareTitle';
  const senderKey = 'side_inbox.ratingWarning.welfareSender';

  return {
    id: `kesejahteraan-warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey),
    titleKey,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText('side_inbox.notificationMessages.ratings.welfare', {
      value: Math.round(value),
    }),
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: Math.round(value),
    isRead: false
  };
}
