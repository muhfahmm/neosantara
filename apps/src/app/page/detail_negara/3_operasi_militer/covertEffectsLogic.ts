export const COVERT_OPS_EFFECT_CONFIG = {
  notificationExpiryDays: 14,
  espionageMultiplier: 0.95,
  espionageDurationDays: {
    minimum: 30,
    maximum: 60,
  },
  sabotageLossRate: 0.05,
  sabotageMinimumLoss: 1,
  excludedSabotageUnitKeys: ['pasukan_infanteri'],
} as const;

export interface ActiveEspionageEffect {
  effectType: 'covert_spionage';
  id: string;
  startDate: string;
  durationDays: number;
  remainingDays: number;
  multiplier: number;
  sourceNotificationIds: string[];
}

export interface SabotageUnitLoss {
  unitKey: string;
  previousQuantity: number;
  lostQuantity: number;
  remainingQuantity: number;
}

export interface ArmadaEquipmentCountUpdate {
  unitKey: string;
  groupId: string;
  quantity: number;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function rollEspionageDuration(rng: () => number = Math.random): number {
  const { minimum, maximum } = COVERT_OPS_EFFECT_CONFIG.espionageDurationDays;
  const roll = Math.min(1 - Number.EPSILON, Math.max(0, rng()));
  return minimum + Math.floor(roll * (maximum - minimum + 1));
}

export function getElapsedGameDays(startDate: string, currentDate: string): number | null {
  const startTime = Date.parse(`${startDate.slice(0, 10)}T00:00:00Z`);
  const currentTime = Date.parse(`${currentDate.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(startTime) || !Number.isFinite(currentTime)) return null;
  return Math.max(0, Math.floor((currentTime - startTime) / 86_400_000));
}

export function applySabotageLosses(
  equipment: Readonly<Record<string, number>>,
  config: typeof COVERT_OPS_EFFECT_CONFIG = COVERT_OPS_EFFECT_CONFIG,
): { equipment: Record<string, number>; losses: SabotageUnitLoss[] } {
  const excludedUnitKeys = new Set<string>(config.excludedSabotageUnitKeys);
  const updatedEquipment: Record<string, number> = {};
  const losses: SabotageUnitLoss[] = [];

  for (const [unitKey, rawQuantity] of Object.entries(equipment)) {
    const quantity = Number.isFinite(rawQuantity) ? Math.max(0, rawQuantity) : 0;
    if (excludedUnitKeys.has(unitKey) || quantity === 0) {
      updatedEquipment[unitKey] = quantity;
      continue;
    }

    const lostQuantity = Math.min(
      quantity,
      Math.max(config.sabotageMinimumLoss, Math.floor(quantity * config.sabotageLossRate)),
    );
    const remainingQuantity = Math.max(0, quantity - lostQuantity);
    updatedEquipment[unitKey] = remainingQuantity;
    losses.push({ unitKey, previousQuantity: quantity, lostQuantity, remainingQuantity });
  }

  return { equipment: updatedEquipment, losses };
}

export function updateArmadaEquipmentCounts(
  countryDetail: Readonly<Record<string, unknown>>,
  updates: readonly ArmadaEquipmentCountUpdate[],
): Record<string, unknown> {
  const updatedDetail: Record<string, unknown> = { ...countryDetail };
  const updatedArmada: Record<string, unknown> = { ...asRecord(countryDetail.armada) };

  for (const update of updates) {
    const groupKey = update.groupId;
    const currentArmadaGroup = asRecord(updatedArmada[groupKey]);
    updatedArmada[groupKey] = { ...currentArmadaGroup, [update.unitKey]: update.quantity };
    if (Object.prototype.hasOwnProperty.call(updatedArmada, update.unitKey)) {
      updatedArmada[update.unitKey] = update.quantity;
    }

    if (Object.prototype.hasOwnProperty.call(countryDetail, update.unitKey)) {
      updatedDetail[update.unitKey] = update.quantity;
    }
    if (Object.prototype.hasOwnProperty.call(countryDetail, groupKey)) {
      const currentGroup = asRecord(updatedDetail[groupKey]);
      updatedDetail[groupKey] = { ...currentGroup, [update.unitKey]: update.quantity };
    }
    const defense = asRecord(updatedDetail.pertahanan);
    if (Object.prototype.hasOwnProperty.call(defense, update.unitKey)) {
      updatedDetail.pertahanan = { ...defense, [update.unitKey]: update.quantity };
    }
  }

  updatedDetail.armada = updatedArmada;
  return updatedDetail;
}

export function getEspionageMultiplier(
  activeEffects: readonly Pick<ActiveEspionageEffect, 'remainingDays'>[],
): number {
  return activeEffects.some(effect => effect.remainingDays > 0)
    ? COVERT_OPS_EFFECT_CONFIG.espionageMultiplier
    : 1;
}

export function addEspionageEffect(
  activeEffects: readonly ActiveEspionageEffect[],
  notificationId: string,
  currentDate: string,
  durationDays: number,
): ActiveEspionageEffect[] {
  const active = activeEffects
    .map(effect => {
      const elapsedDays = getElapsedGameDays(effect.startDate, currentDate);
      return {
        ...effect,
        remainingDays: elapsedDays === null
          ? 0
          : Math.max(0, effect.durationDays - elapsedDays),
      };
    })
    .filter(effect => effect.remainingDays > 0)
    .sort((first, second) => second.remainingDays - first.remainingDays)[0];
  const sourceNotificationIds = Array.from(new Set([
    ...(active?.sourceNotificationIds || (active ? [active.id] : [])),
    notificationId,
  ]));

  if (!active) {
    return [{
      effectType: 'covert_spionage',
      id: notificationId,
      startDate: currentDate,
      durationDays,
      remainingDays: durationDays,
      multiplier: COVERT_OPS_EFFECT_CONFIG.espionageMultiplier,
      sourceNotificationIds,
    }];
  }

  const extendFromNow = durationDays > active.remainingDays;
  const nextDuration = extendFromNow ? durationDays : active.durationDays;
  return [{
    ...active,
    effectType: 'covert_spionage',
    startDate: extendFromNow ? currentDate : active.startDate,
    durationDays: nextDuration,
    remainingDays: Math.max(active.remainingDays, durationDays),
    multiplier: COVERT_OPS_EFFECT_CONFIG.espionageMultiplier,
    sourceNotificationIds,
  }];
}

export function parseActiveEspionageEffects(value: unknown): ActiveEspionageEffect[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): ActiveEspionageEffect[] => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [];
    const record = entry as Record<string, unknown>;
    if (
      typeof record.id !== 'string' ||
      typeof record.startDate !== 'string' ||
      record.effectType !== 'covert_spionage' ||
      !Number.isFinite(Number(record.durationDays))
    ) return [];

    const sourceNotificationIds = Array.isArray(record.sourceNotificationIds)
      ? record.sourceNotificationIds.filter((id): id is string => typeof id === 'string')
      : [record.id];
    return [{
      effectType: 'covert_spionage',
      id: record.id,
      startDate: record.startDate,
      durationDays: Math.max(0, Number(record.durationDays)),
      remainingDays: Math.max(0, Number(record.remainingDays) || 0),
      multiplier: COVERT_OPS_EFFECT_CONFIG.espionageMultiplier,
      sourceNotificationIds,
    }];
  });
}
