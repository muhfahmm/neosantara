export interface RequirementItem {
  group: string;
  label: string;
  resourceKey: string;
}

export interface BuildingRequirements {
  category: string;
  buildingKey: string;
  requirements: RequirementItem[];
}

const CATEGORY_FOLDER_MAP: Record<string, string> = {
  kelistrikan: '1_kelistrikan',
  mineral: '2_mineral_kritis',
  manufaktur: '3_manufaktur',
  peternakan: '4_peternakan',
  agrikultur: '5_agrikultur',
  perikanan: '6_perikanan',
  'olahan pangan': '7_olahan_pangan',
};

export function mapActiveTabToRequirementsFolder(tabId: string): string | undefined {
  return CATEGORY_FOLDER_MAP[tabId];
}

export function parseRequirementsFile(content: string, category: string): BuildingRequirements[] {
  const lines = content.split(/\r?\n/);
  const result: BuildingRequirements[] = [];
  let currentBuilding: BuildingRequirements | null = null;
  let currentGroup = 'pembangunan';

  const buildingLineRe = /^\s*\d+\.\s*([^\s].*)$/;
  const groupLineRe = /^\s*>\s*(.+)$/;
  const itemLineRe = /^\s*([^>].*?)(?:\s*\(dari\s*([^\)]+)\))?\s*$/;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const buildingMatch = rawLine.match(buildingLineRe);
    if (buildingMatch) {
      if (currentBuilding) {
        result.push(currentBuilding);
      }
      const buildingKey = buildingMatch[1].trim();
      currentBuilding = {
        category,
        buildingKey,
        requirements: [],
      };
      currentGroup = 'pembangunan';
      continue;
    }

    const groupMatch = rawLine.match(groupLineRe);
    if (groupMatch && currentBuilding) {
      const groupText = groupMatch[1].trim().replace(/:$/u, '').trim();
      currentGroup = groupText || currentGroup;
      continue;
    }

    const itemMatch = rawLine.match(itemLineRe);
    if (itemMatch && currentBuilding) {
      const label = itemMatch[1].trim();
      const resourceKey = itemMatch[2]?.trim() || label.replace(/\s+/g, '_').toLowerCase();
      if (label && resourceKey) {
        currentBuilding.requirements.push({
          group: currentGroup,
          label,
          resourceKey,
        });
      }
    }
  }

  if (currentBuilding) {
    result.push(currentBuilding);
  }

  return result;
}

export function findBuildingRequirements(
  requirements: BuildingRequirements[],
  buildingKey: string,
): BuildingRequirements | undefined {
  return requirements.find((entry) => entry.buildingKey === buildingKey);
}

export function getTotalProductionForBuilding(
  key: string,
  countryDetail: Record<string, any> | null,
  metadata: Record<string, any> | null,
): number {
  const count = Number(countryDetail?.[key] ?? 0);
  const produksi = Number(metadata?.[key]?.produksi ?? 0);
  return count * produksi;
}

export function getTotalProductionForBuildings(
  keys: string[],
  countryDetail: Record<string, any> | null,
  metadata: Record<string, any> | null,
): Record<string, number> {
  return keys.reduce((acc, key) => {
    acc[key] = getTotalProductionForBuilding(key, countryDetail, metadata);
    return acc;
  }, {} as Record<string, number>);
}
