// 1_penawaran_kedutaan_besar.ts
// Logika notifikasi penawaran pembangunan Kedutaan Besar dari negara AI ke User

import { NotificationMessage } from '../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { getDisplayCountryName } from '@/app/logic/countryNameLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../notificationMessage';

export interface EmbassyOfferNotification extends NotificationMessage {
  tradeType: 'penawaran_kedutaan_besar';
  partnerCountry: string;
}

export function createEmbassyOfferNotification(
  partnerCountry: string,
  userCountryName: string,
  dateStr: string
): EmbassyOfferNotification {
  partnerCountry = getDisplayCountryName(partnerCountry);
  const titleKey = 'side_inbox.geopolitics.embassyTitle';
  const titleParams = { partner: partnerCountry };
  const senderKey = 'side_inbox.offerMessages.embassySender';
  const senderParams = { partner: partnerCountry };
  const message = createInboxNotificationText(
    'side_inbox.offerMessages.embassy',
    { user: userCountryName || 'Nusantara', partner: partnerCountry }
  );

  return {
    id: `embassy-offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(senderKey, senderParams),
    senderKey,
    senderParams,
    ...message,
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'penawaran_kedutaan_besar',
    partnerCountry
  };
}
