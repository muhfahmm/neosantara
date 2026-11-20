import { NotificationMessage } from '../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../notificationMessage';

export interface KabinetChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_kabinet';
  deptId: string;
  deptName: string;
  oldLevel: number;
  newLevel: number;
  isUpgrade: boolean;
  effectLabel: string;
}

export function generateKabinetChangeNotification(
  deptId: string,
  deptName: string,
  oldLevel: number,
  newLevel: number,
  effectLabel: string,
  dateStr: string
): KabinetChangeNotification {
  const isUpgrade = newLevel > oldLevel;

  const titleKey = isUpgrade
    ? 'side_inbox.dynamicNotifications.cabinet.upgradeTitle'
    : 'side_inbox.dynamicNotifications.cabinet.restructureTitle';
  const titleParams = { department: deptName, oldLevel, newLevel };
  const messageKey = isUpgrade
    ? 'side_inbox.dynamicNotifications.cabinet.upgradeMessage'
    : 'side_inbox.dynamicNotifications.cabinet.restructureMessage';
  const messageParams = { department: deptName, oldLevel, newLevel, effect: effectLabel };

  return {
    id: `kabinet-change-${deptId}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText('side_inbox.dynamicNotifications.cabinet.sender'),
    senderKey: 'side_inbox.dynamicNotifications.cabinet.sender',
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp: dateStr,
    type: isUpgrade ? 'kepuasan' : 'kesejahteraan',
    value: newLevel - oldLevel,
    isRead: false,
    tradeType: 'perubahan_kabinet',
    deptId,
    deptName,
    oldLevel,
    newLevel,
    isUpgrade,
    effectLabel,
  };
}
