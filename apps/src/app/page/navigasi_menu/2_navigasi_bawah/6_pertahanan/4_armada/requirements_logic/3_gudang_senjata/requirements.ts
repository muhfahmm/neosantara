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

export const CATEGORY = 'gudang_senjata';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'gudang_senjata',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 400 },
      { group: 'pembangunan', label: 'besi', resourceKey: 'bijih_besi', amount: 300 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 250 },
      { group: 'pembangunan', label: 'batu bara', resourceKey: 'batu_bara', amount: 150 },
    ],
  },
  {
    buildingKey: 'artileri_berat',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 48750 },
    ],
  },
  {
    buildingKey: 'sistem_peluncur_roket',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 71250 },
    ],
  },
  {
    buildingKey: 'pertahanan_udara_mobile',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 93750 },
    ],
  },
  {
    buildingKey: 'kendaraan_taktis',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 11250 },
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
