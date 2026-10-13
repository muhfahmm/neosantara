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

export const CATEGORY = 'perumahan_subsidi';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    // 🔥 PERBAIKAN: Ubah 'perumahan_subsidi' menjadi 'rumah_subsidi' agar cocok dengan state React Anda
    buildingKey: 'rumah_subsidi', 
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