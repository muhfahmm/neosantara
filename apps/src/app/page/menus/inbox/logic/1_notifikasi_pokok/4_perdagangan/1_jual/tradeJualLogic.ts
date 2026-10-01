import { NotificationMessage } from '../../1_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

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

  return {
    id: `trade-jual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `💰 Permintaan Pasar: ${partnerName} Ingin Membeli ${formatProduct}`,
    sender: `Delegasi Ekonomi ${partnerName}`,
    message: `Lapor Presiden! Negara mitra kita, ${partnerName}, sedang mengalami defisit komoditas ${formatProduct} dan berniat mengimpor dari kita. Mereka menawarkan kontrak pembelian sebesar ${quantity.toLocaleString('id-ID')} unit ${formatProduct} dengan harga ${pricePerUnit.toLocaleString('id-ID')} NEO/unit (Total nilai ekspor: ${totalPrice.toLocaleString('id-ID')} NEO). Ini kesempatan emas untuk meningkatkan devisa kas negara!`,
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
