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

export const CATEGORY = 'pangkalan_laut';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'pangkalan_laut',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 600 },
      { group: 'pembangunan', label: 'besi', resourceKey: 'bijih_besi', amount: 400 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 500 },
      { group: 'pembangunan', label: 'batu bara', resourceKey: 'batu_bara', amount: 200 },
    ],
  },
  {
    buildingKey: 'kapal_induk',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 1125000 },
    ],
  },
  {
    buildingKey: 'kapal_induk_nuklir',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 1875000 },
    ],
  },
  {
    buildingKey: 'kapal_destroyer',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 337500 },
    ],
  },
  {
    buildingKey: 'kapal_korvet',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 135000 },
    ],
  },
  {
    buildingKey: 'kapal_selam_nuklir',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 562500 },
    ],
  },
  {
    buildingKey: 'kapal_selam_regular',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 187500 },
    ],
  },
  {
    buildingKey: 'kapal_ranjau',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 63750 },
    ],
  },
  {
    buildingKey: 'kapal_logistik',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 90000 },
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
