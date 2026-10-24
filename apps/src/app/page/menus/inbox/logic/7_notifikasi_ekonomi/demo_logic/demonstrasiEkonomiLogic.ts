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
  dialog_days_left?: number;
  demonstratorCount: number; // Jumlah massa demonstran
}

/**
 * Rumus Skala Dinamis Menghitung Jumlah Demonstran:
 * 1. Base number: 10.000 demonstran
 * 2. Multiplier pemicu & keparahan (Subsidi Kritis: x10, Non-kritis: x4, Pajak Ekstrem: x7.5, Harga Ekstrem: x6.5, Harga Biasa: x3)
 * 3. Faktor Populasi Negara (Acuan 50 juta penduduk)
 * 4. Variasi acak (0.8x s/d 1.2x)
 */
export function calculateDemonstrators(cause: string, severity: string, countryPopulation?: number): number {
  const baseNumber = 10000;
  const randomVariance = 0.8 + Math.random() * 0.4; // Acak antara 0.8x sampai 1.2x

  let multiplier = 1.0;
  if (cause === 'subsidi' && severity === 'ekstrem') multiplier = 10.0; // Subsidi kritis
  else if (cause === 'subsidi') multiplier = 4.0; // Non-kritis
  else if (cause === 'pajak' && severity === 'ekstrem') multiplier = 7.5;
  else if (cause === 'harga' && severity === 'ekstrem') multiplier = 6.5;
  else if (cause === 'harga') multiplier = 3.0; // Harga biasa
  else multiplier = 5.0;

  // Faktor Populasi (Acuan 50 juta)
  const populationFactor = Math.max(0.1, (countryPopulation || 50000000) / 50000000);

  // Hitung total dan bulatkan ke ratusan terdekat
  const total = Math.floor(baseNumber * multiplier * randomVariance * populationFactor);
  return Math.max(1000, Math.round(total / 100) * 100);
}

// Update fungsi generator agar saat dibuat statusnya default 'aktif' dan memuat demonstratorCount
export function generateDemonstrasiSubsidiNotification(
  subsidyName: string,
  dateStr: string,
  countryPopulation?: number,
  isCritical: boolean = true
): DemonstrasiNotification {
  const severity = isCritical ? 'ekstrem' : 'tinggi';
  const demonstratorCount = calculateDemonstrators('subsidi', severity, countryPopulation);
  return {
    id: `demo-subsidi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `🔥 DEMONSTRASI MASIF: PENOLAKAN PENCABUTAN SUBSIDI`,
    sender: `Aliansi Buruh, Mahasiswa & Koalisi Masyarakat Sipil`,
    message: `Gelombang unjuk rasa besar-besaran pecah di berbagai ibu kota provinsi setelah pemerintah menonaktifkan program ${subsidyName}! Sekitar ${demonstratorCount.toLocaleString('id-ID')} massa memadati jalan protokol, menuntut pengembalian anggaran subsidi serta mengecam pemotongan jaring pengaman sosial rakyat.`,
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'demonstrasi_rakyat',
    cause: 'subsidi',
    severity,
    details: { subsidyName },
    demo_status: 'aktif',
    demonstratorCount,
  };
}

export function generateDemonstrasiHargaNotification(
  itemName: string,
  oldPrice: number,
  newPrice: number,
  levelJump: number,
  dateStr: string,
  countryPopulation?: number
): DemonstrasiNotification {
  const isExtreme = levelJump >= 3;
  const severity = isExtreme ? 'ekstrem' : 'tinggi';
  const demonstratorCount = calculateDemonstrators('harga', severity, countryPopulation);
  const title = isExtreme
    ? `🔥 KERUSUHAN & DEMONSTRASI DARURAT: LONJAKAN EKSTREM HARGA ${itemName}`
    : `📢 DEMONSTRASI WARGA: AKSI PROTES KENAIKAN HARGA ${itemName}`;

  const message = isExtreme
    ? `Massa rakyat dan ibu rumah tangga sebanyak kurleb ${demonstratorCount.toLocaleString('id-ID')} jiwa tumpah ruah menggelar demonstrasi besar memblokade pusat distribusi setelah harga pasar ${itemName} dinaikkan secara drastis sekaligus melonjak ${levelJump} level ke Rp ${newPrice.toLocaleString('id-ID')} (sebelumnya Rp ${oldPrice.toLocaleString('id-ID')}). Gejolak sosial memanas menuntut pencabutan kebijakan harga ekstrem ini!`
    : `Aksi demonstrasi dan unjuk rasa damai dihadiri sekitar ${demonstratorCount.toLocaleString('id-ID')} warga digelar di depan gedung perwakilan daerah atas kenaikan harga komoditas ${itemName} dari Rp ${oldPrice.toLocaleString('id-ID')} menjadi Rp ${newPrice.toLocaleString('id-ID')}. Serikat konsumen mendesak stabilisasi harga barang pokok.`;

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
    severity,
    details: { itemName, oldPrice, newPrice, levelJump },
    demo_status: 'aktif',
    demonstratorCount,
  };
}

export function generateDemonstrasiPajakNotification(
  taxName: string,
  oldRate: number,
  newRate: number,
  rateDifference: number,
  dateStr: string,
  countryPopulation?: number
): DemonstrasiNotification {
  const demonstratorCount = calculateDemonstrators('pajak', 'ekstrem', countryPopulation);
  return {
    id: `demo-pajak-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `🔥 AKSI MOGOK & DEMONSTRASI NASIONAL: PENOLAKAN LONJAKAN ${taxName.toUpperCase()}`,
    sender: `Federasi Serikat Buruh & Asosiasi Pelaku Industri Nasional`,
    message: `Gelombang aksi unjuk rasa besar disertai aksi mogok kerja massal oleh sekitar ${demonstratorCount.toLocaleString('id-ID')} buruh dan pekerja meletus serentak menyusul kebijakan kenaikan tarif ${taxName} yang melonjak gila-gilaan sebesar +${rateDifference} poin (dari ${oldRate}% ke ${newRate}%). Ribuan demonstran menuntut pembatalan kenaikan beban pajak yang mencekik ekonomi rakyat!`,
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'demonstrasi_rakyat',
    cause: 'pajak',
    severity: 'ekstrem',
    details: { taxName, oldRate, newRate, rateDifference },
    demo_status: 'aktif',
    demonstratorCount,
  };
}

