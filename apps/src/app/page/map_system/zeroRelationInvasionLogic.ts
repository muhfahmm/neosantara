export const ZERO_RELATION_WINDOW_DAYS = 30;
export const ZERO_RELATION_WINDOW_CHANCE_PERCENT = 65;

export type ZeroRelationInvasionFrequency = 'daily' | 'weekly' | 'yearly';

export interface ZeroRelationInvasionSchedule {
  windowStartedAt: string;
  fired: boolean;
  frequency?: ZeroRelationInvasionFrequency;
  lastCheckedDay?: number;
  lastFiredDay?: number;
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
 * Konfigurasi realistis untuk masing-masing frekuensi:
 * - windowDays: Panjang satu siklus jendela probabilitas
 * - cooldownDays: Jeda realistis antar agresi militer (agar negara tidak spam menyerang beruntun tiap hari)
 * - defaultChancePercent: Target peluang akumulatif dalam satu window
 *
 * Logika Realistis:
 * 1. daily: Jendela 7 hari, cooldown 3 hari setelah invasi, peluang akumulatif 65% dalam 7 hari.
 * 2. weekly: Jendela 14 hari, cooldown 7 hari, peluang akumulatif 65% dalam 14 hari.
 * 3. yearly: Jendela 30 hari, cooldown 30 hari, peluang akumulatif 65% dalam 30 hari.
 */
export function getFrequencyWindowConfig(frequency: ZeroRelationInvasionFrequency = 'yearly'): {
  windowDays: number;
  cooldownDays: number;
  defaultChancePercent: number;
} {
  switch (frequency) {
    case 'daily':
      return { windowDays: 7, cooldownDays: 3, defaultChancePercent: ZERO_RELATION_WINDOW_CHANCE_PERCENT };
    case 'weekly':
      return { windowDays: 14, cooldownDays: 7, defaultChancePercent: ZERO_RELATION_WINDOW_CHANCE_PERCENT };
    case 'yearly':
    default:
      return { windowDays: ZERO_RELATION_WINDOW_DAYS, cooldownDays: ZERO_RELATION_WINDOW_DAYS, defaultChancePercent: ZERO_RELATION_WINDOW_CHANCE_PERCENT };
  }
}

/**
 * Melakukan pengecekan dan pengundian invasi untuk negara-negara yang memiliki hubungan 0.
 * Menjamin frekuensi realistis dengan cooldown sehingga tidak terjadi spam serangan berturut-turut.
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
          ...(previousSchedule?.lastFiredDay !== undefined ? { lastFiredDay: previousSchedule.lastFiredDay } : {}),
          ...(frequency !== 'yearly' ? { frequency } : {}),
        }
      : {
          ...previousSchedule!,
          ...(frequency !== 'yearly' ? { frequency } : {}),
        };

    // Jika sudah pernah menembak dalam window ini, pertahankan
    if (currentSchedule.fired) {
      nextSchedules[target.identity] = currentSchedule;
      continue;
    }

    // Cek cooldown realistis antar serangan militer
    if (
      currentSchedule.lastFiredDay !== undefined &&
      currentDay - currentSchedule.lastFiredDay < config.cooldownDays
    ) {
      nextSchedules[target.identity] = currentSchedule;
      continue;
    }

    // Hitung peluang per hari yang terdistribusi secara matematis sesuai target window (misal 65% akumulatif)
    const dailyChance = getZeroRelationInvasionDailyChancePercent(effectiveChancePercent, config.windowDays);

    if (rng() * 100 < dailyChance) {
      nextSchedules[target.identity] = {
        ...currentSchedule,
        fired: true,
        lastFiredDay: currentDay,
      };
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
