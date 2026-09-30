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

export const CATEGORY = 'pangkalan_udara';

export const REQUIREMENTS: BuildingRequirements[] = [
  {
    buildingKey: 'pangkalan_udara',
    requirements: [
      { group: 'pembangunan', label: 'semen beton', resourceKey: 'semen_beton', amount: 700 },
      { group: 'pembangunan', label: 'besi', resourceKey: 'bijih_besi', amount: 500 },
      { group: 'pembangunan', label: 'kayu', resourceKey: 'kayu', amount: 400 },
      { group: 'pembangunan', label: 'batu bara', resourceKey: 'batu_bara', amount: 250 },
    ],
  },
  {
    buildingKey: 'jet_tempur_siluman',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 112500 },
    ],
  },
  {
    buildingKey: 'jet_tempur_interceptor',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 63750 },
    ],
  },
  {
    buildingKey: 'pesawat_pengebom',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 187500 },
    ],
  },
  {
    buildingKey: 'helikopter_serang',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 41250 },
    ],
  },
  {
    buildingKey: 'pesawat_pengintai',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 71250 },
    ],
  },
  {
    buildingKey: 'drone_intai_uav',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 11250 },
    ],
  },
  {
    buildingKey: 'drone_kamikaze',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 3750 },
    ],
  },
  {
    buildingKey: 'pesawat_angkut',
    requirements: [
      { group: 'produksi', label: 'Biaya Produksi NEO', resourceKey: 'em_cost', amount: 56250 },
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
