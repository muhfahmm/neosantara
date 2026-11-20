import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface PanganDefisitNotification extends NotificationMessage {
  tradeType: 'defisit_pangan';
  deficitCount: number;
  totalSectors: number;
  deficitCommodityNames: string[];
}

export function generatePanganDefisitNotification(
  deficitCount: number,
  totalSectors: number,
  deficitCommodityNames: string[],
  dateStr: string
): PanganDefisitNotification {
  const titleKey = 'side_inbox.basicNeeds.food.title';
  const titleParams = { count: deficitCount, total: totalSectors };
  const messageKey = 'side_inbox.basicNeeds.food.message';
  const messageParams = { count: deficitCount, total: totalSectors };

  return {
    id: `pangan-defisit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText('side_inbox.basicNeeds.food.sender'),
    senderKey: 'side_inbox.basicNeeds.food.sender',
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp: dateStr,
    type: 'kepuasan',
    value: deficitCount,
    isRead: false,
    tradeType: 'defisit_pangan',
    deficitCount,
    totalSectors,
    deficitCommodityNames,
  };
}
