export type DiplomacyNewsType =
  | 'pakta_non_agresi'
  | 'aliansi_pertahanan'
  | 'perjanjian_dagang'
  | 'kontrak_penelitian'
  | 'sanksi_ekonomi';

export interface DiplomacyNewsData {
  id: string;
  type: DiplomacyNewsType;
  category: 'diplomasi';
  headline: string;
  content: string;
  timestamp: string;
  dateStr: string;
}

interface DiplomacyNotification {
  id?: string;
  title?: string;
  message?: string;
  timestamp?: string;
}

const diplomacyNewsTypes: Array<[RegExp, DiplomacyNewsType]> = [
  [/pakta non[- ]agresi/i, 'pakta_non_agresi'],
  [/aliansi pertahanan/i, 'aliansi_pertahanan'],
  [/(perjanjian|hubungan) dagang/i, 'perjanjian_dagang'],
  [/kontrak penelitian/i, 'kontrak_penelitian'],
  [/sanksi ekonomi/i, 'sanksi_ekonomi'],
];

export function generateDiplomacyNews(
  notification: DiplomacyNotification
): DiplomacyNewsData | null {
  const title = notification.title || '';
  const searchableText = `${title} ${notification.message || ''}`;
  const matchedType = diplomacyNewsTypes.find(([pattern]) => pattern.test(searchableText))?.[1];
  if (!matchedType) return null;

  const timestamp = notification.timestamp || new Date().toISOString().slice(0, 10);
  return {
    id: `news-${notification.id || `${timestamp}-${title}`}`,
    type: matchedType,
    category: 'diplomasi',
    headline: title,
    content: notification.message || '',
    timestamp,
    dateStr: timestamp,
  };
}
