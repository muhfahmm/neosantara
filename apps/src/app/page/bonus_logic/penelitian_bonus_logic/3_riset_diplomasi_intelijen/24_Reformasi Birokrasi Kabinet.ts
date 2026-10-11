import {
  getResearchCardBonus,
  getResearchCardLevel,
  normalizeResearchLevels,
} from "../../researchCardLevelBonus";

export const REFORMASI_BIROKRASI_KABINET_RESEARCH_ID = "suara_dewan_keamanan";

/**
 * Persentase diskon biaya upgrade Dewan Kabinet Menteri (2% - 15% sesuai level riset).
 */
export function getReformasiBirokrasiKabinetBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(REFORMASI_BIROKRASI_KABINET_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = normalizeResearchLevels(countryDetail.research_levels);
  const level = getResearchCardLevel(researchLevels, REFORMASI_BIROKRASI_KABINET_RESEARCH_ID);

  return getResearchCardBonus(level);
}

/**
 * Menghitung biaya upgrade menteri/kabinet setelah mendapat diskon riset Reformasi Birokrasi Kabinet.
 */
export function applyReformasiBirokrasiToUpgradeCost(
  baseCost: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseCost) || baseCost <= 0) return baseCost;

  const discountPercent = getReformasiBirokrasiKabinetBonusPercent(countryDetail);
  if (discountPercent <= 0) return baseCost;

  const discountedCost = baseCost * (1 - discountPercent / 100);
  return Math.max(1, Math.round(discountedCost));
}
