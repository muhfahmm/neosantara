// File: demonstrasiEkonomiLogic.ts

export interface DemonstrasiNotification {
  id: string;
  title: string;
  sender: string;
  message: string;
  timestamp: string;
  type: 'kepuasan' | 'peringkat' | 'kesejahteraan';
  value: number;
  isRead: boolean;
  tradeType: 'demonstrasi_rakyat';
  cause: 'subsidi' | 'harga' | 'pajak';
  severity: 'sedang' | 'tinggi' | 'ekstrem';
  details?: Record<string, any>;
  // Tambahan properti untuk interaksi
  demo_status?: 'aktif' | 'dialog' | 'ignored' | 'selesai' | 'kerusuhan';
  demo_deadline?: string;
}

// Update fungsi generator agar saat dibuat statusnya default 'aktif'
export function generateDemonstrasiSubsidiNotification(
  subsidyName: string,
  dateStr: string
): DemonstrasiNotification {
  return {
    id: `demo-subsidi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `🔥 DEMONSTRASI MASIF: PENOLAKAN PENCABUTAN SUBSIDI`,
    sender: `Aliansi Buruh, Mahasiswa & Koalisi Masyarakat Sipil`,
    message: `Gelombang unjuk rasa besar-besaran pecah di berbagai ibu kota provinsi setelah pemerintah menonaktifkan program ${subsidyName}! Massa memadati jalan protokol, menuntut pengembalian anggaran subsidi serta mengecam pemotongan jaring pengaman sosial rakyat.`,
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'demonstrasi_rakyat',
    cause: 'subsidi',
    severity: 'ekstrem',
    details: { subsidyName },
    demo_status: 'aktif', // <-- TAMBAHAN
  };
}

// Lakukan hal yang sama untuk generateDemonstrasiHargaNotification dan generateDemonstrasiPajakNotification
// Tambahkan properti demo_status: 'aktif' di dalam return object-nya.

export function generateDemonstrasiHargaNotification(
  itemName: string,
  oldPrice: number,
  newPrice: number,
  levelJump: number,
  dateStr: string
): DemonstrasiNotification {
  const isExtreme = levelJump >= 3;
  const title = isExtreme
    ? `🔥 KERUSUHAN & DEMONSTRASI DARURAT: LONJAKAN EKSTREM HARGA ${itemName}`
    : `📢 DEMONSTRASI WARGA: AKSI PROTES KENAIKAN HARGA ${itemName}`;

  const message = isExtreme
    ? `Massa rakyat dan ibu rumah tangga tumpah ruah menggelar demonstrasi besar memblokade pusat distribusi setelah harga pasar ${itemName} dinaikkan secara drastis sekaligus melonjak 3 level ke Rp ${newPrice.toLocaleString('id-ID')} (sebelumnya Rp ${oldPrice.toLocaleString('id-ID')}). Gejolak sosial memanas menuntut pencabutan kebijakan harga ekstrem ini!`
    : `Aksi demonstrasi dan unjuk rasa damai digelar di depan gedung perwakilan daerah atas kenaikan harga komoditas ${itemName} dari Rp ${oldPrice.toLocaleString('id-ID')} menjadi Rp ${newPrice.toLocaleString('id-ID')}. Serikat konsumen mendesak stabilisasi harga barang pokok.`;

  return {
    id: `demo-harga-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    sender: `Serikat Konsumen, Asosiasi Pedagang & Komunitas Warga`,
    message,
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'demonstrasi_rakyat',
    cause: 'harga',
    severity: isExtreme ? 'ekstrem' : 'tinggi',
    details: { itemName, oldPrice, newPrice, levelJump }
  };
}

export function generateDemonstrasiPajakNotification(
  taxName: string,
  oldRate: number,
  newRate: number,
  rateDifference: number,
  dateStr: string
): DemonstrasiNotification {
  return {
    id: `demo-pajak-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `🔥 AKSI MOGOK & DEMONSTRASI NASIONAL: PENOLAKAN LONJAKAN ${taxName.toUpperCase()}`,
    sender: `Federasi Serikat Buruh & Asosiasi Pelaku Industri Nasional`,
    message: `Gelombang aksi unjuk rasa besar disertai aksi mogok kerja massal meletus serentak menyusul kebijakan kenaikan tarif ${taxName} yang melonjak gila-gilaan sebesar +${rateDifference} poin (dari ${oldRate}% ke ${newRate}%). Ribuan demonstran menuntut pembatalan kenaikan beban pajak yang mencekik ekonomi rakyat!`,
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'demonstrasi_rakyat',
    cause: 'pajak',
    severity: 'ekstrem',
    details: { taxName, oldRate, newRate, rateDifference }
  };
}
