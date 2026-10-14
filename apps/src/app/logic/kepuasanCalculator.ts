/**
 * kepuasanCalculator.ts
 * Utility untuk menghitung skor kepuasan rakyat dari sektor dan kebijakan nasional.
 *
 * Diekstrak dari StatistikKepuasanModal agar bisa dipanggil secara otomatis
 * di map-system.tsx tanpa harus membuka modal terlebih dahulu.
 */

import {
  calculateFoodSatisfactionScore,
  calculateWeightedFoodCoverage,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic";
import { getCountryConsumptionBreakdown } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/1_grid_nasional/consumptionLogic";
import { calculateIncomeAtRate } from "@/app/logic/economic_logic/2_tax_logic/taxLogic";
import { applyOrthodoxPersonalIncomeTaxRevenueBonus } from "@/app/page/bonus_logic/agama_bonus_logic/kristen";
import { applyBuddhaEnvironmentalTaxRevenueBonus } from "@/app/page/bonus_logic/agama_bonus_logic/buddha";
import { applyDemocracyTaxRevenueBonus } from "@/app/page/bonus_logic/ideologi_bonus_logic/demokrasi";
import { applyCapitalismTaxRevenueBonus } from "@/app/page/bonus_logic/ideologi_bonus_logic/kapitalisme";
import { applyLiberalismTaxRevenueBonus } from "@/app/page/bonus_logic/ideologi_bonus_logic/liberalisme";
import { applyConservatismTaxRevenueBonus } from "@/app/page/bonus_logic/ideologi_bonus_logic/konservatisme";
import {
  calculateEconomicPolicyAverage,
  type NationalizationLevels,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/4_ekonomi/7_sistem_ekonomi/logic/nationalizationLogic";
import {
  INITIAL_SUBSIDY_ITEMS,
  calculateSubsidySummary,
} from "@/../../json/database_kebijakan_subsidi/index";
import { applyTotalHousingCapacityBonus } from "@/app/page/bonus_logic";


// ─── Helper ─────────────────────────────────────────────────────────────────

function getTaxValue(detail: any, path: string[]): number | undefined {
  let current: any = detail;
  for (const key of path) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[key];
  }
  return typeof current === "number" && Number.isFinite(current) ? current : undefined;
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

export interface TaxSatisfactionRates {
  income_tax: number;
  corporate_tax: number;
  vat: number;
  cigarette_tax: number;
  environment_tax: number;
}

const applyIdeologyTaxBonus = (revenue: number, ideology: unknown) =>
  applyLiberalismTaxRevenueBonus(
    applyCapitalismTaxRevenueBonus(
      applyConservatismTaxRevenueBonus(
        applyDemocracyTaxRevenueBonus(revenue, ideology),
        ideology,
      ),
      ideology,
    ),
    ideology,
  );

export function calculateTaxSatisfaction(
  countryDetail: Record<string, unknown> | null,
  rates?: Partial<TaxSatisfactionRates>,
): number {
  const resolvedRates: TaxSatisfactionRates = {
    income_tax:
      rates?.income_tax ??
      getTaxValue(countryDetail, ["income_tax"]) ??
      getTaxValue(countryDetail, ["pajak", "penghasilan", "tarif"]) ??
      0,
    corporate_tax:
      rates?.corporate_tax ??
      getTaxValue(countryDetail, ["corporate"]) ??
      getTaxValue(countryDetail, ["pajak", "korporasi", "tarif"]) ??
      0,
    vat:
      rates?.vat ??
      getTaxValue(countryDetail, ["ppn"]) ??
      getTaxValue(countryDetail, ["pajak", "ppn", "tarif"]) ??
      0,
    cigarette_tax:
      rates?.cigarette_tax ??
      getTaxValue(countryDetail, ["cigarette_tax"]) ??
      getTaxValue(countryDetail, ["pajak", "bea_cukai", "tarif"]) ??
      0,
    environment_tax:
      rates?.environment_tax ??
      getTaxValue(countryDetail, ["environment_tax"]) ??
      getTaxValue(countryDetail, ["pajak", "lingkungan", "tarif"]) ??
      0,
  };
  const averageRate = Object.values(resolvedRates).reduce((total, rate) => total + rate, 0) / 5;
  const ideology = countryDetail?.ideology;
  const totalIncome =
    applyIdeologyTaxBonus(calculateIncomeAtRate(resolvedRates.vat, 500), ideology) +
    applyIdeologyTaxBonus(calculateIncomeAtRate(resolvedRates.corporate_tax, 500), ideology) +
    applyIdeologyTaxBonus(
      applyOrthodoxPersonalIncomeTaxRevenueBonus(
        calculateIncomeAtRate(resolvedRates.income_tax, 500),
        countryDetail?.religion,
      ),
      ideology,
    ) +
    applyIdeologyTaxBonus(calculateIncomeAtRate(resolvedRates.cigarette_tax, 500), ideology) +
    applyIdeologyTaxBonus(
      applyBuddhaEnvironmentalTaxRevenueBonus(
        calculateIncomeAtRate(resolvedRates.environment_tax, 500),
        countryDetail?.religion,
      ),
      ideology,
    );

  return Math.min(
    100,
    Math.max(1, Math.round(100 - averageRate + (totalIncome / (5 * 500)) * 20)),
  );
}

function calculateRawPajakScore(countryDetail: any): number {
  return calculateTaxSatisfaction(countryDetail);
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
    const baseCapacity = Number(meta?.kapasitas) || DEFAULT_CAPACITIES[key] || 4;
    const capacity = applyTotalHousingCapacityBonus(baseCapacity, countryDetail);
    totalHousingCapacity += count * capacity;
  });

  if (population <= 0) return 50;
  if (totalHousingCapacity <= 0) return 1;
  const coverage = Math.min(1, Math.max(0, totalHousingCapacity / population));
  return Math.min(100, Math.max(1, Math.round(coverage * 100)));
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
export const PUBLIC_SERVICE_CATEGORIES = {
  infrastruktur: {
    keys: ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad"],
    targetRatio: 0.00005,
  },
  pendidikan: {
    keys: ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan"],
    targetRatio: 0.0001,
  },
  kesehatan: {
    keys: ["rumah_sakit_besar", "rumah_sakit_kecil", "pusat_diagnostik"],
    targetRatio: 0.00004,
  },
  penegakan_hukum: {
    keys: PENEGAKAN_HUKUM_KEYS,
    targetRatio: PENEGAKAN_HUKUM_TARGET_RATIO,
  },
  olahraga_hiburan: {
    keys: ["kolam_renang", "sirkuit_balap", "stadion", "stadion_internasional", "gym", "golf", "esports", "gokart", "bioskop", "teater"],
    targetRatio: 0.00008,
  },
  komersial: {
    keys: ["mall", "hotel", "pusat_grosir_tekstil"],
    targetRatio: 0.00002,
  },
} as const;
export type PublicServiceCategoryId = keyof typeof PUBLIC_SERVICE_CATEGORIES;
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
export interface SatisfactionIndicatorScores {
  pajak: number;
  harga: number;
  pangan: number;
  listrik: number;
  hunian: number;
  layananPublik: number;
  keterbukaan: number;
  sistemEkonomi: number;
  subsidi: number;
}

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
  const scores = Object.values(PUBLIC_SERVICE_CATEGORIES).map((category) =>
    calculatePublicServiceCategoryRawScore(countryDetail, category.keys, category.targetRatio),
  );
  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
}

