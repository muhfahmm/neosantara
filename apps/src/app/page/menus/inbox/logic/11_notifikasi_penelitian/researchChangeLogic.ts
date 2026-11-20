import { NotificationMessage } from '../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../notificationMessage';

export interface ResearchChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_fokus_riset';
  categoryKey: 'ekonomi' | 'militer' | 'diplomasi';
  categoryName: string;
  focusScope: string;
  focusScopeKey: string;
  focusScopeParams?: Record<string, string | number>;
}

const RESEARCH_LABELS: Record<string, { nameKey: string; scopeKey: string; descriptionKey: string }> = {
  ekonomi: {
    nameKey: 'side_inbox.researchNotification.categories.ekonomi.name',
    scopeKey: 'side_inbox.researchNotification.categories.ekonomi.scope',
    descriptionKey: 'side_inbox.researchNotification.categories.ekonomi.description',
  },
  militer: {
    nameKey: 'side_inbox.researchNotification.categories.militer.name',
    scopeKey: 'side_inbox.researchNotification.categories.militer.scope',
    descriptionKey: 'side_inbox.researchNotification.categories.militer.description',
  },
  diplomasi: {
    nameKey: 'side_inbox.researchNotification.categories.diplomasi.name',
    scopeKey: 'side_inbox.researchNotification.categories.diplomasi.scope',
    descriptionKey: 'side_inbox.researchNotification.categories.diplomasi.description',
  },
};

export function generateResearchChangeNotification(
  categoryKey: 'ekonomi' | 'militer' | 'diplomasi',
  dateStr: string
): ResearchChangeNotification {
  const info = RESEARCH_LABELS[categoryKey];
  const titleKey = 'side_inbox.researchNotification.focusTitle';
  const messageKey = 'side_inbox.researchNotification.focusMessage';
  const senderKey = 'side_inbox.researchNotification.sender';
  const name = getDefaultInboxText(info.nameKey);
  const scope = getDefaultInboxText(info.scopeKey);
  const description = getDefaultInboxText(info.descriptionKey);

  return {
    id: `research-focus-${categoryKey}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: getDefaultInboxText(titleKey),
    titleKey,
    sender: getDefaultInboxText(senderKey),
    senderKey,
    ...createInboxNotificationText(messageKey, { name, scope, description }, {
      name: info.nameKey,
      scope: info.scopeKey,
      description: info.descriptionKey,
    }),
    timestamp: dateStr,
    type: 'kepuasan',
    value: 10,
    isRead: false,
    tradeType: 'perubahan_fokus_riset',
    categoryKey,
    categoryName: name,
    focusScope: scope,
    focusScopeKey: info.scopeKey,
  };
}

export function generateResearchStartNotification(
  researchName: string,
  categoryKey: string,
  durationDays: number,
  dateStr: string,
  isUpgrade: boolean = false,
  targetLevel: number = 1
): ResearchChangeNotification {
  const validCategoryKey = (categoryKey === 'lingkungan' ? 'ekonomi' : categoryKey) as 'ekonomi' | 'militer' | 'diplomasi';
  const info = RESEARCH_LABELS[validCategoryKey] ?? {
    nameKey: 'side_inbox.researchNotification.fallbackName',
    scopeKey: 'side_inbox.researchNotification.fallbackScope',
    descriptionKey: 'side_inbox.researchNotification.fallbackDescription',
  };
  const titleKey = isUpgrade
    ? 'side_inbox.researchNotification.upgradeTitle'
    : 'side_inbox.researchNotification.startTitle';
  const senderKey = 'side_inbox.researchNotification.sender';
  const messageKey = isUpgrade
    ? 'side_inbox.researchNotification.upgradeMessage'
    : 'side_inbox.researchNotification.startMessage';
  const focusScopeKey = isUpgrade
    ? 'side_inbox.researchNotification.upgradeScope'
    : 'side_inbox.researchNotification.newScope';
  const focusScopeParams = isUpgrade ? { level: targetLevel } : undefined;
  const title = getDefaultInboxText(titleKey);
  const sender = getDefaultInboxText(senderKey);
  const focusScope = getDefaultInboxText(focusScopeKey, focusScopeParams);
  const messageParams = { research: researchName, level: targetLevel, duration: durationDays };

  return {
    id: `research-start-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title,
    titleKey,
    sender,
    senderKey,
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp: dateStr,
    type: 'kepuasan',
    value: 10,
    isRead: false,
    tradeType: 'perubahan_fokus_riset',
    categoryKey: validCategoryKey,
    categoryName: getDefaultInboxText(info.nameKey),
    focusScope,
    focusScopeKey,
    focusScopeParams,
  };
}
