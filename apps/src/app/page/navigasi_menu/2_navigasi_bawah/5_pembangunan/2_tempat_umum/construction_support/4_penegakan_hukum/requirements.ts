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

export const CATEGORY = 'penegakan hukum';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'pusat_bantuan_hukum',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 31538 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 30513 },
    ],
  },
  {
    buildingKey: 'pengadilan',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 33590 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31538 },
    ],
  },
  {
    buildingKey: 'kejaksaan',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32564 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31026 },
    ],
  },
  {
    buildingKey: 'pos_polisi',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 31026 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 30256 },
    ],
  },
  {
    buildingKey: 'armada_mobil_polisi',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32051 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 30769 },
    ],
  },
  {
    buildingKey: 'akademi_polisi',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34615 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32051 },
    ],
  },
  {
    buildingKey: 'indeks_korupsi',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 31538 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 30513 },
    ],
  },
  {
    buildingKey: 'indeks_keamanan',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 31538 },
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