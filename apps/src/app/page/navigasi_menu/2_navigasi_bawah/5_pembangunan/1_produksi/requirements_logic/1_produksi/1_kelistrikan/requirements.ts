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
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 500 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 300 },
      { group: 'bahan bakar', label: 'gas alam', resourceKey: 'gas_alam', amount: 2 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_air',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 800 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 400 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_nuklir',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 1000 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 350 },
      { group: 'bahan bakar', label: 'uranium', resourceKey: 'uranium', amount: 1 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_surya',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 450 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 200 },
      { group: 'pembangunan', label: 'ltj', resourceKey: 'logam_tanah_jarang', amount: 250 },
      { group: 'pembangunan', label: 'bijih besi', resourceKey: 'bijih_besi', amount: 600 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_uap',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 700 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 350 },
      { group: 'bahan bakar', label: 'batu bara', resourceKey: 'batu_bara', amount: 50 },
      { group: 'bahan bakar', label: 'minyak bumi', resourceKey: 'minyak_bumi', amount: 5 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_angin',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 600 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 250 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_panas_bumi',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 750 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 350 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_hidrogen',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 900 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 400 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_gelombang_laut',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 500 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 250 },
    ],
  },
  {
    buildingKey: 'pembangkit_listrik_tenaga_fusi_nuklir',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 2000 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 800 },
      { group: 'pembangunan', label: 'ltj', resourceKey: 'logam_tanah_jarang', amount: 500 },
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