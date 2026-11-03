export type RelationTierLevel = 'sangat_buruk' | 'buruk' | 'netral' | 'baik' | 'sangat_baik';

export interface RelationTier {
  id: RelationTierLevel;
  min: number;
  max: number;
  label: string;
  hex: string;
  textColor: string;
  badgeClassName: string;
}

export const RELATION_TIERS: readonly RelationTier[] = [
  {
    id: 'sangat_buruk',
    min: 0,
    max: 25,
    label: 'Sangat Buruk',
    hex: '#f87171', // red-400
    textColor: 'text-red-400',
    badgeClassName: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  {
    id: 'buruk',
    min: 26,
    max: 40,
    label: 'Buruk',
    hex: '#fb7185', // rose-400
    textColor: 'text-rose-400',
    badgeClassName: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  {
    id: 'netral',
    min: 41,
    max: 65,
    label: 'Netral',
    hex: '#facc15', // yellow-400
    textColor: 'text-yellow-400',
    badgeClassName: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  },
  {
    id: 'baik',
    min: 66,
    max: 80,
    label: 'Baik',
    hex: '#4ade80', // green-400
    textColor: 'text-green-400',
    badgeClassName: 'bg-green-500/15 text-green-400 border-green-500/30',
  },
  {
    id: 'sangat_baik',
    min: 81,
    max: 100,
    label: 'Sangat Baik',
    hex: '#00FFAA', // mint/neon green
    textColor: 'text-[#00FFAA]',
    badgeClassName: 'bg-[#00FFAA]/15 text-[#00FFAA] border-[#00FFAA]/30',
  },
] as const;

export function getRelationTier(value: number): RelationTier {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  for (const tier of RELATION_TIERS) {
    if (clamped >= tier.min && clamped <= tier.max) {
      return tier;
    }
  }
  return RELATION_TIERS[2]; // Default to Netral if somehow out of bounds
}

export function getRelationColor(value: number): string {
  return getRelationTier(value).hex;
}

export function getRelationTextColor(value: number): string {
  return getRelationTier(value).textColor;
}

export function getRelationBadge(value: number): { alias: string; className: string; hex: string } {
  const tier = getRelationTier(value);
  return {
    alias: tier.label,
    className: tier.badgeClassName,
    hex: tier.hex,
  };
}

