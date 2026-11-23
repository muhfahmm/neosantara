export const ZERO_RELATION_WINDOW_DAYS = 30;
export const ZERO_RELATION_WINDOW_CHANCE_PERCENT = 80;

export type ZeroRelationInvasionFrequency = 'daily' | 'weekly' | 'yearly';

export interface ZeroRelationInvasionSchedule {
  windowStartedAt: string;
  fired: boolean;
  frequency?: ZeroRelationInvasionFrequency;
  lastCheckedDay?: number;
}

export interface ZeroRelationInvasionTarget {
  identity: string;
  country: string;
  frequency?: ZeroRelationInvasionFrequency;
}

export type ZeroRelationInvasionSchedules = Record<string, ZeroRelationInvasionSchedule>;

export function getDayNumber(dateString: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
  ) return null;

  return Math.floor(date.getTime() / 86_400_000);
}

/**
 * Menghitung peluang harian dari probabilitas akumulasi dalam periode jendela waktu (window).
 */
export function getZeroRelationInvasionDailyChancePercent(
  windowChancePercent: number,
  windowDays = ZERO_RELATION_WINDOW_DAYS
): number {
  const windowFailureChance = 1 - Math.min(100, Math.max(0, windowChancePercent)) / 100;
  return (1 - Math.pow(windowFailureChance, 1 / Math.max(1, windowDays))) * 100;
}

/**
 * Mendapatkan konfigurasi durasi window dan peluang dasar untuk masing-masing frekuensi:
 * - daily: evaluasi harian dengan jendela 1 hari (100% peluang per siklus harian)
 * - weekly: evaluasi mingguan dengan jendela 7 hari (90% peluang per siklus mingguan)
 * - yearly: evaluasi tahunan/jangka panjang dengan jendela 30 hari (80% peluang akumulatif per bulan)
 */
export function getFrequencyWindowConfig(frequency: ZeroRelationInvasionFrequency = 'yearly'): {
  windowDays: number;
  defaultChancePercent: number;
} {
  switch (frequency) {
    case 'daily':
      return { windowDays: 1, defaultChancePercent: 100 };
    case 'weekly':
      return { windowDays: 7, defaultChancePercent: 90 };
    case 'yearly':
    default:
      return { windowDays: ZERO_RELATION_WINDOW_DAYS, defaultChancePercent: ZERO_RELATION_WINDOW_CHANCE_PERCENT };
  }
}

/**
 * Melakukan pengecekan dan pengundian invasi untuk negara-negara yang memiliki hubungan 0.
 * Mendukung pembagian 3 waktu evaluasi: 'daily' (harian), 'weekly' (mingguan), dan 'yearly' (tahunan).
 */
export function rollZeroRelationInvasionWindows(
  currentDate: string,
  targets: readonly ZeroRelationInvasionTarget[],
  schedules: ZeroRelationInvasionSchedules | null | undefined,
  windowChancePercent?: number,
  rng: () => number = Math.random,
  defaultFrequency: ZeroRelationInvasionFrequency = 'yearly'
): { schedules: ZeroRelationInvasionSchedules; triggeredTargets: ZeroRelationInvasionTarget[] } {
  const currentDay = getDayNumber(currentDate);
  if (currentDay === null) return { schedules: {}, triggeredTargets: [] };

  const nextSchedules: ZeroRelationInvasionSchedules = {};
  const triggeredTargets: ZeroRelationInvasionTarget[] = [];

  for (const target of targets) {
    if (!target.identity || !target.country.trim()) continue;

    const frequency: ZeroRelationInvasionFrequency = target.frequency || defaultFrequency;
    const config = getFrequencyWindowConfig(frequency);
    const effectiveChancePercent = typeof windowChancePercent === 'number'
      ? windowChancePercent
      : config.defaultChancePercent;

    const previousSchedule = schedules?.[target.identity];
    const scheduleStartDay = previousSchedule
      ? getDayNumber(previousSchedule.windowStartedAt)
      : null;

    // Window baru dimulai jika belum pernah ada jadwal, waktu mundur, atau durasi jendela waktu habis
    const startsNewWindow = scheduleStartDay === null ||
      currentDay < scheduleStartDay ||
      currentDay - scheduleStartDay >= config.windowDays;

    const currentSchedule: ZeroRelationInvasionSchedule = startsNewWindow
      ? {
          windowStartedAt: currentDate,
          fired: false,
          ...(frequency !== 'yearly' ? { frequency } : {}),
        }
      : {
          ...previousSchedule!,
          ...(frequency !== 'yearly' ? { frequency } : {}),
        };

    if (currentSchedule.fired) {
      nextSchedules[target.identity] = currentSchedule;
      continue;
    }

    // Hitung peluang per hari sesuai frekuensi
    let rollChance: number;
    if (frequency === 'daily') {
      rollChance = effectiveChancePercent;
    } else if (frequency === 'weekly') {
      rollChance = getZeroRelationInvasionDailyChancePercent(effectiveChancePercent, 7);
    } else {
      rollChance = getZeroRelationInvasionDailyChancePercent(effectiveChancePercent, config.windowDays);
    }

    if (rng() * 100 < rollChance) {
      nextSchedules[target.identity] = { ...currentSchedule, fired: true };
      triggeredTargets.push({
        identity: target.identity,
        country: target.country,
        ...(frequency !== 'yearly' ? { frequency } : {}),
      });
    } else {
      nextSchedules[target.identity] = currentSchedule;
    }
  }

  return { schedules: nextSchedules, triggeredTargets };
}
