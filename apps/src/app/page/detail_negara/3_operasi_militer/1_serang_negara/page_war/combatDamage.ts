import damageProfileData from './python/combat_damage_profiles.json';

export interface UnitDamageProfile {
  base_damage: number;
  damage_per_sqrt_unit: number;
  penetration: number;
  base_attack_range: number;
}

const profiles = damageProfileData.units as Record<string, UnitDamageProfile>;
const targetArmor = damageProfileData.target_armor as Record<string, number>;

export function getUnitDamageProfile(kind: string): UnitDamageProfile {
  return profiles[kind] ?? {
    base_damage: 20,
    damage_per_sqrt_unit: 2,
    penetration: 0.75,
    base_attack_range: 750,
  };
}

export function getUnitAttackRadius(kind: string, quantity: number): number {
  const profile = getUnitDamageProfile(kind);
  const safeQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
  const strengthFactor = 1 + Math.min(Math.log(safeQuantity + 1), 6) / 12;
  return profile.base_attack_range * strengthFactor;
}

export function calculateDamagePotential(attackerKind: string, attackerQuantity: number): number {
  const quantity = Number.isFinite(attackerQuantity) ? Math.max(0, attackerQuantity) : 0;
  const profile = getUnitDamageProfile(attackerKind);
  return profile.base_damage + Math.sqrt(quantity) * profile.damage_per_sqrt_unit;
}

export function calculateUnitDamage(
  damagePotential: number,
  penetration: number,
  targetKind: string,
  targetQuantity: number,
): number {
  const remaining = Number.isFinite(targetQuantity) ? Math.max(0, Math.floor(targetQuantity)) : 0;
  if (remaining <= 0) return 0;

  const safePotential = Number.isFinite(damagePotential) ? Math.max(0, damagePotential) : 0;
  const safePenetration = Number.isFinite(penetration) ? Math.max(0, penetration) : 0;
  const armor = targetArmor[targetKind] ?? 1;
  const casualties = Math.round((safePotential * safePenetration) / armor);
  return Math.min(remaining, Math.max(1, casualties));
}

export function calculateUnitDamageLoss(
  attackerKind: string,
  attackerQuantity: number,
  targetKind: string,
  targetQuantity: number,
): number {
  const { penetration } = getUnitDamageProfile(attackerKind);
  return calculateUnitDamage(
    calculateDamagePotential(attackerKind, attackerQuantity),
    penetration,
    targetKind,
    targetQuantity,
  );
}
