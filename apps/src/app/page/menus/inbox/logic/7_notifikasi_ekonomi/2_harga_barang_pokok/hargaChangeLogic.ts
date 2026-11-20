import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface HargaChangeNotification extends NotificationMessage {
  tradeType: 'harga_barang_pokok';
  itemName: string;
  oldPrice: number;
  newPrice: number;
  isIncrease: boolean;
}

export function generateHargaChangeNotification(
  itemName: string,
  oldPrice: number,
  newPrice: number,
  dateStr: string
): HargaChangeNotification {
  const isIncrease = newPrice > oldPrice;

  const direction = isIncrease ? 'increase' : 'decrease';
  const formatPrice = (price: number) => price.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const titleKey = `side_inbox.economicChange.price.${direction}Title`;
  const titleParams = { itemName, oldPrice: formatPrice(oldPrice), newPrice: formatPrice(newPrice) };
  const senderKey = 'side_inbox.economicChange.price.sender';
  const messageKey = `side_inbox.economicChange.price.${direction}Message`;
  const messageParams = { itemName, oldPrice: formatPrice(oldPrice), newPrice: formatPrice(newPrice) };

  return {
    id: `harga-change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp: dateStr,
    type: isIncrease ? 'kepuasan' : 'kesejahteraan',
    value: 0,
    isRead: false,
    tradeType: 'harga_barang_pokok',
    itemName,
    oldPrice,
    newPrice,
    isIncrease
  };
}