function calculatePublicServiceCategoryRawScore(
  countryDetail: Record<string, unknown> | null,
  keys: readonly string[],
  targetRatio: number,
): number {
  const population = Number(countryDetail?.jumlah_penduduk) || 1;
  const totalFacilities = keys.reduce(
    (total, key) => total + (Number(countryDetail?.[key]) || 0),
    0,
  );
  return Math.round(Math.min(100, (totalFacilities / population / targetRatio) * 100));
}

function calculateRawInfrastructureScore(
  countryDetail: Record<string, unknown> | null,
): number {
  const population = Number(countryDetail?.jumlah_penduduk) || 10_000_000;
  const infrastructureKeys = [
    "jalur_sepeda",
    "jalan_raya",
    "terminal_bus",
    "stasiun_kereta_api",
    "kereta_bawah_tanah",
    "pelabuhan",
    "bandara",
    "helipad",
  ];
  const totalFacilities = infrastructureKeys.reduce(
    (total, key) => total + (Number(countryDetail?.[key]) || 0),
    0,
  );
  return Math.round(Math.min(100, (totalFacilities / population / 0.00005) * 100));
}

function calculateRawKeterbukaanScore(countryDetail: any): number {
  if (!countryDetail) return 50;

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

export function calculatePublicServiceCategoryScores(
  countryDetail: Record<string, unknown> | null,
): Record<PublicServiceCategoryId, number> {
  const sectorScores = getSatisfactionSectorScores(countryDetail, undefined);

  return {
    infrastruktur: calculatePublicServiceCategoryRawScore(
      countryDetail,
      PUBLIC_SERVICE_CATEGORIES.infrastruktur.keys,
      PUBLIC_SERVICE_CATEGORIES.infrastruktur.targetRatio,
    ),
    pendidikan: calculatePublicServiceCategoryRawScore(
      countryDetail,
      PUBLIC_SERVICE_CATEGORIES.pendidikan.keys,
      PUBLIC_SERVICE_CATEGORIES.pendidikan.targetRatio,
    ),
    kesehatan: sectorScores.kesehatan,
    penegakan_hukum: sectorScores.penegakanHukum,
    olahraga_hiburan: calculatePublicServiceCategoryRawScore(
      countryDetail,
      PUBLIC_SERVICE_CATEGORIES.olahraga_hiburan.keys,
      PUBLIC_SERVICE_CATEGORIES.olahraga_hiburan.targetRatio,
    ),
    komersial: calculatePublicServiceCategoryRawScore(
      countryDetail,
      PUBLIC_SERVICE_CATEGORIES.komersial.keys,
      PUBLIC_SERVICE_CATEGORIES.komersial.targetRatio,
    ),
  };
}

export function calculateLayananPublikScore(countryDetail: any): number {
  const categoryScores = Object.values(calculatePublicServiceCategoryScores(countryDetail));
  return Math.round(categoryScores.reduce((total, score) => total + score, 0) / 6);
}

export function calculateSatisfactionIndicatorScores(
  countryDetail: Record<string, unknown> | null,
  metadata: Record<string, unknown>,
): SatisfactionIndicatorScores {
  return {
    pajak: calculateRawPajakScore(countryDetail),
    harga: calculateRawHargaScore(countryDetail),
    pangan: getSatisfactionSectorScores(countryDetail, metadata).pangan,
    listrik: calculateRawListrikScore(countryDetail, metadata),
    hunian: calculateRawHunianScore(countryDetail, metadata),
    layananPublik: calculateLayananPublikScore(countryDetail),
    keterbukaan: calculateRawKeterbukaanScore(countryDetail),
    sistemEkonomi: calculateEconomicPolicySatisfaction(countryDetail),
    subsidi: calculateSubsidySatisfaction(countryDetail),
  };
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

export function calculateKeterbukaanScore(countryDetail: any): number {
  return getSatisfactionSectorScores(countryDetail, undefined).keterbukaan;
}

export function calculateEconomicPolicySatisfaction(countryDetail: any): number {
  const policyChoices: Record<string, "A" | "B"> = {
    price_control: countryDetail?.policy_price_control === "B" ? "B" : "A",
    strategic_ownership: countryDetail?.policy_strategic_ownership === "B" ? "B" : "A",
    trade_policy: countryDetail?.policy_trade_policy === "B" ? "B" : "A",
    labor_regulation: countryDetail?.policy_labor_regulation === "B" ? "B" : "A",
    land_property_rights: countryDetail?.policy_land_property_rights === "B" ? "B" : "A",
    labor_unions_rights: countryDetail?.policy_labor_unions_rights === "B" ? "B" : "A",
    monetary_banking: countryDetail?.policy_monetary_banking === "B" ? "B" : "A",
  };
  const sectorLevels = countryDetail?.sector_nationalization as NationalizationLevels | undefined;
  return calculateEconomicPolicyAverage(
    Number(countryDetail?.sistem_ekonomi_val ?? 50),
    policyChoices,
    sectorLevels
  );
}

export function calculateSubsidySatisfaction(countryDetail: any): number {
  const items = Array.isArray(countryDetail)
    ? countryDetail
    : INITIAL_SUBSIDY_ITEMS.map((item) => {
        const savedStates = countryDetail?.subsidy_states as Record<string, boolean> | undefined;
        return {
          ...item,
          isSubsidized: savedStates?.[item.id] ?? item.isSubsidized,
        };
      });
  const summary = calculateSubsidySummary(items);
  const maximumApprovalBonus = INITIAL_SUBSIDY_ITEMS.reduce(
    (total, item) => total + item.approvalImpact,
    0
  );
  return maximumApprovalBonus > 0
    ? Math.min(100, Math.max(0, Math.round(summary.totalApprovalBonus / maximumApprovalBonus * 100)))
    : 0;
}

export function countLowSatisfactionSectors(countryDetail: any, metadata: any): number {
  return Object.values(getSatisfactionSectorScores(countryDetail, metadata))
    .filter((score) => score < LOW_SECTOR_SCORE_THRESHOLD).length;
}

// ─── Main exported function ──────────────────────────────────────────────────

/**
 * Hitung skor kepuasan rakyat dari countryDetail & metadata.
 * Skor umum adalah rata-rata dari sembilan indikator yang ditampilkan pada kartu Kepuasan Rakyat.
 */
export function calculateKepuasan(countryDetail: any, metadata: any): number {
  if (!countryDetail) return 50;

  const indicatorScores = calculateSatisfactionIndicatorScores(countryDetail, metadata ?? {});
  const scores = Object.values(indicatorScores);
  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
}
