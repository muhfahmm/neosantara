export type WarPartyIdentity = string | {
  name: string;
  iso?: string;
};

export type WarAnalysisSource = 'player' | 'ai' | 'pbb';

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
