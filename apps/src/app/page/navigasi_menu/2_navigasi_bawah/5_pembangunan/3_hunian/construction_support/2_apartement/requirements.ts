export type RequirementItem = {
  group: string;
  label: string;
  resourceKey: string;
  amount: number;   // wajib
};

export type BuildingRequirements = {
  buildingKey: string;
  requirements: RequirementItem[];
};

export const CATEGORY = 'apartemen';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'apartemen',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34615 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32051 },
      { group: 'pembangunan', label: 'bijih besi', resourceKey: 'bijih_besi', amount: 30513 },
    ],
  },
];

export function findRequirements(buildingKey: string) {
  return REQUIREMENTS.find((entry) => entry.buildingKey === buildingKey);
}

export function getTotalProduction(
  buildingKey: string,
  countryDetail: Record<string, any> | null,
  metadata: Record<string, any> | null,
) {
  const count = Number(countryDetail?.[buildingKey] ?? 0);
  const productionPerUnit = Number(metadata?.[buildingKey]?.produksi ?? 0);
  return count * productionPerUnit;
}