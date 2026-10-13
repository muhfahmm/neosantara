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

export const CATEGORY = 'kelistrikan';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'pembangkit_listrik_tenaga_gas',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34615 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32564 },
      { group: 'bahan bakar', label: 'gas alam', resourceKey: 'gas_alam', amount: 2 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_air',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 37692 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33590 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_nuklir',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 39744 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33077 },
      { group: 'bahan bakar', label: 'uranium', resourceKey: 'uranium', amount: 1 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_surya',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34103 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 31538 },
      { group: 'pembangunan', label: 'ltj', resourceKey: 'logam_tanah_jarang', amount: 32051 },
      { group: 'pembangunan', label: 'bijih besi', resourceKey: 'bijih_besi', amount: 35641 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_uap',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 36667 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33077 },
      { group: 'bahan bakar', label: 'batu bara', resourceKey: 'batu_bara', amount: 50 },
      { group: 'bahan bakar', label: 'minyak bumi', resourceKey: 'minyak_bumi', amount: 5 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_angin',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 35641 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32051 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_panas_bumi',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 37179 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33077 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_hidrogen',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 38718 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 33590 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_gelombang_laut',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 34615 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 32051 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_fusi_nuklir',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 50000 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 37692 },
      { group: 'pembangunan', label: 'ltj', resourceKey: 'logam_tanah_jarang', amount: 34615 },
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