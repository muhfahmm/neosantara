/**
 * kepuasanCalculator.ts
 * Utility untuk menghitung skor kepuasan rakyat berdasarkan 5 sektor:
 * Pajak, Harga Barang Pokok, Pangan, Listrik, Hunian
 *
 * Diekstrak dari StatistikKepuasanModal agar bisa dipanggil secara otomatis
 * di map-system.tsx tanpa harus membuka modal terlebih dahulu.
 */

import {
  FOOD_CONSUMPTION_PER_CAPITA,
  calculateProduction,
  calculateConsumption,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic";
import { getDoktrinKeterbukaan } from "@/../../json/database_doktrin_keterbukaan/index";

// ─── Helper ─────────────────────────────────────────────────────────────────

function getTaxValue(detail: any, path: string[], fallback = 0): number {
  let current: any = detail;
  for (const key of path) {
    if (current == null || typeof current !== "object") return fallback;
    current = current[key];
  }
  return typeof current === "number" ? current : fallback;
}

function calculateIncomeAtRate(taxRate: number, maxIncome = 1000): number {
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

function calculateBuildingElectricityConsumption(country: any, metadata: any): number {
  if (!metadata || !country) return 0;
  let totalBuildingConsumption = 0;
  Object.keys(metadata).forEach((key) => {
    const bMeta = metadata[key];
    const konsumsi = Number(bMeta?.konsumsi_listrik) || 0;
    if (konsumsi <= 0) return;
    const possibleKeys = [
      key,
      bMeta?.dataKey,
      key.replace(/^\d+_/, ""),
      bMeta?.dataKey ? bMeta.dataKey.replace(/^\d+_/, "") : undefined,
    ].filter(Boolean) as string[];
    let count = 0;
    for (const pKey of possibleKeys) {
      if (country[pKey] !== undefined && country[pKey] !== null) {
        count = Number(country[pKey]) || 0;
        break;
      }
    }
    if (count > 0) {
      totalBuildingConsumption += count * konsumsi;
    }
  });
  return totalBuildingConsumption;
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
    calculateIncomeAtRate(vat, 1000) +
    calculateIncomeAtRate(corporate_tax, 1000) +
    calculateIncomeAtRate(income_tax, 1000) +
    calculateIncomeAtRate(cigarette_tax, 1000) +
    calculateIncomeAtRate(environment_tax, 1000);
  const maxIncome = 5 * 1000;
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
  const population =
    countryDetail?.jumlah_penduduk ??
    countryDetail?.population ??
    countryDetail?.pop ??
    countryDetail?.penduduk ??
    countryDetail?.total_population ??
    0;

  if (population <= 0 || !metadata) return 50;

  const allKeys = Object.keys(FOOD_CONSUMPTION_PER_CAPITA);
  let totalRatio = 0;
  let count = 0;
  for (const key of allKeys) {
    const prod = calculateProduction(key, countryDetail, metadata);
    const cons = calculateConsumption(population, FOOD_CONSUMPTION_PER_CAPITA[key]);
    if (cons > 0) {
      const ratio = prod / cons;
      totalRatio += Math.min(ratio, 2);
      count++;
    }
  }
  if (count === 0) return 50;
  const avgRatio = totalRatio / count;
  return Math.min(100, Math.max(1, Math.round((avgRatio / 2) * 100)));
}

export function calculateListrikScore(countryDetail: any, metadata: any): number {
  const population = countryDetail?.jumlah_penduduk ?? countryDetail?.population ?? 0;

  const SOURCE_ORDER = [
    "pembangkit_listrik_tenaga_nuklir",
    "pembangkit_listrik_tenaga_air",
    "pembangkit_listrik_tenaga_surya",
    "pembangkit_listrik_tenaga_uap",
    "pembangkit_listrik_tenaga_gas",
    "pembangkit_listrik_tenaga_angin",
  ];

  const powerSources = SOURCE_ORDER.map((key) => {
    const bMeta = findMeta(key, metadata);
    const count = Number(countryDetail?.[key]) || 0;
    const unitProduction = Number(bMeta?.produksi) || 0;
    return { value: count, unitProduction };
  });

  const totalCapacityMW = powerSources.reduce(
    (sum, source) => sum + source.value * source.unitProduction,
    0
  );

  const userBuildingConsumption = calculateBuildingElectricityConsumption(countryDetail, metadata);
  const populationDemand = 0;
  const estimatedConsumptionMW = Math.max(0, Math.round(userBuildingConsumption + populationDemand));

  if (estimatedConsumptionMW <= 0) return 50;
  const ratio = Math.min(totalCapacityMW / estimatedConsumptionMW, 2);
  return Math.min(100, Math.max(1, Math.round((ratio / 2) * 100)));
}

export function calculateHunianScore(countryDetail: any, metadata: any): number {
  const population = countryDetail?.jumlah_penduduk ?? countryDetail?.population ?? 0;

  const HUNIAN_KEYS = ["rumah_subsidi", "apartemen", "mansion"];
  let totalHousingCapacity = 0;
  if (metadata) {
    HUNIAN_KEYS.forEach((key) => {
      const count = Number(countryDetail?.[key]) || 0;
      const meta = findMeta(key, metadata);
      const capacity = Number(meta?.kapasitas) || 0;
      totalHousingCapacity += count * capacity;
    });
  }

  if (population <= 0) return 50;
  if (totalHousingCapacity <= 0) return 1;
  const ratio = Math.min(totalHousingCapacity / population, 2);
  return Math.min(100, Math.max(1, Math.round((ratio / 2) * 100)));
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

  const countryName = countryDetail?.nama_negara || countryDetail?.country || countryDetail?.name_id || countryDetail?.name_en || "";
  const dbData = getDoktrinKeterbukaan(countryName) || {};

  const speechScore = Number(countryDetail?.speechScore ?? dbData.speechScore ?? 50);
  const religionScore = Number(countryDetail?.religionScore ?? dbData.religionScore ?? 60);
  const demoScore = Number(countryDetail?.demoScore ?? dbData.demoScore ?? 45);
  const transparencyScore = Number(countryDetail?.transparencyScore ?? dbData.transparencyScore ?? 55);
  const mediaScore = Number(countryDetail?.mediaScore ?? dbData.mediaScore ?? 50);
  const internetScore = Number(countryDetail?.internetScore ?? dbData.internetScore ?? 60);
  const borderScore = Number(countryDetail?.borderScore ?? dbData.borderScore ?? 40);
  const tradeScore = Number(countryDetail?.tradeScore ?? dbData.tradeScore ?? 60);
  const diplomacyScore = Number(countryDetail?.diplomacyScore ?? dbData.diplomacyScore ?? 55);

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
