export type WarPartyIdentity = string | {
  name: string;
  iso?: string;
};

export type WarAnalysisSource = 'player' | 'ai' | 'pbb';

export interface ArmadaPowerBreakdownEntry {
  dataKey: string;
  groupId: string;
  quantity: number;
  totalPower: number;
}

export function combineMilitaryAidWithDefender({
  defenderDetail,
  defenderBreakdown,
  aidBreakdown,
  deploymentConfig,
  supportCountry,
}: {
  defenderDetail: unknown;
  defenderBreakdown: readonly ArmadaPowerBreakdownEntry[];
  aidBreakdown: readonly ArmadaPowerBreakdownEntry[];
  deploymentConfig: Record<string, unknown>;
  supportCountry: string;
}): { detail: unknown; addedPower: number } {
  const defender = defenderDetail !== null &&
    typeof defenderDetail === 'object' &&
    !Array.isArray(defenderDetail)
    ? defenderDetail as Record<string, unknown>
    : null;
  const hasDeploymentConfig = Object.values(deploymentConfig).some(
    value => typeof value === 'number' && Number.isFinite(value),
  );
  const combinedArmada: Record<string, Record<string, number>> = {
    darat: {},
    laut: {},
    udara: {},
  };
  const addUnits = (units: readonly ArmadaPowerBreakdownEntry[], isAid: boolean) => {
    let addedPower = 0;
    for (const unit of units) {
      if (
        unit.groupId !== 'darat' &&
        unit.groupId !== 'laut' &&
        unit.groupId !== 'udara'
      ) continue;

      const deploymentKey = unit.dataKey === 'pasukan_infanteri'
        ? 'barak'
        : unit.dataKey;
      const configuredPercent = deploymentConfig[deploymentKey];
      const percent = !isAid || !hasDeploymentConfig
        ? 100
        : typeof configuredPercent === 'number' && Number.isFinite(configuredPercent)
          ? Math.max(0, Math.min(100, configuredPercent))
          : 0;
      const quantity = Math.round(unit.quantity * percent / 100);
      if (quantity > 0) {
        combinedArmada[unit.groupId][unit.dataKey] =
          (combinedArmada[unit.groupId][unit.dataKey] || 0) + quantity;
      }
      if (isAid) addedPower += unit.totalPower * percent / 100;
    }
    return addedPower;
  };

  addUnits(defenderBreakdown, false);
  const addedPower = addUnits(aidBreakdown, true);
  if (!defender) return { detail: defenderDetail, addedPower };

  const existingSupportCountries = Array.isArray(defender.militarySupportCountries)
    ? defender.militarySupportCountries.filter(
      (country): country is string => typeof country === 'string',
    )
    : [];
  const militarySupportCountries = Array.from(new Set([
    ...existingSupportCountries,
    ...(supportCountry ? [supportCountry] : []),
  ]));
  const defenderArmada = defender.armada !== null &&
    typeof defender.armada === 'object' &&
    !Array.isArray(defender.armada)
    ? defender.armada as Record<string, unknown>
    : {};

  return {
    detail: {
      ...defender,
      armada: { ...defenderArmada, ...combinedArmada },
      militarySupportCountries,
    },
    addedPower,
  };
}

const normalizeCountry = (value: string): string =>
  value.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const countryAliases: Record<string, string> = {
  brasil: 'brazil',
  tiongkok: 'china',
};

function isSameCountry(left: WarPartyIdentity, right: WarPartyIdentity): boolean {
  const leftName = typeof left === 'string' ? left : left.name;
  const rightName = typeof right === 'string' ? right : right.name;
  const leftIso = typeof left === 'string' ? '' : left.iso?.trim().toLowerCase() ?? '';
  const rightIso = typeof right === 'string' ? '' : right.iso?.trim().toLowerCase() ?? '';
  if (leftIso && rightIso && leftIso === rightIso) return true;

  const normalizedLeft = normalizeCountry(leftName);
  const normalizedRight = normalizeCountry(rightName);
  return normalizedLeft === normalizedRight ||
    (countryAliases[normalizedLeft] ?? normalizedLeft) ===
    (countryAliases[normalizedRight] ?? normalizedRight);
}

export function shouldShowBattleAnalysis({
  attackers,
  targets,
  playerCountry,
  source,
}: {
  attackers: readonly WarPartyIdentity[];
  targets: readonly WarPartyIdentity[];
  playerCountry: WarPartyIdentity | null | undefined;
  source: WarAnalysisSource;
}): boolean {
  if (!playerCountry) return false;
  const involvedAsAttacker = attackers.some(attacker => isSameCountry(attacker, playerCountry));
  const involvedAsTarget = targets.some(target => isSameCountry(target, playerCountry));

  switch (source) {
    case 'player':
      return involvedAsAttacker;
    case 'ai':
    case 'pbb':
      return involvedAsAttacker || involvedAsTarget;
  }
  return false;
}
