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
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 30513 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 30000 },
    ],
  },
  {
    buildingKey: 'dasar',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 31026 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 30256 },
    ],
  },
  {
    buildingKey: 'menengah',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 31538 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 30513 },
    ],
  },
  {
    buildingKey: 'lanjutan',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32051 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 30769 },
    ],
  },
  {
    buildingKey: 'universitas',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 35641 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32564 },
    ],
  },
  {
    buildingKey: 'lembaga_pendidikan',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32564 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31026 },
    ],
  },
  {
    buildingKey: 'laboratorium',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 33590 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31538 },
    ],
  },
  {
    buildingKey: 'observatorium',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34615 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32051 },
    ],
  },
  {
    buildingKey: 'pusat_penelitian',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34103 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31538 },
    ],
  },
  {
    buildingKey: 'pusat_pengembangan',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 33077 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31026 },
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