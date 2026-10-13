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

export const CATEGORY = 'infanteri';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'barak',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 250 },
      { group: 'pembangunan', label: 'batu bara', resourceKey: 'batu_bara', amount: 100 },
      { group: 'pembangunan', label: 'besi', resourceKey: 'bijih_besi', amount: 150 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 200 },
    ],
  },
  {
    buildingKey: 'pasukan_infanteri',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 5000 },
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
