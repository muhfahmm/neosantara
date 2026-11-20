import { NotificationMessage } from '../1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

/**
 * Logika pesan peringatan dini untuk Peringkat Presiden (Approval Rating).
 * Dipicu ketika peringkat turun ke angka 15-20 (di atas batas kritis modal 10).
 */
export function getPeringkatWarningMessage(value: number, dateStr: string): NotificationMessage {
  const titleKey = 'side_inbox.ratingWarning.rankingTitle';
  const senderKey = 'side_inbox.ratingWarning.rankingSender';

  return {
    id: `peringkat-warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey),
    titleKey,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText('side_inbox.notificationMessages.ratings.ranking', {
      value: Math.round(value),
    }),
    timestamp: dateStr,
    type: 'peringkat',
    value: Math.round(value),
    isRead: false
  };
}
