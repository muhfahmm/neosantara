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

export const CATEGORY = 'hangar_tank';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'hangar_tank',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 500 },
      { group: 'pembangunan', label: 'besi', resourceKey: 'bijih_besi', amount: 400 },
      { group: 'pembangunan', label: 'batu bara', resourceKey: 'batu_bara', amount: 200 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 300 },
    ],
  },
  {
    buildingKey: 'tank_tempur_utama',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 15000 },
    ],
  },
  {
    buildingKey: 'apc_ifv',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 10000 },
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
