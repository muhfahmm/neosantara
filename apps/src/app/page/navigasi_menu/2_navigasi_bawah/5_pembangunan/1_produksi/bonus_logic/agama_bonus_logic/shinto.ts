export const SHINTO_ELECTRICITY_PRODUCTION_BONUS = 0.1;

const ELECTRICITY_GENERATOR_KEYS = new Set([
  "pembangkit_listrik_tenaga_nuklir",
  "pembangkit_listrik_tenaga_air",
  "pembangkit_listrik_tenaga_surya",
  "pembangkit_listrik_tenaga_uap",
  "pembangkit_listrik_tenaga_gas",
  "pembangkit_listrik_tenaga_angin",
]);

export function getShintoElectricityProductionMultiplier(buildingKey: string): number {
  const normalizedKey = buildingKey.trim().toLowerCase().replace(/^\d+_/, "");
  return ELECTRICITY_GENERATOR_KEYS.has(normalizedKey)
    ? 1 + SHINTO_ELECTRICITY_PRODUCTION_BONUS
    : 1;
}
