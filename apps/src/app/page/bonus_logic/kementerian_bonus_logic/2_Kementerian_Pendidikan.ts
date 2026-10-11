import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";
import { PRODUCTION_BAN_CATEGORIES } from "../../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";

const FOOD_AND_NATURAL_RESOURCE_CATEGORIES = new Set([
  "mineral",
  "peternakan",
  "agrikultur",
  "perikanan",
  "olahan pangan",
]);

const FOOD_AND_NATURAL_RESOURCE_KEYS: ReadonlySet<string> = new Set(
  PRODUCTION_BAN_CATEGORIES
    .filter(category => FOOD_AND_NATURAL_RESOURCE_CATEGORIES.has(category.id))
    .flatMap(category => [...category.products])
);

/**
 * Mendapatkan bonus produksi pangan dan sumber daya alam (%) dari Kementerian Pendidikan.
 * Setiap level kabinet memberikan +1.0%; pengangkatan menteri menambahkan bonus tier.
 */
export function getKementerianPendidikanProductionBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  const normalizedResourceKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  if (!countryDetail || !FOOD_AND_NATURAL_RESOURCE_KEYS.has(normalizedResourceKey)) return 0;

  const level = getDepartmentLevel(countryDetail, "pendidikan");
  const ministerTier = Number(countryDetail.menteri_pendidikan) || 0;
  const ministerBonus = ministerTier > 0
    ? [0, 5, 10, 15, 20, 50][ministerTier] ?? 0
    : 0;

  return level + ministerBonus;
}

/**
 * Menerapkan bonus produksi Kementerian Pendidikan sebagai pengali produksi.
 */
export function applyKementerianPendidikanProductionBonus(
  baseMultiplier: number,
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  const bonusPercent = getKementerianPendidikanProductionBonusPercent(countryDetail, resourceKey);
  return baseMultiplier * (1 + bonusPercent / 100);
}
