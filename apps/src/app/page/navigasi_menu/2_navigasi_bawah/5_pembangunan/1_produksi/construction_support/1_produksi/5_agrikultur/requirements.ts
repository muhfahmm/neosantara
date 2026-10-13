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

export const CATEGORY = 'agrikultur';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'padi',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32564 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31538 },
    ],
  },
  {
    buildingKey: 'gandum',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32359 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31641 },
    ],
  },
  {
    buildingKey: 'jagung',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32154 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31744 },
    ],
  },
  {
    buildingKey: 'sayur',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 31949 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31846 },
    ],
  },
  {
    buildingKey: 'umbi',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 31744 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31538 },
    ],
  },
  {
    buildingKey: 'kedelai',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32051 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31949 },
    ],
  },
  {
    buildingKey: 'kelapa_sawit',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 33590 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32564 },
    ],
  },
  {
    buildingKey: 'kopi',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 33077 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32359 },
    ],
  },
  {
    buildingKey: 'teh',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32769 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32256 },
    ],
  },
  {
    buildingKey: 'kakao',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 33385 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32462 },
    ],
  },
  {
    buildingKey: 'tebu',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32667 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32154 },
    ],
  },
  {
    buildingKey: 'karet',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 33795 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32667 },
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