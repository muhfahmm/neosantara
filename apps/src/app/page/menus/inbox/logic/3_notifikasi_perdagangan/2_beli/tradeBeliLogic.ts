import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface TradeOfferNotification extends NotificationMessage {
  tradeType: 'beli'; // AI menawarkan untuk menjual produk miliknya (User MEMBELI dari AI)
  partnerName: string;
  productKey: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export function generateAITradeBeliNotification(
  partnerName: string,
  productKey: string,
  quantity: number,
  pricePerUnit: number,
  dateStr: string
): TradeOfferNotification {
  const formatProduct = productKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const totalPrice = pricePerUnit * quantity;
  const senderKey = 'side_inbox.trade.beliSender';
  const senderParams = { partner: partnerName };

  return {
    id: `trade-beli-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText('side_inbox.trade.beliTitle', { partner: partnerName, product: formatProduct }),
    sender: getDefaultInboxText(senderKey, senderParams),
    senderKey,
    senderParams,
    ...createInboxNotificationText('side_inbox.trade.beliMessage', {
      partner: partnerName,
      product: formatProduct,
      quantity: quantity.toLocaleString('id-ID', { maximumFractionDigits: 2 }),
      price: pricePerUnit.toLocaleString('id-ID', { maximumFractionDigits: 2 }),
      total: totalPrice.toLocaleString('id-ID', { maximumFractionDigits: 2 }),
    }, { product: `side_inbox.items.${productKey}` }),
    timestamp: dateStr,
    type: 'kesejahteraan', // Gunakan tipe bawaan yang kompatibel dengan state atau filter utama
    value: 0,
    isRead: false,
    tradeType: 'beli',
    partnerName,
    productKey,
    quantity,
    pricePerUnit,
    totalPrice
  } as any;
}
