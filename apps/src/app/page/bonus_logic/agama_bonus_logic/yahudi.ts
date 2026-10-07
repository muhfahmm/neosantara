export const JEWISH_CONSTRUCTION_TIME_DISCOUNT = 0.1;

const DISCOUNTED_BUILDING_KEYS = new Set([
  "uranium",
  "batu_bara",
  "minyak_bumi",
  "gas_alam",
  "garam",
  "litium",
  "logam_tanah_jarang",
  "bijih_besi",
  "pabrik_semikonduktor",
  "pabrik_mesin_mobil",
  "pabrik_mesin_motor",
  "semen_beton",
  "kayu",
]);

export function applyJewishConstructionTimeDiscount(
  baseDays: number,
  buildingKey: string,
  religion: unknown
): number {
  const normalizedReligion = String(religion || "").trim().toLowerCase();
  if (normalizedReligion !== "yahudi" || !DISCOUNTED_BUILDING_KEYS.has(buildingKey)) {
    return baseDays;
  }

  return baseDays > 0
    ? Math.max(1, Math.floor(baseDays * (1 - JEWISH_CONSTRUCTION_TIME_DISCOUNT)))
    : baseDays;
}
