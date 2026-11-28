export type RequirementItem = {
  group: string;
  label: string;
  resourceKey: string;
  amount: number;
};

export type BuildingRequirements = {
  buildingKey: string;
  requirements: RequirementItem[];
};

export const CATEGORY = 'manufaktur';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'pabrik_semikonduktor',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 38205 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33590 },
    ],
  },
  {
    buildingKey: 'pabrik_mesin',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 35897 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33590 },
    ],
  },
  {
    buildingKey: 'pabrik_besi',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 35897 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33590 },
    ],
  },
  {
    buildingKey: 'semen_beton',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 35641 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33077 },
    ],
  },
  {
    buildingKey: 'kayu',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32564 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31538 },
    ],
  },
];

export function findRequirements(buildingKey: string) {
  return REQUIREMENTS.find((entry) => entry.buildingKey === buildingKey);
}

export function getTotalProduction(
  buildingKey: string,
  countryDetail: Record<string, unknown> | null,
  metadata: Record<string, { produksi?: unknown }> | null,
) {
  const count = Number(countryDetail?.[buildingKey] ?? 0);
  const productionPerUnit = Number(metadata?.[buildingKey]?.produksi ?? 0);
  return count * productionPerUnit;
}