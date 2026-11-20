import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface TempatUmumDefisitNotification extends NotificationMessage {
  tradeType: 'defisit_tempat_umum';
  score: number;
  population: number;
}

export function generateTempatUmumDefisitNotification(
  score: number,
  population: number,
  dateStr: string
): TempatUmumDefisitNotification {
  const formattedPop = population.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const titleKey = 'side_inbox.basicNeeds.publicServices.title';
  const titleParams = { score };
  const messageKey = 'side_inbox.basicNeeds.publicServices.message';
  const messageParams = { score, population: formattedPop };

  return {
    id: `tempat-umum-defisit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText('side_inbox.basicNeeds.publicServices.sender'),
    senderKey: 'side_inbox.basicNeeds.publicServices.sender',
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: score,
    isRead: false,
    tradeType: 'defisit_tempat_umum',
    score,
    population,
  };
}
