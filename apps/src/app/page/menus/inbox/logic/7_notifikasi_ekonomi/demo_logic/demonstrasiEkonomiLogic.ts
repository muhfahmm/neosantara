// File: demonstrasiEkonomiLogic.ts

import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface DemonstrasiNotification extends NotificationMessage {
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
  const titleKey = 'side_inbox.demo.generated.subsidyTitle';
  const titleParams = { subsidyName };
  const senderKey = 'side_inbox.demo.generated.subsidySender';
  const messageKey = 'side_inbox.demo.generated.subsidyMessage';
  const messageParams = { subsidyName, demonstratorCount };
  return {
    id: `demo-subsidi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText(messageKey, messageParams),
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
  const direction = isExtreme ? 'extreme' : 'standard';
  const formatPrice = (price: number) => price.toLocaleString('id-ID');
  const titleKey = `side_inbox.demo.generated.price${direction}Title`;
  const titleParams = { itemName, oldPrice: formatPrice(oldPrice), newPrice: formatPrice(newPrice) };
  const senderKey = 'side_inbox.demo.generated.priceSender';
  const messageKey = `side_inbox.demo.generated.price${direction}Message`;
  const messageParams = {
    itemName,
    oldPrice: formatPrice(oldPrice),
    newPrice: formatPrice(newPrice),
    levelJump,
    demonstratorCount,
  };

  return {
    id: `demo-harga-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText(messageKey, messageParams),
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
  const titleKey = 'side_inbox.demo.generated.taxTitle';
  const titleParams = { taxName, oldRate, newRate };
  const senderKey = 'side_inbox.demo.generated.taxSender';
  const messageKey = 'side_inbox.demo.generated.taxMessage';
  const messageParams = { taxName, oldRate, newRate, rateDifference, demonstratorCount };
  return {
    id: `demo-pajak-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText(messageKey, messageParams),
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

