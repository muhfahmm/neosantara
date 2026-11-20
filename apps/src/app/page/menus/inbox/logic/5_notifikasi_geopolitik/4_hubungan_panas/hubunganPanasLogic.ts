import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';
import { getRelationValue } from '../../../../../../../../../json/4_database_hubungan_antar_negara/relationsRegistry';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface HubunganPanasNotification extends NotificationMessage {
  tradeType: 'hubungan_panas';
  partnerCountry: string;
  relationScore: number;
  threshold: number;
}

export function generateHubunganPanasNotification(
  partnerCountry: string,
  relationScore: number,
  dateStr: string
): HubunganPanasNotification {
  let threshold = 20;
  if (relationScore <= 1) threshold = 1;
  else if (relationScore <= 5) threshold = 5;
  else if (relationScore <= 10) threshold = 10;
  else if (relationScore <= 15) threshold = 15;

  const titleKey = `side_inbox.geopolitics.hotRelationTitle${threshold}`;
  const messageKey = `side_inbox.geopolitics.hotRelationMessage${threshold}`;
  const messageParams = { partner: partnerCountry, score: relationScore };
  const senderKey = 'side_inbox.geopolitics.hotRelationSender';

  return {
    id: `hubungan-panas-${partnerCountry}-${threshold}-${dateStr.replace(/[^a-zA-Z0-9]/g, '')}`,
    title: getDefaultInboxText(titleKey, messageParams),
    titleKey,
    titleParams: messageParams,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp: dateStr,
    type: 'peringkat',
    value: relationScore,
    isRead: false,
    tradeType: 'hubungan_panas',
    partnerCountry,
    relationScore,
    threshold
  };
}

/**
 * Memeriksa dan menghasilkan notifikasi hubungan panas (skor 1 - 20) untuk negara player
 */
export function evaluateHotRelationsNotifications(
  userCountryName: string,
  dateStr: string
): HubunganPanasNotification[] {
  const notifications: HubunganPanasNotification[] = [];
  const playerCountry = userCountryName || 'Indonesia';

  const targetCountries = COUNTRIES_DATA.filter(
    (c) => c.country.toLowerCase().trim() !== playerCountry.toLowerCase().trim()
  );

  for (const c of targetCountries) {
    const relVal = getRelationValue(playerCountry, c.country);
    if (relVal >= 1 && relVal <= 20) {
      const notif = generateHubunganPanasNotification(c.country, relVal, dateStr);
      notifications.push(notif);
    }
  }

  return notifications;
}
