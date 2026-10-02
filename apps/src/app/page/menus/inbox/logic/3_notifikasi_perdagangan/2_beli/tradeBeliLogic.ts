import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

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

  return {
    id: `trade-beli-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `💼 Penawaran Dagang: Beli ${formatProduct} dari ${partnerName}`,
    sender: `Kementerian Perdagangan ${partnerName}`,
    message: `Salam hormat Presiden. Mitra dagang kita, ${partnerName}, mengajukan penawaran ekspor khusus kepada kita. Mereka berniat menjual ${quantity.toLocaleString('id-ID')} unit ${formatProduct} dengan harga kompetitif sebesar ${pricePerUnit.toLocaleString('id-ID')} NEO/unit (Total: ${totalPrice.toLocaleString('id-ID')} NEO). Penawaran ini sangat menguntungkan bagi kebutuhan industri nasional kita. Apakah Anda bersedia menyetujui transaksi pembelian ini?`,
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
