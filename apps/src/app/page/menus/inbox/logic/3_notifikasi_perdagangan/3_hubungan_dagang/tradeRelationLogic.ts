import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { getDisplayCountryName } from '@/app/logic/countryNameLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface TradeRelationOfferNotification extends NotificationMessage {
  tradeType: 'penawaran_hubungan_dagang';
  partnerCountry: string;
  isHandled?: boolean;
}

export function generateTradeRelationOfferNotification(
  partnerCountry: string,
  userCountryName: string,
  dateStr: string
): TradeRelationOfferNotification {
  partnerCountry = getDisplayCountryName(partnerCountry);
  const titleKey = 'side_inbox.listTitles.tradeRelation';
  const titleParams = { partner: partnerCountry };
  const senderKey = 'side_inbox.offerMessages.tradeRelationSender';
  const senderParams = { partner: partnerCountry };
  const message = createInboxNotificationText(
    'side_inbox.offerMessages.tradeRelation',
    { user: userCountryName || 'Nusantara', partner: partnerCountry }
  );

  return {
    id: `trade-relation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    tradeType: 'penawaran_hubungan_dagang',
    partnerCountry
  };
}
