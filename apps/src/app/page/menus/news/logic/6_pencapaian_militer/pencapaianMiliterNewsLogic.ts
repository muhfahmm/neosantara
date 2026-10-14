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
    notification.tradeType !== 'program_nuklir_selesai'
  ) {
    return null;
  }

  const timestamp = notification.timestamp || new Date().toISOString().slice(0, 10);
  return {
    id: `news-${notification.id || `${timestamp}-program-nuklir`}`,
    type: 'program_nuklir',
    category: 'pencapaian_militer',
    headline: notification.title || 'Program Nuklir',
    content: notification.message || '',
    timestamp,
    dateStr: timestamp,
  };
}
