import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface HunianDefisitNotification extends NotificationMessage {
  tradeType: 'defisit_hunian';
  totalCapacity: number;
  population: number;
  shortage: number;
  percentageMet: number;
  housingSatisfaction: number;
}

export function generateHunianDefisitNotification(
  totalCapacity: number,
  population: number,
  shortage: number,
  percentageMet: number,
  housingSatisfaction: number,
  dateStr: string
): HunianDefisitNotification {
  const formattedShortage = shortage.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const formattedPop = population.toLocaleString('id-ID', { maximumFractionDigits: 2 });

  const titleKey = housingSatisfaction <= 20
    ? 'side_inbox.dynamicNotifications.basicNeeds.housing.criticalTitle'
    : 'side_inbox.dynamicNotifications.basicNeeds.housing.title';
  const titleParams = { satisfaction: housingSatisfaction };
  const messageKey = 'side_inbox.dynamicNotifications.basicNeeds.housing.message';
  const messageParams = {
    satisfaction: housingSatisfaction,
    shortage: formattedShortage,
    percentage: percentageMet.toFixed(1),
    population: formattedPop,
  };

  return {
    id: `hunian-defisit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText('side_inbox.dynamicNotifications.basicNeeds.housing.sender'),
    senderKey: 'side_inbox.dynamicNotifications.basicNeeds.housing.sender',
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: shortage,
    isRead: false,
    tradeType: 'defisit_hunian',
    totalCapacity,
    population,
    shortage,
    percentageMet,
    housingSatisfaction,
  };
}
