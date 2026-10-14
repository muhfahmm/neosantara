export type EconomyNewsType = 'krisis_ekonomi' | 'pajak_baru';

export interface EconomyNewsData {
  id: string;
  type: EconomyNewsType;
  category: 'ekonomi_keuangan';
  countryName?: string;
  headline: string;
  content: string;
  timestamp: string;
  dateStr: string;
}

interface EconomyNotification {
  id?: string;
  title?: string;
  message?: string;
  timestamp?: string;
  tradeType?: string;
}

export function generateEconomicCrisisNotification(
  countryName: string,
  cashBalance: number,
  dateStr: string,
  eventNumber: number
) {
  return {
    id: `economic-crisis-${dateStr}-${eventNumber}`,
    title: 'Krisis Ekonomi: Kas Negara Berubah Negatif',
    sender: 'Kementerian Keuangan',
    message: `Kas negara ${countryName} telah berubah menjadi negatif (${new Intl.NumberFormat('id-ID').format(cashBalance)} NEO). Pemerintah perlu memulihkan kondisi fiskal.`,
    timestamp: dateStr,
    type: 'peringkat' as const,
    value: 0,
    isRead: false,
    tradeType: 'krisis_ekonomi',
  };
}

export function generateEconomyNews(
  notification: EconomyNotification
): EconomyNewsData | null {
  let type: EconomyNewsType | null = null;
  if (notification.tradeType === 'perubahan_pajak') {
    type = 'pajak_baru';
  } else if (notification.tradeType === 'krisis_ekonomi') {
    type = 'krisis_ekonomi';
  }
  if (!type) return null;

  const timestamp = notification.timestamp || new Date().toISOString().slice(0, 10);
  return {
    id: `news-${notification.id || `${timestamp}-${type}`}`,
    type,
    category: 'ekonomi_keuangan',
    headline: notification.title || (type === 'pajak_baru' ? 'Perubahan Kebijakan Pajak' : 'Krisis Ekonomi'),
    content: notification.message || '',
    timestamp,
    dateStr: timestamp,
  };
}
