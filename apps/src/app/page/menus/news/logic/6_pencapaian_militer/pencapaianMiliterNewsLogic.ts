export interface MilitaryAchievementNewsData {
  id: string;
  type: 'program_nuklir';
  category: 'pencapaian_militer';
  countryName?: string;
  headline: string;
  content: string;
  timestamp: string;
  dateStr: string;
}

interface MilitaryNotification {
  id?: string;
  title?: string;
  message?: string;
  timestamp?: string;
  tradeType?: string;
}

export function generateMilitaryAchievementNews(
  notification: MilitaryNotification
): MilitaryAchievementNewsData | null {
  if (
    notification.tradeType !== 'program_nuklir_dimulai' &&
    notification.tradeType !== 'program_nuklir_selesai' &&
    notification.tradeType !== 'icbm' &&
    notification.tradeType !== 'icbm_dimulai' &&
    notification.tradeType !== 'icbm_selesai'
  ) {
    return null;
  }

  const timestamp = notification.timestamp || new Date().toISOString().slice(0, 10);
  return {
    id: `news-${notification.id || `${timestamp}-${notification.tradeType}`}`,
    type: 'program_nuklir',
    category: 'pencapaian_militer',
    headline: notification.title || 'Pencapaian Rudal & Nuklir Strategis',
    content: notification.message || '',
    timestamp,
    dateStr: timestamp,
  };
}

