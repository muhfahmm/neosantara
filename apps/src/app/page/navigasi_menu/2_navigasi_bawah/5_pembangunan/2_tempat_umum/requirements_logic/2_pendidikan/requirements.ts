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

export const CATEGORY = 'pendidikan';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'prasekolah',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 100 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 50 },
    ],
  },
  {
    buildingKey: 'dasar',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 150 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 75 },
    ],
  },
  {
    buildingKey: 'menengah',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 200 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 100 },
    ],
  },
  {
    buildingKey: 'lanjutan',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 250 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 125 },
    ],
  },
  {
    buildingKey: 'universitas',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 600 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 300 },
    ],
  },
  {
    buildingKey: 'lembaga_pendidikan',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 300 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 150 },
    ],
  },
  {
    buildingKey: 'laboratorium',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 400 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 200 },
    ],
  },
  {
    buildingKey: 'observatorium',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 500 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 250 },
    ],
  },
  {
    buildingKey: 'pusat_penelitian',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 450 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 200 },
    ],
  },
  {
    buildingKey: 'pusat_pengembangan',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 350 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 150 },
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