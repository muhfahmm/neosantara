import { RESEARCH_CARD_LEVEL_BONUS } from "../../researchCardLevelBonus";

export const MANFAAT_KEDUTAAN_RESEARCH_ID = "manfaat_kedutaan";

/**
 * Menghitung persentase pengurangan waktu pembangunan Kedutaan Besar (dalam %)
 * dari penelitian "Manfaat Kedutaan" (manfaat_kedutaan).
 * Level 1 = 2%, Level 2 = 4%, Level 3 = 7%, Level 4 = 10%, Level 5 = 15%.
 */
export function getWaktuPembangunanKedutaanBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(MANFAAT_KEDUTAAN_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = countryDetail.research_levels && typeof countryDetail.research_levels === "object"
    ? (countryDetail.research_levels as Record<string, unknown>)
    : {};

  const storedLevel = Number(researchLevels[MANFAAT_KEDUTAAN_RESEARCH_ID]) || 1;
  const level = Math.min(RESEARCH_CARD_LEVEL_BONUS.length - 1, Math.max(1, Math.floor(storedLevel)));

  return RESEARCH_CARD_LEVEL_BONUS[level];
}

export function getEffectiveEmbassyBuildTime(
  baseDays: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const discountPct = getWaktuPembangunanKedutaanBonusPercent(countryDetail);
  if (discountPct <= 0 || !baseDays) return baseDays;
  return Math.max(1, Math.floor(baseDays * (1 - discountPct / 100)));
}
