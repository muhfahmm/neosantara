import { PRODUCTION_BAN_CATEGORIES } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";

export const NATIONALISM_FOOD_PRODUCTION_BONUS = 0.1;

const FOOD_PRODUCTION_CATEGORY_IDS = new Set([
  "peternakan",
  "agrikultur",
  "perikanan",
  "olahan pangan",
]);

const NATIONALISM_FOOD_RESOURCES = new Set<string>(
  PRODUCTION_BAN_CATEGORIES
    .filter(category => FOOD_PRODUCTION_CATEGORY_IDS.has(category.id))
    .flatMap(category => category.products)
);

export function getNationalismProductionMultiplier(
  resourceKey: string,
  ideology: unknown
): number {
  if (String(ideology || "").trim().toLowerCase() !== "nasionalisme") return 1;

  const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  return NATIONALISM_FOOD_RESOURCES.has(normalizedKey)
    ? 1 + NATIONALISM_FOOD_PRODUCTION_BONUS
    : 1;
}
