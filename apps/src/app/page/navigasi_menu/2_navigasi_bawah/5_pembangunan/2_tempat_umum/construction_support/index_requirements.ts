// index.ts
export interface RequirementItem {
  group: string;
  label: string;
  resourceKey: string;
  amount: number; // ✅ Ditambahkan ke interface global
}

export interface BuildingRequirements {
  buildingKey: string;
  requirements: RequirementItem[];
}

export const CATEGORY_FOLDER_MAP: Record<string, string> = {
  Infrastruktur: '1_infrastruktur',
  Pendidikan: '2_pendidikan',
  Kesehatan: '3_kesehatan',
  'Penegakan Hukum': '4_penegakan_hukum',
  'Olahraga & Hiburan': '5_olahraga_hiburan',
  Komersial: '6_komersial',
};

export function mapActiveTabToRequirementsFolder(tabId: string): string | undefined {
  return CATEGORY_FOLDER_MAP[tabId];
}

export function findRequirements(
  requirements: BuildingRequirements[],
  buildingKey: string,
): BuildingRequirements | undefined {
  return requirements.find((entry) => entry.buildingKey === buildingKey);
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