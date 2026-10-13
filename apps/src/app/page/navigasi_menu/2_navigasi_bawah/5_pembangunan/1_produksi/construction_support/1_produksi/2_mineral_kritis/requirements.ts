export type RequirementItem = {
  group: string;
  label: string;
  resourceKey: string;
  amount: number; // wajib
};

export type BuildingRequirements = {
  buildingKey: string;
  requirements: RequirementItem[];
};

export const CATEGORY = 'mineral kritis';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'emas',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 35641 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33077 },
    ],
  },
  {
    buildingKey: 'uranium',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 38718 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33590 },
    ],
  },
  {
    buildingKey: 'batu_bara',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34615 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32051 },
    ],
  },
  {
    buildingKey: 'minyak_bumi',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 37692 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 34103 },
    ],
  },
  {
    buildingKey: 'gas_alam',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 37179 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32564 },
    ],
  },
  {
    buildingKey: 'garam',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 32564 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31538 },
    ],
  },
  {
    buildingKey: 'litium',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 38205 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33385 },
    ],
  },
  {
    buildingKey: 'logam_tanah_jarang',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 39231 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33795 },
    ],
  },
  {
    buildingKey: 'bijih_besi',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 36667 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32769 },
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