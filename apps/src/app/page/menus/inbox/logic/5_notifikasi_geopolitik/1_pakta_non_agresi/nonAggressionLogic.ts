import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { getDisplayCountryName } from '@/app/logic/countryNameLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface NonAggressionOfferNotification extends NotificationMessage {
  tradeType: 'penawaran_pakta_non_agresi';
  partnerCountry: string;
  isHandled?: boolean;
  status?: 'accepted' | 'rejected';
}

export function generateNonAggressionOfferNotification(
  partnerCountry: string,
  userCountryName: string,
  dateStr: string
): NonAggressionOfferNotification {
  partnerCountry = getDisplayCountryName(partnerCountry);
  const titleKey = 'side_inbox.nonAggressionOfferTitle';
  const titleParams = { partner: partnerCountry };
  const senderKey = 'side_inbox.nonAggressionSender';
  const senderParams = { partner: partnerCountry };
  return {
    id: `non-aggression-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(senderKey, senderParams),
    senderKey,
    senderParams,
    ...createInboxNotificationText('side_inbox.nonAggressionMessage', {
      user: userCountryName || 'Nusantara',
      partner: partnerCountry,
    }),
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 0,
    isRead: false,
    tradeType: 'penawaran_pakta_non_agresi',
    partnerCountry
  };
}
