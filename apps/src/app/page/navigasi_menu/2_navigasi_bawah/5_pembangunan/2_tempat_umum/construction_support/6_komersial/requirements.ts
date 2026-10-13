export type RequirementItem = {
  group: string;
  label: string;
  resourceKey: string;
  amount: number; // ✅ Ditambahkan
};

export type BuildingRequirements = {
  buildingKey: string;
  requirements: RequirementItem[];
};

export const CATEGORY = 'komersial';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'mall',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 39744 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32564 },
      { group: 'pembangunan', label: 'besi', resourceKey: 'bijih_besi', amount: 31538 },
    ],
  },
  {
    buildingKey: 'hotel',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 37692 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32051 },
      { group: 'pembangunan', label: 'besi', resourceKey: 'bijih_besi', amount: 31026 },
    ],
  },
  {
    buildingKey: 'pusat_grosir_tekstil',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34615 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31538 },
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