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

export const CATEGORY = 'kesehatan';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'rumah_sakit_besar',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 37692 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32564 },
    ],
  },
  {
    buildingKey: 'rumah_sakit_kecil',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 33590 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31026 },
    ],
  },
  {
    buildingKey: 'pusat_diagnostik',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34615 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31538 },
    ],
  },
  {
    buildingKey: 'harapan_hidup',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32564 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 30513 },
    ],
  },
  {
    buildingKey: 'indeks_kesehatan',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32564 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 30513 },
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