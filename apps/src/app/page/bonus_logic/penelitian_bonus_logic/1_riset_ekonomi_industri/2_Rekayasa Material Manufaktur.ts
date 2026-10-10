import { PRODUCTION_BAN_CATEGORIES } from "../../../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";
import { getResearchCardBonus, getResearchCardLevel } from "../../researchCardLevelBonus";

export const MANUFAKTUR_MATERIAL_RESEARCH_ID = "manufaktur_material";
export const MANUFAKTUR_MATERIAL_TARGET_SECTOR = "manufaktur";

const MANUFAKTUR_CATEGORY = PRODUCTION_BAN_CATEGORIES.find((cat) => cat.id === MANUFAKTUR_MATERIAL_TARGET_SECTOR);
export const MANUFAKTUR_MATERIAL_RESOURCES = new Set<string>(
  MANUFAKTUR_CATEGORY ? MANUFAKTUR_CATEGORY.products : ["pabrik_semikonduktor", "pabrik_mesin_mobil", "pabrik_mesin_motor", "semen_beton", "kayu"]
);

/**
 * Menghitung persentase diskon/pengurangan waktu pembangunan (dalam %)
 * untuk sektor Manufaktur dari penelitian "Rekayasa Material Manufaktur" (manufaktur_material).
 * Level 1 = 2%, Level 2 = 4%, Level 3 = 7%, Level 4 = 10%, Level 5 = 15%.
 */
export function getManufakturMaterialBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey?: string
): number {
  if (!countryDetail) return 0;

  if (resourceKey) {
    const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
    if (!MANUFAKTUR_MATERIAL_RESOURCES.has(normalizedKey)) return 0;
  }

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(MANUFAKTUR_MATERIAL_RESEARCH_ID)) {
    return 0;
  }

  return getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, MANUFAKTUR_MATERIAL_RESEARCH_ID)
  );
}
