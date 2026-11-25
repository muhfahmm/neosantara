import {
  getResearchCardBonus,
  getResearchCardLevel,
  normalizeResearchLevels,
} from "../../researchCardLevelBonus";

export const DIPLOMASI_PERDAGANGAN_STRATEGIS_RESEARCH_ID = "kriptografi_kuantum";

/**
 * Menghitung persentase bonus Diplomasi Perdagangan Strategis (dalam %)
 * dari penelitian "Diplomasi Perdagangan Strategis" (kriptografi_kuantum).
 * Level 1 = 2%, Level 2 = 4%, Level 3 = 7%, Level 4 = 10%, Level 5 = 15%.
 */
export function getStrategicTradeBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (!completedResearch.includes(DIPLOMASI_PERDAGANGAN_STRATEGIS_RESEARCH_ID)) {
    return 0;
  }

  const researchLevels = normalizeResearchLevels(countryDetail.research_levels);
  const level = getResearchCardLevel(researchLevels, DIPLOMASI_PERDAGANGAN_STRATEGIS_RESEARCH_ID);

  return getResearchCardBonus(level);
}

/**
 * Mengaplikasikan pengali harga jual (+bonus%) dari Diplomasi Perdagangan Strategis.
 */
export function applyStrategicTradeSellPriceMultiplier(
  price: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(price) || price <= 0) return price;
  const bonusPercent = getStrategicTradeBonusPercent(countryDetail);
  if (bonusPercent <= 0) return price;
  return price * (1 + bonusPercent / 100);
}

/**
 * Mengaplikasikan pengali harga beli (-diskon%) dari Diplomasi Perdagangan Strategis.
 */
export function applyStrategicTradeBuyPriceMultiplier(
  price: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(price) || price <= 0) return price;
  const bonusPercent = getStrategicTradeBonusPercent(countryDetail);
  if (bonusPercent <= 0) return price;
  return Math.max(0, price * (1 - bonusPercent / 100));
}

/**
 * Helper umum untuk mode 'sell' atau 'buy'.
 */
export function applyStrategicTradePrice(
  price: number,
  mode: "sell" | "buy",
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (mode === "sell") {
    return applyStrategicTradeSellPriceMultiplier(price, countryDetail);
  }
  return applyStrategicTradeBuyPriceMultiplier(price, countryDetail);
}
