/**
 * kepuasanCalculator.ts
 * Utility untuk menghitung skor kepuasan rakyat berdasarkan sembilan sektor.
 *
 * Diekstrak dari StatistikKepuasanModal agar bisa dipanggil secara otomatis
 * di map-system.tsx tanpa harus membuka modal terlebih dahulu.
 */

import {
  calculateFoodSatisfactionScore,
  calculateWeightedFoodCoverage,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic";
import { getCountryConsumptionBreakdown } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/1_grid_nasional/consumptionLogic";
import { calculateTotalTaxIncome } from "@/app/logic/economic_logic/treasuryUpdater";


// ─── Helper ─────────────────────────────────────────────────────────────────

function getTaxValue(detail: any, path: string[], fallback = 0): number {
  let current: any = detail;
  for (const key of path) {
    if (current == null || typeof current !== "object") return fallback;
    current = current[key];
  }
  return typeof current === "number" ? current : fallback;
}

function findMeta(key: string, metadata: any): any {
  if (!metadata) return undefined;
  if (metadata[key]) return metadata[key];
  for (const k of Object.keys(metadata)) {
    const entry = metadata[k];
    if (!entry) continue;
    if (entry.dataKey === key) return entry;
    if (k.endsWith(`_${key}`) || k === `1_${key}`) return entry;
  }
  return undefined;
}

// ─── Scorer Functions ────────────────────────────────────────────────────────

function calculateRawPajakScore(countryDetail: any): number {
  const vat = Number(getTaxValue(countryDetail, ["ppn"]) || getTaxValue(countryDetail, ["pajak", "ppn", "tarif"]) || 0);
  const corporate_tax = Number(getTaxValue(countryDetail, ["corporate"]) || getTaxValue(countryDetail, ["pajak", "korporasi", "tarif"]) || 0);
  const income_tax = Number(getTaxValue(countryDetail, ["income_tax"]) || getTaxValue(countryDetail, ["pajak", "penghasilan", "tarif"]) || 0);
  const cigarette_tax = Number(getTaxValue(countryDetail, ["cigarette_tax"]) || getTaxValue(countryDetail, ["pajak", "bea_cukai", "tarif"]) || 0);
  const environment_tax = Number(getTaxValue(countryDetail, ["environment_tax"]) || getTaxValue(countryDetail, ["pajak", "lingkungan", "tarif"]) || 0);

  const avgRate = (vat + corporate_tax + income_tax + cigarette_tax + environment_tax) / 5;
  const totalIncome = calculateTotalTaxIncome(countryDetail);
  const maxIncome = 5 * 500;
  return Math.min(100, Math.max(1, Math.round(100 - avgRate + (totalIncome / maxIncome) * 20)));
}

function calculateRawHargaScore(countryDetail: any): number {
  const prices = countryDetail?.harga || {};
  const subsidyActive = countryDetail?.subsidyActive || false;
  const priceEntries = Object.entries(prices).filter(([key]) => key.startsWith("harga_"));
  if (priceEntries.length === 0) return 50;

  const minPrice = 10000;
  const maxPrice = 100000;
  let totalScore = 0;
  for (const [, value] of priceEntries) {
    const valNum = Number(value) || 0;
    let score = 100 - ((valNum - minPrice) / (maxPrice - minPrice)) * 100;
    score = Math.min(100, Math.max(0, score));
    totalScore += score;
  }
  let avgScore = totalScore / priceEntries.length;
  if (subsidyActive) avgScore = Math.min(100, avgScore + 5);
  return Math.round(avgScore);
}

function calculateRawPanganScore(countryDetail: any, metadata: any): number {
  return calculateFoodSatisfactionScore(countryDetail, metadata);
}

function calculateRawListrikScore(countryDetail: any, metadata: any): number {
  if (!countryDetail || !metadata || Object.keys(metadata).length === 0) return 50;
  const { totalProductionMW, totalAllBreakdownConsumption } = getCountryConsumptionBreakdown(countryDetail, metadata);
  if (totalAllBreakdownConsumption <= 0) return 100;
  const coverage = Math.min(1, Math.max(0, totalProductionMW / totalAllBreakdownConsumption));
  return Math.round(coverage * 100);
}

function calculateRawHunianScore(countryDetail: any, metadata?: any): number {
  const population = Number(countryDetail?.jumlah_penduduk ?? countryDetail?.population ?? 0);

  const HUNIAN_KEYS = ["rumah_subsidi", "apartemen", "mansion"];
  const DEFAULT_CAPACITIES: Record<string, number> = {
    rumah_subsidi: 5,
    apartemen: 6000,
    mansion: 10,
  };

  let totalHousingCapacity = 0;
  HUNIAN_KEYS.forEach((key) => {
    const count = Number(countryDetail?.[key]) || 0;
    const meta = metadata ? findMeta(key, metadata) : undefined;
    const capacity = Number(meta?.kapasitas) || DEFAULT_CAPACITIES[key] || 4;
    totalHousingCapacity += count * capacity;
  });

  if (population <= 0) return 50;
  const coverage = Math.min(1, Math.max(0, totalHousingCapacity / population));
  return Math.round(coverage * 100);
}

export interface ServiceDeficitMetrics {
  electricityCoverage: number;
  foodCoverage: number;
  housingCoverage: number;
  pressure: number;
}

export const PENEGAKAN_HUKUM_KEYS = [
  "pusat_bantuan_hukum",
  "pengadilan",
  "kejaksaan",
  "pos_polisi",
  "akademi_polisi",
];
export const PENEGAKAN_HUKUM_TARGET_RATIO = 1 / 7000;
export const LOW_SECTOR_SCORE_THRESHOLD = 25;
export const LOW_SECTOR_DECAY_INTERVAL_MONTHS = 6;
export const LOW_SECTOR_DECAY_POINTS_PER_SECTOR = 2;
export const LOW_SECTOR_DECAY_MAX_POINTS_PER_INTERVAL = 10;

export const INITIAL_SATISFACTION_SECTOR_SCORES = {
  pajak: 94,
  harga: 96,
  pangan: 100,
  listrik: 100,
  hunian: 95,
  layananPublik: 11,
  kesehatan: 12,
  penegakanHukum: 5,
  keterbukaan: 53,
} as const;

type SatisfactionSectorScores = Record<keyof typeof INITIAL_SATISFACTION_SECTOR_SCORES, number>;
const MAIN_SATISFACTION_SECTOR_KEYS: (keyof SatisfactionSectorScores)[] = [
  "pajak",
  "harga",
  "pangan",
  "listrik",
  "hunian",
  "layananPublik",
  "keterbukaan",
];

interface SatisfactionSectorBaseline {
  rawScores: SatisfactionSectorScores;
}

function calculatePublicServiceCategoryScore(
  countryDetail: any,
  keys: string[],
  targetRatio: number,
): number {
  const population = Number(countryDetail?.jumlah_penduduk) || 0;
  if (population <= 0) return 50;

  const totalFacilities = keys.reduce(
    (total, key) => total + (Number(countryDetail?.[key]) || 0),
    0,
  );
  return Math.round(Math.min(100, (totalFacilities / population / targetRatio) * 100));
}

function calculateRawKesehatanScore(countryDetail: any): number {
  return calculatePublicServiceCategoryScore(
    countryDetail,
    ["rumah_sakit_besar", "rumah_sakit_kecil", "pusat_diagnostik"],
    0.00004,
  );
}

function calculateRawPenegakanHukumScore(countryDetail: any): number {
  return calculatePublicServiceCategoryScore(
    countryDetail,
    PENEGAKAN_HUKUM_KEYS,
    PENEGAKAN_HUKUM_TARGET_RATIO,
  );
}

export function calculateServiceDeficitMetrics(countryDetail: any, metadata: any): ServiceDeficitMetrics {
  if (!countryDetail || !metadata || Object.keys(metadata).length === 0) {
    return { electricityCoverage: 1, foodCoverage: 1, housingCoverage: 1, pressure: 0 };
  }

  const electricity = getCountryConsumptionBreakdown(countryDetail, metadata);
  const electricityCoverage = electricity.totalAllBreakdownConsumption > 0
    ? Math.min(1, Math.max(0, electricity.totalProductionMW / electricity.totalAllBreakdownConsumption))
    : 1;
  const foodCoverage = Math.min(1, Math.max(0, calculateWeightedFoodCoverage(countryDetail, metadata)));
  const housingCoverage = Number(countryDetail?.jumlah_penduduk ?? countryDetail?.population ?? 0) > 0
    ? Math.min(1, Math.max(0, calculateHunianScore(countryDetail, metadata) / 100))
    : 1;
  const combinedCoverage = Math.cbrt(electricityCoverage * foodCoverage * housingCoverage);

  return {
    electricityCoverage,
    foodCoverage,
    housingCoverage,
    pressure: Math.min(1, Math.max(0, 1 - combinedCoverage)),
  };
}

function calculateRawLayananPublikScore(countryDetail: any): number {
  const population = Number(countryDetail?.jumlah_penduduk) || 0;
  if (population <= 0) return 50;

  const categories = [
    { keys: ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad"], target: 0.00005 },
    { keys: ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan"], target: 0.0001 },
    { keys: ["rumah_sakit_besar", "rumah_sakit_kecil", "pusat_diagnostik"], target: 0.00004 },
    { keys: PENEGAKAN_HUKUM_KEYS, target: PENEGAKAN_HUKUM_TARGET_RATIO },
    { keys: ["kolam_renang", "sirkuit_balap", "stadion", "stadion_internasional", "gym", "golf", "esports", "gokart", "bioskop", "teater"], target: 0.00008 },
    { keys: ["mall", "hotel", "pusat_grosir_tekstil"], target: 0.00002 },
  ];

  let totalScore = 0;
  categories.forEach((cat) => {
    const totalVal = cat.keys.reduce((sum, key) => sum + (Number(countryDetail[key]) || 0), 0);
    const indexVal = totalVal / population;
    const percentageMet = Math.min(100, (indexVal / cat.target) * 100);
    totalScore += percentageMet;
  });

  return Math.round(totalScore / categories.length);
}

function calculateRawKeterbukaanScore(countryDetail: any): number {
  if (!countryDetail) return 50;
  if (countryDetail.opennessIndex !== undefined && countryDetail.opennessIndex !== null) {
    return Math.min(100, Math.max(0, Number(countryDetail.opennessIndex)));
  }

  const speechScore = Number(countryDetail?.speechScore ?? 50);
  const religionScore = Number(countryDetail?.religionScore ?? 60);
  const demoScore = Number(countryDetail?.demoScore ?? 45);
  const transparencyScore = Number(countryDetail?.transparencyScore ?? 55);
  const mediaScore = Number(countryDetail?.mediaScore ?? 50);
  const internetScore = Number(countryDetail?.internetScore ?? 60);
  const borderScore = Number(countryDetail?.borderScore ?? 40);
  const tradeScore = Number(countryDetail?.tradeScore ?? 60);
  const diplomacyScore = Number(countryDetail?.diplomacyScore ?? 55);

  const avg = Math.round(
    (speechScore + religionScore + demoScore + transparencyScore + mediaScore + internetScore + borderScore + tradeScore + diplomacyScore) / 9
  );
  return Math.min(100, Math.max(0, avg));
}

function calculateRawSatisfactionSectorScores(countryDetail: any, metadata: any): SatisfactionSectorScores {
  return {
    pajak: calculateRawPajakScore(countryDetail),
    harga: calculateRawHargaScore(countryDetail),
    pangan: calculateRawPanganScore(countryDetail, metadata),
    listrik: calculateRawListrikScore(countryDetail, metadata),
    hunian: calculateRawHunianScore(countryDetail, metadata),
    layananPublik: calculateRawLayananPublikScore(countryDetail),
    kesehatan: calculateRawKesehatanScore(countryDetail),
    penegakanHukum: calculateRawPenegakanHukumScore(countryDetail),
    keterbukaan: calculateRawKeterbukaanScore(countryDetail),
  };
}

export function createSatisfactionSectorBaseline(
  countryDetail: any,
  metadata: any,
): SatisfactionSectorBaseline {
  return { rawScores: calculateRawSatisfactionSectorScores(countryDetail, metadata) };
}

export function getSatisfactionSectorScores(
  countryDetail: any,
  metadata: any,
): SatisfactionSectorScores {
  const rawScores = calculateRawSatisfactionSectorScores(countryDetail, metadata);
  const baseline = countryDetail?.satisfaction_sector_baseline as SatisfactionSectorBaseline | undefined;
  if (!baseline?.rawScores) return { ...INITIAL_SATISFACTION_SECTOR_SCORES };

  return Object.fromEntries(
    Object.keys(INITIAL_SATISFACTION_SECTOR_SCORES).map((key) => {
      const sector = key as keyof SatisfactionSectorScores;
      const initialScore = INITIAL_SATISFACTION_SECTOR_SCORES[sector];
      const rawBaseline = Number(baseline.rawScores[sector]);
      const rawCurrent = Number(rawScores[sector]);
      const dynamicScore = initialScore + rawCurrent - rawBaseline;
      return [sector, Math.round(Math.min(100, Math.max(0, dynamicScore)))];
    }),
  ) as SatisfactionSectorScores;
}

export function calculatePajakScore(countryDetail: any): number {
  return getSatisfactionSectorScores(countryDetail, undefined).pajak;
}

export function calculateHargaScore(countryDetail: any): number {
  return getSatisfactionSectorScores(countryDetail, undefined).harga;
}

export function calculatePanganScore(countryDetail: any, metadata: any): number {
  return getSatisfactionSectorScores(countryDetail, metadata).pangan;
}

export function calculateListrikScore(countryDetail: any, metadata: any): number {
  return calculateRawListrikScore(countryDetail, metadata);
}

export function calculateHunianScore(countryDetail: any, metadata?: any): number {
  return getSatisfactionSectorScores(countryDetail, metadata).hunian;
}

export function calculateKesehatanScore(countryDetail: any): number {
  return getSatisfactionSectorScores(countryDetail, undefined).kesehatan;
}

export function calculatePenegakanHukumScore(countryDetail: any): number {
  return getSatisfactionSectorScores(countryDetail, undefined).penegakanHukum;
}

export function calculateLayananPublikScore(countryDetail: any): number {
  return getSatisfactionSectorScores(countryDetail, undefined).layananPublik;
}

export function calculateKeterbukaanScore(countryDetail: any): number {
  return getSatisfactionSectorScores(countryDetail, undefined).keterbukaan;
}

export function countLowSatisfactionSectors(countryDetail: any, metadata: any): number {
  return Object.values(getSatisfactionSectorScores(countryDetail, metadata))
    .filter((score) => score < LOW_SECTOR_SCORE_THRESHOLD).length;
}

// ─── Main exported function ──────────────────────────────────────────────────

/**
 * Hitung skor kepuasan rakyat dari countryDetail & metadata.
 * Mengembalikan nilai 0–100 sebagai rata-rata tujuh sektor utama.
 */
export function calculateKepuasan(countryDetail: any, metadata: any): number {
  if (!countryDetail) return 50;

  const sectorScores = getSatisfactionSectorScores(countryDetail, metadata);
  const mainSectorTotal = MAIN_SATISFACTION_SECTOR_KEYS.reduce(
    (total, sector) => total + sectorScores[sector],
    0,
  );
  const baseScore = mainSectorTotal / MAIN_SATISFACTION_SECTOR_KEYS.length;
  const accumulatedSectorPenalty = Math.max(0, Number(countryDetail.sector_deficit_kepuasan_penalty) || 0);
  return Math.max(0, baseScore - accumulatedSectorPenalty);
}
