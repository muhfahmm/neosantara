import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { getDisplayCountryName } from '@/app/logic/countryNameLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface DefenseAllianceOfferNotification extends NotificationMessage {
  tradeType: 'penawaran_aliansi_pertahanan';
  partnerCountry: string;
  isHandled?: boolean;
  status?: 'accepted' | 'rejected';
}

export function generateDefenseAllianceOfferNotification(
  partnerCountry: string,
  userCountryName: string,
  dateStr: string
): DefenseAllianceOfferNotification {
  partnerCountry = getDisplayCountryName(partnerCountry);
  const titleKey = 'side_inbox.geopolitics.allianceTitle';
  const titleParams = { partner: partnerCountry };
  const senderKey = 'side_inbox.offerMessages.defenseAllianceSender';
  const senderParams = { partner: partnerCountry };
  const message = createInboxNotificationText(
    'side_inbox.offerMessages.defenseAlliance',
    { user: userCountryName || 'Nusantara', partner: partnerCountry }
  );

  return {
    id: `defense-alliance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(senderKey, senderParams),
    senderKey,
    senderParams,
    ...message,
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: 0,
    isRead: false,
    tradeType: 'penawaran_aliansi_pertahanan',
    partnerCountry
  };
}
