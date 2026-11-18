export type SocialCulturalChangeType = 'religion' | 'ideology';

export const SOCIAL_CULTURAL_CHANGE_DELAY_DAYS = 3;

export interface PendingSocialCulturalChange {
  id: string;
  type: SocialCulturalChangeType;
  fromValue: string;
  toValue: string;
  startDate: string;
  endDate: string;
}

export function isPendingSocialCulturalChange(value: unknown): value is PendingSocialCulturalChange {
  if (typeof value !== 'object' || value === null) return false;
  const change = value as Record<string, unknown>;
  return typeof change.id === 'string' &&
    (change.type === 'religion' || change.type === 'ideology') &&
    typeof change.fromValue === 'string' &&
    typeof change.toValue === 'string' &&
    typeof change.startDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(change.startDate) &&
    typeof change.endDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(change.endDate);
}

export function formatSocialCulturalChangeDate(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return dateStr;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return dateStr;
  }

  const parts = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(date);
  const dayLabel = parts.find(part => part.type === 'day')?.value || '';
  const monthLabel = parts.find(part => part.type === 'month')?.value || '';
  const yearLabel = parts.find(part => part.type === 'year')?.value || '';
  return `${dayLabel} ${monthLabel}, ${yearLabel}`;
}

export function getSocialCulturalChangeEndDate(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) {
    throw new Error(`Tanggal simulasi tidak valid: ${dateStr}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Tanggal simulasi tidak valid: ${dateStr}`);
  }

  date.setUTCDate(date.getUTCDate() + SOCIAL_CULTURAL_CHANGE_DELAY_DAYS);
  return date.toISOString().slice(0, 10);
}

export function createPendingSocialCulturalChange(
  type: SocialCulturalChangeType,
  fromValue: string,
  toValue: string,
  startDate: string,
): PendingSocialCulturalChange {
  return {
    id: `${type}-change-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    fromValue,
    toValue,
    startDate,
    endDate: getSocialCulturalChangeEndDate(startDate),
  };
}
