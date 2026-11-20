import idInbox from '@/app/page/paused_menu/terjemahan_paused_menu/id/side_menu/inbox/inbox.json';

export type InboxMessageParams = Record<string, string | number>;
type TranslationFunction = (key: string, params?: InboxMessageParams) => string;

interface InboxNotificationText {
  message: string;
  messageKey: string;
  messageParams: InboxMessageParams;
  messageParamKeys: Record<string, string>;
}

function getIdTemplate(key: string): string {
  const path = key.split('.').slice(1);
  let value: unknown = idInbox;
  for (const segment of path) {
    if (!value || typeof value !== 'object') {
      throw new Error(`Missing Indonesian inbox message template: ${key}`);
    }
    value = (value as Record<string, unknown>)[segment];
  }
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing Indonesian inbox message template: ${key}`);
  }
  return value;
}

function interpolate(template: string, params: InboxMessageParams): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

export function getDefaultInboxText(
  key: string,
  params: InboxMessageParams = {}
): string {
  return interpolate(getIdTemplate(key), params);
}

export function createInboxNotificationText(
  messageKey: string,
  messageParams: InboxMessageParams,
  messageParamKeys: Record<string, string> = {}
): InboxNotificationText {
  return {
    message: getDefaultInboxText(messageKey, messageParams),
    messageKey,
    messageParams,
    messageParamKeys,
  };
}

export function getInboxNotificationMessage(
  notification: {
    message: string;
    messageKey?: string;
    messageParams?: InboxMessageParams;
    messageParamKeys?: Record<string, string>;
  },
  t: TranslationFunction
): string {
  if (!notification.messageKey) return notification.message;
  const params = { ...notification.messageParams };
  for (const [name, key] of Object.entries(notification.messageParamKeys ?? {})) {
    params[name] = t(key);
  }
  return t(notification.messageKey, params);
}
