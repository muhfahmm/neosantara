export type BuildingMetadata = Record<string, Record<string, unknown>>;

let buildingMetadata: BuildingMetadata = {};

export function setBuildingMetadata(metadata: BuildingMetadata): void {
  buildingMetadata = metadata;
}

export function getBuildingMetadata(): BuildingMetadata {
  return buildingMetadata;
}
