/**
 * Population Logic - Otak Sistem Populasi Dinamis
 * Mirip dengan treasuryUpdater.ts, tapi untuk populasi dengan +/- daily change
 */

import { logger } from '../../../lib/logger';
import { applyHinduPopulationGrowthBonus } from "@/app/page/bonus_logic/agama_bonus_logic/hindu";
import { applySocialismBirthRateBonus } from "@/app/page/bonus_logic/ideologi_bonus_logic/sosialisme";

// Import dari logic yang baru dibuat
import { calculateKeamananLogic } from "@/app/page/navigasi_menu/2_navigasi_bawah/2_populasi/kematian_modals/logic/keamananLogic";
import { calculateKesehatanLogic } from "@/app/page/navigasi_menu/2_navigasi_bawah/2_populasi/kematian_modals/logic/kesehatanLogic";
import { calculateTunawismaLogic } from "@/app/page/navigasi_menu/2_navigasi_bawah/2_populasi/kematian_modals/logic/tunawismaLogic";
import { calculateKriminalitasLogic } from "@/app/page/navigasi_menu/2_navigasi_bawah/2_populasi/kematian_modals/logic/kriminalitasLogic";
import {
  calculateFoodDeficitCount,
  calculateFoodSurplusRatio,
  calculateWeightedFoodCoverage,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic";

// ==============================
// Interface Tipe Data
// ==============================
export interface CountryDetail {
  jumlah_penduduk: number;
  rata_rata_pajak?: number;
  living_cost_index?: number;
  indeks_ketahanan_pangan?: number;
  surplus_listrik?: number;
  tingkat_hunian_layak?: number;
  harapan_hidup?: number;
  tingkat_keamanan?: number;
  inisiatif_aktif?: { nama: string; boost: number }[];
  [key: string]: any;
}

export interface PopulationDailyMetrics {
  dailyBirths: number;
  dailyDeaths: number;
  netDailyChange: number;
  homelessCount: number;
  kepuasanUmum: number;
  lifeExpectancy: number;
  securityLevel: number;
  foodRatio: number;
  foodTier: number;
  housingFulfillment: number;
  housingTier: number;
  overpopulationTier: number;
  healthIndex: number;
  healthTier: number;
  famineDeaths: number;
  foodDeficitDeaths: number;
  outbreakDeaths: number;
  outbreakBirthLoss: number;
  populationStatus: PopulationStatus;
}

export interface PopulationStatus {
  tier: number;
  label: string;
  labelEn: string;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface PopulationMultiplier {
  kelahiran: number;
  kematian: number;
  tier: number;
  label: string;
  labelEn: string;
  color: string;
}

export interface PopulationSectoral {
  pajak: number;
  harga: number;
  pangan: number;
  listrik: number;
  hunian: number;
}

const finiteNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getElapsedDays = (startDate: string, currentDate: string): number => {
  const start = Date.parse(`${startDate.slice(0, 10)}T00:00:00Z`);
  const current = Date.parse(`${currentDate.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(current)) return Number.POSITIVE_INFINITY;
  return Math.floor((current - start) / 86_400_000);
};

export const hitungRasioPangan = (country: CountryDetail, metadata: Record<string, any> = {}): number => {
  if (Object.keys(metadata).length > 0) {
    return calculateWeightedFoodCoverage(country, metadata);
  }
  return Math.max(0, finiteNumber(country.food_supply_ratio ?? country.food_ratio, 1));
};

export const hitungKeterpenuhanHunian = (country: CountryDetail, metadata: Record<string, any> = {}): number => {
  const population = Math.max(0, finiteNumber(country.jumlah_penduduk));
  if (population === 0) return 1;
  const capacities: Record<string, number> = {
    rumah_subsidi: 5,
    apartemen: 6000,
    mansion: 10,
  };
  const calculatedCapacity = Object.entries(capacities).reduce((total, [key, defaultCapacity]) => {
    const unitCapacity = finiteNumber(metadata[key]?.kapasitas, defaultCapacity);
    return total + Math.max(0, finiteNumber(country[key])) * unitCapacity;
  }, 0);
  const declaredCapacity = finiteNumber(country.total_kapasitas_hunian);
  const capacity = Math.max(0, declaredCapacity > 0 ? declaredCapacity : calculatedCapacity);
  return capacity / population;
};

export const getPanganMultiplier = (ratio: number): PopulationMultiplier => {
  if (ratio > 1.1) return { kelahiran: 1.1, kematian: 0.9, tier: 0, label: 'Surplus', labelEn: 'Surplus', color: 'emerald' };
  if (ratio >= 1) return { kelahiran: 1, kematian: 1, tier: 1, label: 'Aman', labelEn: 'Stable', color: 'green' };
  if (ratio >= 0.95) return { kelahiran: 0.85, kematian: 1.1, tier: 2, label: 'Waspada', labelEn: 'Watch', color: 'yellow' };
  if (ratio >= 0.85) return { kelahiran: 0.65, kematian: 1.3, tier: 3, label: 'Defisit ringan', labelEn: 'Mild deficit', color: 'amber' };
  if (ratio >= 0.7) return { kelahiran: 0.4, kematian: 1.6, tier: 4, label: 'Defisit sedang', labelEn: 'Moderate deficit', color: 'orange' };
  if (ratio >= 0.5) return { kelahiran: 0.15, kematian: 2.2, tier: 5, label: 'Defisit berat', labelEn: 'Severe deficit', color: 'red' };
  return { kelahiran: 0, kematian: 3.5, tier: 6, label: 'Kelaparan', labelEn: 'Famine', color: 'rose' };
};

type FoodDeficitCountryTier = 'kaya' | 'berkembang' | 'miskin';

const FOOD_DEFICIT_COUNTRY_TIERS: Record<FoodDeficitCountryTier, Set<string>> = {
  kaya: new Set(`amerika_serikat china jerman jepang inggris india prancis italia rusia brazil kanada australia meksiko spanyol korea_selatan turki indonesia belanda arab_saudi swiss polandia taiwan irlandia belgia swedia israel argentina singapura austria uni_emirat_arab`.split(' ')),
  berkembang: new Set(`norwegia thailand kolombia vietnam malaysia filipina bangladesh denmark republik_rumania afrika_selatan pakistan hong_kong ceko mesir chile peru portugal nigeria kazakhstan finlandia aljazair yunani iran selandia_baru hungaria irak ukraina qatar maroko uzbekistan kuwait slowakia angola bulgaria kenya ekuador republik_dominika puerto_rico guatemala republik_demokratik_kongo ethiopia ghana oman kroasia pantai_gading republik_serbia venezuela luksemburg costa_rica kuba lithuania belarus sri_lanka uruguay panama republik_tanzania slovenia myanmar turkmenistan bolivia azerbaijan republik_uganda kamerun yordania tunisia paraguay suriah republik_zimbabwe makau latvia libya kamboja estonia bahrain nepal siprus republik_sudan islandia georgia honduras republik_zambia senegal el_salvador haiti bosnia_dan_hercegovina lebanon papua_nugini guyana mali albania burkina_faso armenia malta guinea mongolia benin trinidad_dan_tobago chad niger nikaragua`.split(' ')),
  miskin: new Set(`kirgizstan gabon mozambik jamaika botswana moldova makedonia_utara madagaskar tajikistan afganistan laos malawi rwanda namibia korea_utara mauritius bahama kongo brunei palestina mauritania somalia kosovo togo monako montenegro liechtenstein bermuda barbados sierra_leone burundi maldives yaman guam fiji tahiti sudan_selatan suriname eswatini guiana_prancis liberia andorra djibouti kepulauan_faroe bhutan curacao republik_afrika_tengah belize tanjung_verde greenland guinea_bissau lesotho gambia saint_lucia san_marino antigua_dan_barbuda gibraltar seychelles republik_timor_leste eritrea komoro grenada vanuatu samoa saint_vincent_dan_grenadine sao_tome_dan_principe saint_kitts_dan_nevis samoa_amerika dominika tonga mikronesia kiribati palau marshall nauru tuvalu vatikan`.split(' ')),
};

export const getFoodDeficitDeclineRate = (
  country: CountryDetail,
  population: number,
  deficitCount: number
): number => {
  if (population >= 500_000_000 && deficitCount >= 5) return 0.05;

  const slug = String(country.country_slug ?? '').toLowerCase();
  const tier: FoodDeficitCountryTier = FOOD_DEFICIT_COUNTRY_TIERS.kaya.has(slug)
    ? 'kaya'
    : FOOD_DEFICIT_COUNTRY_TIERS.miskin.has(slug)
      ? 'miskin'
      : 'berkembang';
  const [start, maximum] = tier === 'kaya'
    ? [5, 10]
    : tier === 'berkembang'
      ? [10, 15]
      : [15, 20];

  if (deficitCount < start) return 0;
  return Math.min(1, (deficitCount - start + 1) / (maximum - start + 1)) * 0.05;
};

export const getHunianMultiplier = (fulfillment: number): PopulationMultiplier => {
  if (fulfillment > 1) return { kelahiran: 1.1, kematian: 0.95, tier: 0, label: 'Berlebih', labelEn: 'Ample', color: 'emerald' };
  if (fulfillment >= 0.9) return { kelahiran: 1, kematian: 1, tier: 1, label: 'Aman', labelEn: 'Adequate', color: 'green' };
  if (fulfillment >= 0.7) return { kelahiran: 0.85, kematian: 1.05, tier: 2, label: 'Cukup', labelEn: 'Sufficient', color: 'yellow' };
  if (fulfillment >= 0.5) return { kelahiran: 0.65, kematian: 1.15, tier: 3, label: 'Padat', labelEn: 'Crowded', color: 'amber' };
  if (fulfillment >= 0.3) return { kelahiran: 0.4, kematian: 1.3, tier: 4, label: 'Sesak', labelEn: 'Overcrowded', color: 'orange' };
  if (fulfillment >= 0.1) return { kelahiran: 0.2, kematian: 1.5, tier: 5, label: 'Krisis hunian', labelEn: 'Housing crisis', color: 'red' };
  return { kelahiran: 0.05, kematian: 1.8, tier: 6, label: 'Tunawisma massal', labelEn: 'Mass homelessness', color: 'rose' };
};

export const getOverpopMultiplier = (population: number): PopulationMultiplier => {
  if (population < 500_000_000) return { kelahiran: 1.1, kematian: 1, tier: 0, label: 'Normal', labelEn: 'Normal', color: 'emerald' };
  if (population < 1_000_000_000) return { kelahiran: 1, kematian: 1, tier: 1, label: 'Berkembang', labelEn: 'Developing', color: 'green' };
  if (population < 2_000_000_000) return { kelahiran: 0.75, kematian: 1.15, tier: 2, label: 'Padat', labelEn: 'Dense', color: 'yellow' };
  if (population < 3_000_000_000) return { kelahiran: 0.5, kematian: 1.35, tier: 3, label: 'Overpopulasi', labelEn: 'Overpopulated', color: 'orange' };
  if (population < 5_000_000_000) return { kelahiran: 0.25, kematian: 1.6, tier: 4, label: 'Super overpopulasi', labelEn: 'Severely overpopulated', color: 'red' };
  return { kelahiran: 0.05, kematian: 2, tier: 5, label: 'Kehancuran', labelEn: 'Collapse', color: 'rose' };
};

export const getKesehatanMultiplier = (health: number): PopulationMultiplier => {
  if (health > 80) return { kelahiran: 1.05, kematian: 0.9, tier: 0, label: 'Sehat', labelEn: 'Healthy', color: 'emerald' };
  if (health >= 60) return { kelahiran: 1, kematian: 1, tier: 1, label: 'Baik', labelEn: 'Good', color: 'green' };
  if (health >= 40) return { kelahiran: 0.9, kematian: 1.1, tier: 2, label: 'Sedang', labelEn: 'Fair', color: 'yellow' };
  if (health >= 20) return { kelahiran: 0.75, kematian: 1.3, tier: 3, label: 'Buruk', labelEn: 'Poor', color: 'orange' };
  if (health >= 10) return { kelahiran: 0.5, kematian: 1.6, tier: 4, label: 'Krisis', labelEn: 'Critical', color: 'red' };
  return { kelahiran: 0.2, kematian: 2, tier: 5, label: 'Wabah', labelEn: 'Emergency', color: 'rose' };
};

export const getPopulationGrowthMultiplier = (
  foodTier: number,
  housingTier: number,
  overpopulationTier: number,
  healthTier: number
): number => {
  const foodFactors = [1.1, 1, 0.95, 0.9, 0.75, 0.5, 0.25];
  const housingFactors = [1.05, 1, 0.95, 0.9, 0.8, 0.65, 0.45];
  const overpopulationFactors = [1.1, 1, 0.9, 0.75, 0.55, 0.35];
  const healthFactors = [1.05, 1, 0.95, 0.85, 0.7, 0.5];
  return (foodFactors[foodTier] ?? foodFactors[foodFactors.length - 1]) *
    (housingFactors[housingTier] ?? housingFactors[housingFactors.length - 1]) *
    (overpopulationFactors[overpopulationTier] ?? overpopulationFactors[overpopulationFactors.length - 1]) *
    (healthFactors[healthTier] ?? healthFactors[healthFactors.length - 1]);
};

export const hitungKematianKelaparan = (population: number, foodRatio: number): number =>
  foodRatio < 0.7 ? Math.floor(Math.max(0, population) * (0.7 - foodRatio) * 0.0001) : 0;

export const hitungDampakWabah = (
  outbreaks: Array<Record<string, any>> = [],
  currentDate = new Date().toISOString().slice(0, 10)
): { kematianTambahan: number; kelahiranBerkurang: number } => {
  let kematianTambahan = 0;
  let kelahiranBerkurang = 0;
  for (const outbreak of outbreaks) {
    const startDate = String(outbreak.startDate || outbreak.timestamp || '').slice(0, 10);
    const durationDays = Math.max(0, finiteNumber(outbreak.durationDays));
    const elapsed = getElapsedDays(startDate, currentDate);
    if (!startDate || elapsed < 0 || elapsed >= durationDays) continue;
    const victims = Math.max(0, finiteNumber(outbreak.korban));
    const category = String(outbreak.category || '');
    if (category.includes('Hewan') || category.includes('Tumbuhan')) {
      kelahiranBerkurang += victims * 0.01;
    } else if (category.includes('Mutasi')) {
      kematianTambahan += victims * 0.1;
      kelahiranBerkurang += victims * 0.05;
    } else if (category.includes('Pandemi')) {
      kematianTambahan += victims * 0.15;
      kelahiranBerkurang += victims * 0.1;
    } else {
      kematianTambahan += victims * 0.05;
      kelahiranBerkurang += victims * 0.02;
    }
  }
  return { kematianTambahan: Math.floor(kematianTambahan), kelahiranBerkurang: Math.floor(kelahiranBerkurang) };
};

export const hitungDampakBencana = (
  disasters: Array<Record<string, any>> = [],
  currentDate = new Date().toISOString().slice(0, 10)
): { healthMultiplier: number } => {
  const active = disasters.some((disaster) => {
    const startDate = String(disaster.startDate || '').slice(0, 10);
    const elapsed = getElapsedDays(startDate, currentDate);
    return startDate && elapsed >= 0 && elapsed < Math.max(0, finiteNumber(disaster.durationDays, 30));
  });
  return { healthMultiplier: active ? 0.9 : 1 };
};

export const getPopulationStatus = (
  foodTier: number,
  housingTier: number,
  overpopulationTier: number,
  healthTier: number
): PopulationStatus => {
  const tier = Math.max(foodTier, housingTier, overpopulationTier, healthTier);
  const severeFactorCount = [
    foodTier >= 4,
    housingTier >= 5,
    overpopulationTier >= 3,
    healthTier >= 4,
  ].filter(Boolean).length;
  if (foodTier >= 6 && severeFactorCount >= 2) {
    return { tier, label: 'KRISIS KEMANUSIAAN', labelEn: 'HUMANITARIAN CRISIS', color: 'rose', priority: 'critical' };
  }
  if (severeFactorCount >= 3) return { tier, label: 'KRISIS NASIONAL', labelEn: 'NATIONAL CRISIS', color: 'red', priority: 'high' };
  if (foodTier >= 6) return { tier, label: 'KRISIS PANGAN', labelEn: 'FOOD CRISIS', color: 'red', priority: 'high' };
  if (severeFactorCount >= 2) return { tier, label: 'TEKANAN DEMOGRAFI', labelEn: 'DEMOGRAPHIC PRESSURE', color: 'orange', priority: 'medium' };
  if (tier >= 3) return { tier, label: 'PERLU PERHATIAN', labelEn: 'NEEDS ATTENTION', color: 'yellow', priority: 'low' };
  if (tier >= 2) return { tier, label: 'PERLU PERHATIAN', labelEn: 'NEEDS ATTENTION', color: 'yellow', priority: 'low' };
  return { tier, label: 'STABIL', labelEn: 'STABLE', color: 'emerald', priority: 'low' };
};

// ==============================
// ==============================
// 1. Hitung Kepuasan Sektoral
// ==============================
export const calculateSectoralSatisfaction = (detail: CountryDetail): PopulationSectoral => {
  const pajak = detail.rata_rata_pajak !== undefined
    ? Math.max(0, Math.min(100, 100 - detail.rata_rata_pajak))
    : 50;

  const harga = detail.living_cost_index !== undefined
    ? Math.max(0, Math.min(100, 100 - detail.living_cost_index))
    : 50;

  const pangan = detail.indeks_ketahanan_pangan ?? 50;

  let listrik = 50;
  if (detail.surplus_listrik !== undefined) {
    if (detail.surplus_listrik > 50) listrik = 80;
    else if (detail.surplus_listrik > 0) listrik = 70;
    else if (detail.surplus_listrik > -50) listrik = 40;
    else listrik = 20;
  }

  const hunian = detail.tingkat_hunian_layak ?? 50;

  return { pajak, harga, pangan, listrik, hunian };
};

// ==============================
// 2. Hitung Kepuasan Umum
// ==============================
export const calculateGeneralSatisfaction = (detail: CountryDetail): number => {
  const sektoral = calculateSectoralSatisfaction(detail);
  const averageSectoral = (sektoral.pajak + sektoral.harga + sektoral.pangan + sektoral.listrik + sektoral.hunian) / 5;
  const initiativeBoost = detail.inisiatif_aktif?.reduce((sum, ini) => sum + ini.boost, 0) ?? 0;
  const generalSatisfaction = Math.min(200, averageSectoral + initiativeBoost);
  return generalSatisfaction;
};

// ==============================
// 3. Hitung Life Expectancy & Security
// ==============================
export const calculateLifeExpectancy = (detail: CountryDetail, satisfaction: number): number => {
  const baseLife = detail.harapan_hidup ?? 73.2;
  return Math.max(30, baseLife + (satisfaction - 50) * 0.1);
};

export const calculateSecurityLevel = (detail: CountryDetail, satisfaction: number): number => {
  const baseSecurity = detail.tingkat_keamanan ?? 84.5;
  return Math.min(100, Math.max(10, baseSecurity + (satisfaction - 50) * 0.15));
};

// ==============================
// 4. Hitung Daily Births (8 Parameter - Versi Lama)
// ==============================
export const calculateDailyBirths = (
  populasi: number,
  satisfaction: number,
  livingCostIndex: number,
  jumlahRumahSakit: number,
  jumlahKlinik: number,
  programInsentifAnak: boolean = false,
  angkaPernikahan: number = 0.05,
  tingkatPendidikan: number = 0.5,
  detail?: any
): number => {
  if (populasi <= 0) return 0;

  const baseBirthRate = 0.00014;
  const baseBirths = populasi * baseBirthRate;

  const welfareFactor = 0.75 + (livingCostIndex / 200);

  let healthFactor = 1.0;
  if (detail) {
    const baseRumahSakit = Number(detail.jumlah_rumah_sakit ?? 0);
    const rsBesar = Number(detail.rumah_sakit_besar ?? 0);
    const rsKecil = Number(detail.rumah_sakit_kecil ?? 0);
    const pusatDiagnostik = Number(detail.pusat_diagnostik ?? 0);
    const totalBangunanMedis = baseRumahSakit + rsBesar + rsKecil + pusatDiagnostik;
    const idealKesehatan = Math.ceil(populasi / 100000) || 1;
    const kesehatanRatio = Math.min(1, totalBangunanMedis / idealKesehatan);
    healthFactor = 0.7 + 0.3 * kesehatanRatio;
  } else {
    const idealHospitals = Math.ceil(populasi / 100000);
    const idealClinics = Math.ceil(populasi / 10000);
    const hospitalRatio = idealHospitals > 0 ? Math.min(1, jumlahRumahSakit / idealHospitals) : 1;
    const clinicRatio = idealClinics > 0 ? Math.min(1, jumlahKlinik / idealClinics) : 1;
    healthFactor = 0.7 + 0.3 * ((hospitalRatio + clinicRatio) / 2);
  }

  const policyFactor = programInsentifAnak ? 1.2 : 1.0;

  // Pernikahan card and its factor logic removed (always default 1.0)
  const marriageFactor = 1.0;

  let eduRatio = 0.5;
  if (detail) {
    const eduKeys = ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan"];
    const totalEducation = eduKeys.reduce((sum, key) => sum + (Number(detail[key]) || 0), 0);
    const idealEducation = Math.ceil(populasi / 50000) || 1;
    eduRatio = Math.min(1, totalEducation / idealEducation);
  } else {
    eduRatio = tingkatPendidikan;
  }
  const educationFactor = 1.1 - (0.3 * eduRatio);

  const satisfactionFactor = 0.5 + (satisfaction / 200);

  const totalFactor = welfareFactor * healthFactor * policyFactor * marriageFactor * educationFactor * satisfactionFactor;
  return Math.floor(baseBirths * totalFactor);
};

// ==============================
// 5. Hitung Daily Deaths (3 Parameter - Versi Lama)
// ==============================
export const calculateDailyDeaths = (
  populasi: number,
  lifeExpectancy: number,
  securityLevel: number,
  detail?: any
): number => {
  const baseDeathRate = 0.000018;

  if (detail) {
    const harapanHidup = detail?.harapan_hidup ?? 70;
    const indeksKetahananPangan = detail?.indeks_ketahanan_pangan ?? 60;

    const keamananRes = calculateKeamananLogic(detail, populasi);
    const kesehatanRes = calculateKesehatanLogic(detail, populasi);

    // Hitung homelessCount secara dinamis dari detail
    const sektoral = calculateSectoralSatisfaction(detail);
    const calculatedHomeless = calculateHomelessCount(populasi, sektoral.hunian, detail);

    const tunawismaRes = calculateTunawismaLogic(detail, populasi, calculatedHomeless);
    const kriminalitasRes = calculateKriminalitasLogic(detail, populasi);

    const lifeExpectancyFactor = Math.max(0.8, 1.2 - (0.005 * (harapanHidup - 50)));
    // Batasi denda kematian baseline agar angka kematian awal realistis
    const securityFactor = Math.min(1.4, keamananRes.securityFactor);
    const homelessFactor = Math.min(1.4, tunawismaRes.homelessFactor);
    const healthFactor = kesehatanRes.healthFactor;
    const foodSecurityFactor = 0.7 + (0.003 * indeksKetahananPangan);
    const crimeFactor = Math.min(1.4, kriminalitasRes.crimeFactor);

    const combinedFactor = lifeExpectancyFactor * securityFactor * homelessFactor * healthFactor * foodSecurityFactor * crimeFactor;
    return Math.floor(populasi * baseDeathRate * combinedFactor);
  }

  const lifeFactor = 73.2 / lifeExpectancy;
  const securityFactor = 84.5 / securityLevel;
  return Math.floor(populasi * baseDeathRate * lifeFactor * securityFactor);
};

// ==============================
// 6. Hitung Homeless Count (Tunawisma)
// ==============================
export const calculateHomelessCount = (
  populasi: number,
  housingQuality: number = 50,
  detail?: any
): number => {
  if (detail) {
    if (typeof detail.tunawisma === 'number') {
      return detail.tunawisma;
    }
    const totalHousingCapacity =
      (Number(detail.rumah_subsidi) || 0) * 5 +
      (Number(detail.apartemen) || 0) * 6000 +
      (Number(detail.mansion) || 0) * 10;
    return Math.max(0, populasi - totalHousingCapacity);
  }
  const baseHomelessRate = 0.007;
  const homelessMultiplier = (100 - housingQuality) / 50;
  return Math.floor(populasi * baseHomelessRate * homelessMultiplier);
};

// ==============================
// 7. MAIN: Hitung Daily Population Metrics
// ==============================
export const calculateDailyPopulationChange = (
  detail: CountryDetail,
  countryName?: string,
  metadata: Record<string, any> = {},
  currentDate?: Date | string
): PopulationDailyMetrics => {
  if (!detail || typeof detail !== 'object') {
    return {
      dailyBirths: 0,
      dailyDeaths: 0,
      netDailyChange: 0,
      homelessCount: 0,
      kepuasanUmum: 50,
      lifeExpectancy: 73.2,
      securityLevel: 84.5,
      foodRatio: 1,
      foodTier: 1,
      housingFulfillment: 1,
      housingTier: 1,
      overpopulationTier: 0,
      healthIndex: 50,
      healthTier: 1,
      famineDeaths: 0,
      foodDeficitDeaths: 0,
      outbreakDeaths: 0,
      outbreakBirthLoss: 0,
      populationStatus: getPopulationStatus(1, 1, 0, 1),
    };
  }

  const populasi = Math.max(0, finiteNumber(detail.jumlah_penduduk, 10_000_000));
  const date = currentDate instanceof Date
    ? currentDate.toISOString().slice(0, 10)
    : String(currentDate || detail.currentDate || new Date().toISOString()).slice(0, 10);

  const detailWithDefaults = { ...detail };

  const kepuasanUmum = calculateGeneralSatisfaction(detailWithDefaults);
  const lifeExpectancy = calculateLifeExpectancy(detail, kepuasanUmum);
  const securityLevel = calculateSecurityLevel(detail, kepuasanUmum);

  const dailyBirths = calculateDailyBirths(
    populasi,
    kepuasanUmum,
    0, // livingCostIndex tidak lagi digunakan, diganti dengan satisfaction.price
    detail.jumlah_rumah_sakit ?? 0,
    detail.jumlah_klinik ?? 0,
    detail.program_insentif_anak ?? false,
    detail.angka_pernikahan ?? 0.05,
    detail.tingkat_pendidikan ?? 0.5,
    detailWithDefaults
  );

  const rawDailyDeaths = calculateDailyDeaths(populasi, lifeExpectancy, securityLevel, detailWithDefaults);
  const foodRatio = hitungRasioPangan(detail, metadata);
  const foodDeficitCount = Object.keys(metadata).length > 0
    ? calculateFoodDeficitCount(detail, metadata)
    : 0;
  const foodDeficitDeclineRate = getFoodDeficitDeclineRate(detail, populasi, foodDeficitCount);
  const foodDeficitDeaths = Math.floor(populasi * foodDeficitDeclineRate / 365);
  const foodSurplusRatio = Object.keys(metadata).length > 0
    ? calculateFoodSurplusRatio(detail, metadata)
    : Math.max(1, finiteNumber(detail.food_supply_ratio ?? detail.food_ratio, 1));
  const foodSurplusStrength = Math.min(1, Math.max(0, (foodSurplusRatio - 1) / 0.25));
  const foodBirthBonus = 1 + foodSurplusStrength * 0.05;
  const foodDeathReduction = 1 - foodSurplusStrength * 0.05;
  const housingFulfillment = hitungKeterpenuhanHunian(detail, metadata);
  const overpopulation = getOverpopMultiplier(populasi);
  const food = getPanganMultiplier(foodRatio);
  const housing = getHunianMultiplier(housingFulfillment);
  const disasterEffects = hitungDampakBencana(detail.active_disaster_effects || [], date);
  const healthIndex = Math.min(100, Math.max(0, finiteNumber(detail.indeks_kesehatan, 50) * disasterEffects.healthMultiplier));
  const health = getKesehatanMultiplier(healthIndex);
  const outbreakEffects = hitungDampakWabah(detail.active_outbreaks || [], date);
  const severeFactorCount = [
    food.tier >= 4,
    housing.tier >= 5,
    overpopulation.tier >= 3,
    health.tier >= 4,
  ].filter(Boolean).length;
  const isPopulationCrisis = severeFactorCount >= 2 || food.tier >= 6 || foodDeficitDeclineRate > 0;
  const growthMultiplier = getPopulationGrowthMultiplier(food.tier, housing.tier, overpopulation.tier, health.tier);
  const baselineDeaths = Math.min(rawDailyDeaths, Math.floor(dailyBirths * 0.7));
  const adjustedBirths = Math.max(0, Math.floor(
    dailyBirths * growthMultiplier * foodBirthBonus - outbreakEffects.kelahiranBerkurang
  ));
  const famineDeaths = isPopulationCrisis ? hitungKematianKelaparan(populasi, foodRatio) : 0;
  const calculatedDeaths = Math.max(0, Math.floor(
    baselineDeaths * growthMultiplier * foodDeathReduction +
    famineDeaths +
    foodDeficitDeaths +
    outbreakEffects.kematianTambahan
  ));
  let unboundedNetChange = adjustedBirths - calculatedDeaths;
  if (foodDeficitDeclineRate > 0) {
    unboundedNetChange = Math.min(unboundedNetChange, -foodDeficitDeaths);
  }
  const hasFoodOrHousingDeficit = foodRatio < 1 || housingFulfillment < 1;
  const growthCoverage = Math.min(1, Math.max(0, Math.min(foodRatio, housingFulfillment)));
  const maxAnnualGrowthRate = hasFoodOrHousingDeficit ? 0.005 : 0.03;
  const maxDailyGrowth = Math.floor(populasi * maxAnnualGrowthRate * growthCoverage / 365);
  const maxDailyDecline = isPopulationCrisis ? Math.ceil(populasi * 0.05 / 365) : 0;
  const boundedNetDailyChange = Math.max(-maxDailyDecline, Math.min(maxDailyGrowth, unboundedNetChange));
  const religionAdjustedNetChange = applyHinduPopulationGrowthBonus(boundedNetDailyChange, detail.religion);
  const netDailyChange = applySocialismBirthRateBonus(religionAdjustedNetChange, detail.ideology);
  const adjustedDeaths = Math.max(0, adjustedBirths - netDailyChange);
  const populationStatus = getPopulationStatus(food.tier, housing.tier, overpopulation.tier, health.tier);
  const sektoral = calculateSectoralSatisfaction(detailWithDefaults);
  const homelessCount = calculateHomelessCount(populasi, sektoral.hunian, detailWithDefaults);

  return {
    dailyBirths: adjustedBirths,
    dailyDeaths: adjustedDeaths,
    netDailyChange,
    homelessCount,
    kepuasanUmum,
    lifeExpectancy,
    securityLevel,
    foodRatio,
    foodTier: food.tier,
    housingFulfillment,
    housingTier: housing.tier,
    overpopulationTier: overpopulation.tier,
    healthIndex,
    healthTier: health.tier,
    famineDeaths,
    foodDeficitDeaths,
    outbreakDeaths: outbreakEffects.kematianTambahan,
    outbreakBirthLoss: outbreakEffects.kelahiranBerkurang,
    populationStatus,
  };
};

export const getPopulationProjection = (
  detail: CountryDetail,
  days = 30,
  metadata: Record<string, any> = {},
  currentDate?: Date | string
): number[] => {
  const projection: number[] = [];
  let simulatedCountry = { ...detail };
  let simulatedDate = currentDate instanceof Date
    ? currentDate.toISOString().slice(0, 10)
    : String(currentDate || new Date().toISOString()).slice(0, 10);

  for (let day = 0; day < Math.max(0, Math.floor(days)); day += 1) {
    const metrics = calculateDailyPopulationChange(simulatedCountry, undefined, metadata, simulatedDate);
    const population = Math.max(0, Math.floor(finiteNumber(simulatedCountry.jumlah_penduduk) + metrics.netDailyChange));
    simulatedCountry = { ...simulatedCountry, jumlah_penduduk: population };
    projection.push(population);

    const dateValue = new Date(`${simulatedDate}T00:00:00Z`);
    dateValue.setUTCDate(dateValue.getUTCDate() + 1);
    simulatedDate = dateValue.toISOString().slice(0, 10);
  }
  return projection;
};

// ==============================
// 8-11. Helper UI (Tetap sama)
// ==============================
export const updateDailyPopulation = (
  detail: CountryDetail,
  metrics?: PopulationDailyMetrics,
  countryName?: string,
  metadata: Record<string, any> = {},
  currentDate?: Date | string
): Partial<CountryDetail> => {
  if (!detail) return {};
  const dailyMetrics = metrics || calculateDailyPopulationChange(detail, countryName, metadata, currentDate);
  const currentPopulasi = Math.max(0, finiteNumber(detail.jumlah_penduduk, 10_000_000));
  const newPopulasi = Math.max(0, Math.floor(currentPopulasi + dailyMetrics.netDailyChange));
  const accumulatedBirths = (Number(detail.accumulated_births) || 0) + dailyMetrics.dailyBirths;
  const accumulatedDeaths = (Number(detail.accumulated_deaths) || 0) + dailyMetrics.dailyDeaths;
  return {
    jumlah_penduduk: newPopulasi,
    accumulated_births: accumulatedBirths,
    accumulated_deaths: accumulatedDeaths,
    laju_pertumbuhan: dailyMetrics.netDailyChange,
    food_supply_ratio: dailyMetrics.foodRatio,
    food_deficit_tier: dailyMetrics.foodTier,
    housing_fulfillment: dailyMetrics.housingFulfillment,
    housing_deficit_tier: dailyMetrics.housingTier,
    overpop_tier: dailyMetrics.overpopulationTier,
    health_tier: dailyMetrics.healthTier,
    population_status: dailyMetrics.populationStatus.label,
  };
};

export const formatPopulationWithNetChange = (populasi: number, netChange: number): string => {
  const sign = netChange >= 0 ? '+' : '';
  return `${populasi.toLocaleString('id-ID')} (${sign}${netChange.toLocaleString('id-ID')}/hari)`;
};

export const getNetPopulationChangeColor = (netChange: number): string => {
  if (netChange >= 100) return 'text-emerald-700';
  if (netChange >= 0) return 'text-emerald-600';
  if (netChange >= -100) return 'text-yellow-600';
  return 'text-rose-700';
};

export const logPopulationMetrics = (
  detail: CountryDetail,
  metrics: PopulationDailyMetrics,
  dateStr: string
): void => {
  logger.log('PopulationLogic', `[${dateStr}] Population Metrics:`, {
    population: detail.jumlah_penduduk,
    dailyBirths: metrics.dailyBirths,
    dailyDeaths: metrics.dailyDeaths,
    netChange: metrics.netDailyChange,
    satisfaction: metrics.kepuasanUmum.toFixed(1),
    lifeExpectancy: metrics.lifeExpectancy.toFixed(1),
    security: metrics.securityLevel.toFixed(1),
  });
};

/**
 * Helper ringkas persis seperti calculateCountryNetBalance di treasuryUpdater.ts
 * Mengembalikan perubahan netto populasi harian (kelahiran - kematian)
 */
export const calculateCountryNetPopulation = (
  detail: CountryDetail,
  metadata: Record<string, any> = {},
  currentDate?: Date | string
): number => {
  if (!detail || typeof detail !== 'object') return 0;
  const metrics = calculateDailyPopulationChange(detail, undefined, metadata, currentDate);
  return metrics.netDailyChange;
};