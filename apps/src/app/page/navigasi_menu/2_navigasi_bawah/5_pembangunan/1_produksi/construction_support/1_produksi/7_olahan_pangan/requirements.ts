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

export const CATEGORY = 'olahan pangan';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'air_mineral',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 33590 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32564 },
    ],
  },
  {
    buildingKey: 'gula',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 35128 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33077 },
    ],
  },
  {
    buildingKey: 'roti',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 33077 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32051 },
    ],
  },
  {
    buildingKey: 'pengolahan_daging',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34615 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32769 },
    ],
  },
  {
    buildingKey: 'mie_instan',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34103 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32359 },
    ],
  },
  {
    buildingKey: 'minyak_goreng',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 35641 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33385 },
    ],
  },
  {
    buildingKey: 'susu',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34410 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32667 },
    ],
  },
  {
    buildingKey: 'beras',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34615 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32769 },
    ],
  },
];

export function findRequirements(buildingKey: string) {
  const cleanKey = buildingKey.replace(/^\d+_/, '').replace(/^pabrik_pengolahan_/, '').replace(/^pabrik_/, '');
  return REQUIREMENTS.find((entry) => entry.buildingKey === buildingKey || entry.buildingKey === cleanKey);
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