/**
 * kepuasanCalculator.ts
 * Utility untuk menghitung skor kepuasan rakyat berdasarkan 5 sektor:
 * Pajak, Harga Barang Pokok, Pangan, Listrik, Hunian
 *
 * Diekstrak dari StatistikKepuasanModal agar bisa dipanggil secara otomatis
 * di map-system.tsx tanpa harus membuka modal terlebih dahulu.
 */

import {
  calculateWeightedFoodCoverage,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic";
import { getCountryConsumptionBreakdown } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/1_grid_nasional/consumptionLogic";


// ─── Helper ─────────────────────────────────────────────────────────────────

function getTaxValue(detail: any, path: string[], fallback = 0): number {
  let current: any = detail;
  for (const key of path) {
    if (current == null || typeof current !== "object") return fallback;
    current = current[key];
  }
  return typeof current === "number" ? current : fallback;
}

function calculateIncomeAtRate(taxRate: number, maxIncome = 500): number {
  if (taxRate <= 0) return 0;
  if (taxRate >= 100) return maxIncome;
  return Math.round((taxRate / 100) * maxIncome);
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

export function calculatePajakScore(countryDetail: any): number {
  const vat = Number(getTaxValue(countryDetail, ["ppn"]) || getTaxValue(countryDetail, ["pajak", "ppn", "tarif"]) || 0);
  const corporate_tax = Number(getTaxValue(countryDetail, ["corporate"]) || getTaxValue(countryDetail, ["pajak", "korporasi", "tarif"]) || 0);
  const income_tax = Number(getTaxValue(countryDetail, ["income_tax"]) || getTaxValue(countryDetail, ["pajak", "penghasilan", "tarif"]) || 0);
  const cigarette_tax = Number(getTaxValue(countryDetail, ["cigarette_tax"]) || getTaxValue(countryDetail, ["pajak", "bea_cukai", "tarif"]) || 0);
  const environment_tax = Number(getTaxValue(countryDetail, ["environment_tax"]) || getTaxValue(countryDetail, ["pajak", "lingkungan", "tarif"]) || 0);

  const avgRate = (vat + corporate_tax + income_tax + cigarette_tax + environment_tax) / 5;
  const totalIncome =
    calculateIncomeAtRate(vat, 500) +
    calculateIncomeAtRate(corporate_tax, 500) +
    calculateIncomeAtRate(income_tax, 500) +
    calculateIncomeAtRate(cigarette_tax, 500) +
    calculateIncomeAtRate(environment_tax, 500);
  const maxIncome = 5 * 500;
  return Math.min(100, Math.max(1, Math.round(100 - avgRate + (totalIncome / maxIncome) * 20)));
}

export function calculateHargaScore(countryDetail: any): number {
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

export function calculatePanganScore(countryDetail: any, metadata: any): number {
  if (!countryDetail || !metadata || Object.keys(metadata).length === 0) return 50;
  return Math.round(Math.min(1, Math.max(0, calculateWeightedFoodCoverage(countryDetail, metadata))) * 100);
}

export function calculateListrikScore(countryDetail: any, metadata: any): number {
  if (!countryDetail || !metadata || Object.keys(metadata).length === 0) return 50;
  const { totalProductionMW, totalAllBreakdownConsumption } = getCountryConsumptionBreakdown(countryDetail, metadata);
  if (totalAllBreakdownConsumption <= 0) return 100;
  const coverage = Math.min(1, Math.max(0, totalProductionMW / totalAllBreakdownConsumption));
  return Math.round(coverage * 100);
}

export function calculateHunianScore(countryDetail: any, metadata?: any): number {
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

export function calculateLayananPublikScore(countryDetail: any): number {
  const population = Number(countryDetail?.jumlah_penduduk) || 0;
  if (population <= 0) return 50;

  const categories = [
    { keys: ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad"], target: 0.00005 },
    { keys: ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan", "literasi"], target: 0.0001 },
    { keys: ["rumah_sakit_besar", "rumah_sakit_kecil", "pusat_diagnostik", "harapan_hidup", "indeks_kesehatan"], target: 0.00004 },
    { keys: ["pusat_bantuan_hukum", "pengadilan", "kejaksaan", "pos_polisi", "armada_mobil_polisi", "akademi_polisi", "indeks_korupsi", "indeks_keamanan"], target: 0.0005 },
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

export function calculateKeterbukaanScore(countryDetail: any): number {
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

// ─── Main exported function ──────────────────────────────────────────────────

/**
 * Hitung skor kepuasan rakyat dari countryDetail & metadata.
 * Mengembalikan nilai 0–100 sebagai rata-rata 7 sektor.
 */
export function calculateKepuasan(countryDetail: any, metadata: any): number {
  if (!countryDetail) return 50;

  const pajakScore   = calculatePajakScore(countryDetail);
  const hargaScore   = calculateHargaScore(countryDetail);
  const panganScore  = calculatePanganScore(countryDetail, metadata);
  const listrikScore = calculateListrikScore(countryDetail, metadata);
  const hunianScore  = calculateHunianScore(countryDetail, metadata);
  const layananPublikScore = calculateLayananPublikScore(countryDetail);
  const keterbukaanScore   = calculateKeterbukaanScore(countryDetail);

  return (pajakScore + hargaScore + panganScore + listrikScore + hunianScore + layananPublikScore + keterbukaanScore) / 7;
}
