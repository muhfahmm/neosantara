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
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 850 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 400 },
    ],
  },
  {
    buildingKey: 'pabrik_mesin',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 625 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 400 },
    ],
  },
  {
    buildingKey: 'pabrik_besi',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 625 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 400 },
    ],
  },
  {
    buildingKey: 'semen_beton',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 600 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 350 },
    ],
  },
  {
    buildingKey: 'kayu',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 300 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 200 },
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