import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

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

  const title = isIncrease
    ? `💥 Kenaikan Harga: ${itemName} Melonjak (Rp ${oldPrice.toLocaleString('id-ID')} ➔ Rp ${newPrice.toLocaleString('id-ID')})`
    : `🛒 Harga Terjangkau: ${itemName} Turun (Rp ${oldPrice.toLocaleString('id-ID')} ➔ Rp ${newPrice.toLocaleString('id-ID')})`;

  const message = isIncrease
    ? `Ibu rumah tangga dan pedagang kecil mengeluhkan kenaikan harga pasar komoditas ${itemName} dari Rp ${oldPrice.toLocaleString('id-ID')} menjadi Rp ${newPrice.toLocaleString('id-ID')}. Kenaikan harga barang pokok ini menekan daya beli warga kelas menengah ke bawah.`
    : `Masyarakat menyambut positif penurunan harga komoditas ${itemName} dari Rp ${oldPrice.toLocaleString('id-ID')} menjadi Rp ${newPrice.toLocaleString('id-ID')}. Bahan pangan yang makin terjangkau menjaga stabilitas inflasi dan meningkatkan kepuasan publik.`;

  return {
    id: `harga-change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    sender: `Asosiasi Pedagang Pasar & Konsumen`,
    message,
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
