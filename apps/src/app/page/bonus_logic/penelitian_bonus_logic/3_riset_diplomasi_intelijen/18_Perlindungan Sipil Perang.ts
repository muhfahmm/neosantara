import {
  getResearchCardBonus,
  getResearchCardLevel,
} from "../../researchCardLevelBonus";

export const PERLINDUNGAN_PERANG_RESEARCH_ID = "perlindungan_perang";
export const BASE_WAR_CASUALTY_POPULATION_LOSS_PERCENT = 5.0;

export function getPerlindunganSipilPerangBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!countryDetail) return 0;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  if (!completedResearch.includes(PERLINDUNGAN_PERANG_RESEARCH_ID)) return 0;

  return getResearchCardBonus(
    getResearchCardLevel(countryDetail.research_levels, PERLINDUNGAN_PERANG_RESEARCH_ID)
  );
}

/**
 * Menghitung persentase pengurangan populasi akibat perang setelah dipotong oleh bonus riset Perlindungan Sipil Perang.
 * Contoh: Jika base rate = 5.0% dan riset level max memberikan pengurangan 15% korban jiwa,
 * maka angka kehilangan populasi menjadi 5.0% * (1 - 0.15) = 4.25%.
 */
export function calculateWarCasualtyPopulationLossPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  baseCasualtyPercent = BASE_WAR_CASUALTY_POPULATION_LOSS_PERCENT
): number {
  const safeBase = Number.isFinite(baseCasualtyPercent)
    ? Math.max(0, baseCasualtyPercent)
    : BASE_WAR_CASUALTY_POPULATION_LOSS_PERCENT;

  const bonusReductionPercent = getPerlindunganSipilPerangBonusPercent(countryDetail);
  const reductionMultiplier = Math.max(0, 1 - bonusReductionPercent / 100);

  return Number((safeBase * reductionMultiplier).toFixed(2));
}

/**
 * Menerapkan dampak kekalahan perang terhadap populasi negara user.
 * Mengembalikan populasi baru setelah dipotong persentase korban perang.
 */
export function applyWarCasualtyToPopulation(
  countryDetail: Record<string, unknown> | null | undefined,
  baseCasualtyPercent = BASE_WAR_CASUALTY_POPULATION_LOSS_PERCENT
): { updatedPopulation: number; lostPopulation: number; lossPercent: number } {
  const currentPop = Number(countryDetail?.populasi ?? countryDetail?.population ?? 0);
  if (currentPop <= 0) {
    return { updatedPopulation: 0, lostPopulation: 0, lossPercent: 0 };
  }

  const effectiveLossPercent = calculateWarCasualtyPopulationLossPercent(countryDetail, baseCasualtyPercent);
  const lostPopulation = Math.round((currentPop * effectiveLossPercent) / 100);
  const updatedPopulation = Math.max(0, currentPop - lostPopulation);

  return {
    updatedPopulation,
    lostPopulation,
    lossPercent: effectiveLossPercent,
  };
}
