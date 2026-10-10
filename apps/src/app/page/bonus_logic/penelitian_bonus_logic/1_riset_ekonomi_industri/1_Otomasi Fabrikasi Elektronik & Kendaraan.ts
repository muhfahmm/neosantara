import { PRODUCTION_BAN_CATEGORIES } from "../../../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";
import { getResearchCardBonus, getResearchCardLevel } from "../../researchCardLevelBonus";

export const OTOMASI_INDUSTRI_RESEARCH_ID = "otomasi_industri";
export const OTOMASI_INDUSTRI_TARGET_SECTOR = "manufaktur";

// Mencari resource key yang termasuk ke dalam sektor manufaktur dari catalog
const MANUFAKTUR_CATEGORY = PRODUCTION_BAN_CATEGORIES.find((cat) => cat.id === OTOMASI_INDUSTRI_TARGET_SECTOR);
export const OTOMASI_INDUSTRI_RESOURCES = new Set<string>(
  MANUFAKTUR_CATEGORY ? MANUFAKTUR_CATEGORY.products : ["pabrik_semikonduktor", "pabrik_mesin_mobil", "pabrik_mesin_motor"]
);

/**
 * Menghitung persentase bonus produksi dari penelitian "Otomasi Fabrikasi Elektronik & Kendaraan" (otomasi_industri).
 * Jika belum selesai diriset, mengembalikan 0.
 * Jika sudah diriset (Lvl 1 = +2%, dengan bonus level sesuai RESEARCH_CARD_LEVEL_BONUS).
 */
export function getOtomasiIndustriBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  if (!countryDetail) return 0;

  const normalizedKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  if (!OTOMASI_INDUSTRI_RESOURCES.has(normalizedKey)) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(OTOMASI_INDUSTRI_RESEARCH_ID)) {
    return 0;
  }

  return getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, OTOMASI_INDUSTRI_RESEARCH_ID)
  );
}

/**
 * Menghitung pengali (multiplier) produksi dari penelitian Otomasi Industri.
 * Contoh: Bonus 2% -> return 1.02
 */
export function getOtomasiIndustriProductionMultiplier(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  const bonusPercent = getOtomasiIndustriBonusPercent(countryDetail, resourceKey);
  return 1 + bonusPercent / 100;
}
