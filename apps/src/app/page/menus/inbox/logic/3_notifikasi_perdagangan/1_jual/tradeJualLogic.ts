import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface TradeOfferNotification extends NotificationMessage {
  tradeType: 'jual'; // AI menawarkan untuk membeli produk milik User (User MENJUAL ke AI)
  partnerName: string;
  productKey: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export function generateAITradeJualNotification(
  partnerName: string,
  productKey: string,
  quantity: number,
  pricePerUnit: number,
  dateStr: string
): TradeOfferNotification {
  const formatProduct = productKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const totalPrice = pricePerUnit * quantity;
  const senderKey = 'side_inbox.trade.jualSender';
  const senderParams = { partner: partnerName };

  return {
    id: `trade-jual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText('side_inbox.trade.jualTitle', { partner: partnerName, product: formatProduct }),
    sender: getDefaultInboxText(senderKey, senderParams),
    senderKey,
    senderParams,
    ...createInboxNotificationText('side_inbox.trade.jualMessage', {
      partner: partnerName,
      product: formatProduct,
      quantity: quantity.toLocaleString('id-ID', { maximumFractionDigits: 2 }),
      price: pricePerUnit.toLocaleString('id-ID', { maximumFractionDigits: 2 }),
      total: totalPrice.toLocaleString('id-ID', { maximumFractionDigits: 2 }),
    }, { product: `side_inbox.items.${productKey}` }),
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'jual',
    partnerName,
    productKey,
    quantity,
    pricePerUnit,
    totalPrice
  } as any;
}
