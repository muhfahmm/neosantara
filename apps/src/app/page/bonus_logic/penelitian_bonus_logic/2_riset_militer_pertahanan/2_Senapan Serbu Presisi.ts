import { RESEARCH_CARD_LEVEL_BONUS } from "../../researchCardLevelBonus";

export const SENJATA_INFANTERI_RESEARCH_ID = "senjata_infanteri";
export const GUDANG_SENJATA_BUILDING_KEY = "gudang_senjata";

/**
 * Menghitung persentase pengurangan waktu pembangunan (dalam %)
 * untuk Gudang Senjata dari penelitian "Senapan Serbu Presisi" (senjata_infanteri).
 * Level 1 = 2%, Level 2 = 4%, Level 3 = 7%, Level 4 = 10%, Level 5 = 15%.
 */
export function getWaktuPembangunanGudangSenjataBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  buildingKey?: string
): number {
  if (!countryDetail) return 0;

  if (buildingKey && buildingKey !== GUDANG_SENJATA_BUILDING_KEY) {
    return 0;
  }

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(SENJATA_INFANTERI_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = countryDetail.research_levels && typeof countryDetail.research_levels === "object"
    ? (countryDetail.research_levels as Record<string, unknown>)
    : {};

  const storedLevel = Number(researchLevels[SENJATA_INFANTERI_RESEARCH_ID]) || 1;
  const level = Math.min(RESEARCH_CARD_LEVEL_BONUS.length - 1, Math.max(1, Math.floor(storedLevel)));

  return RESEARCH_CARD_LEVEL_BONUS[level];
}
