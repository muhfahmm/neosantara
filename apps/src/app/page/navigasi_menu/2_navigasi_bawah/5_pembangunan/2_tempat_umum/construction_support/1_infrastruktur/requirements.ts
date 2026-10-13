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

export const CATEGORY = 'infrastruktur';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'jalur_sepeda',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 31026 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 30000 },
    ],
  },
  {
    buildingKey: 'jalan_raya',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32564 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31026 },
    ],
  },
  {
    buildingKey: 'terminal_bus',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 33590 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31538 },
    ],
  },
  {
    buildingKey: 'stasiun_kereta_api',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34615 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32051 },
    ],
  },
  {
    buildingKey: 'kereta_bawah_tanah',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 37692 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33077 },
    ],
  },
  {
    buildingKey: 'pelabuhan',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 36667 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32564 },
    ],
  },
  {
    buildingKey: 'bandara',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 41795 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 34615 },
    ],
  },
  {
    buildingKey: 'helipad',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 35641 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32051 },
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