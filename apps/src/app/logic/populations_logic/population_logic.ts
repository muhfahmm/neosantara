/**
 * Population Logic - Otak Sistem Populasi Dinamis
 * Mirip dengan treasuryUpdater.ts, tapi untuk populasi dengan +/- daily change
 */

import { logger } from '../../../lib/logger';

// Import dari logic yang baru dibuat
import { calculateKeamananLogic } from "@/app/page/navigasi_menu/2_navigasi_bawah/2_populasi/kematian_modals/logic/keamananLogic";
import { calculateKesehatanLogic } from "@/app/page/navigasi_menu/2_navigasi_bawah/2_populasi/kematian_modals/logic/kesehatanLogic";
import { calculateTunawismaLogic } from "@/app/page/navigasi_menu/2_navigasi_bawah/2_populasi/kematian_modals/logic/tunawismaLogic";
import { calculateKriminalitasLogic } from "@/app/page/navigasi_menu/2_navigasi_bawah/2_populasi/kematian_modals/logic/kriminalitasLogic";

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
}

export interface PopulationSectoral {
  pajak: number;
  harga: number;
  pangan: number;
  listrik: number;
  hunian: number;
}

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
    const eduKeys = ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan", "literasi"];
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
    const polusiIndex = detail?.polusi_index ?? 40;

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
    const pollutionFactor = 1 + (polusiIndex / 200);

    const combinedFactor = lifeExpectancyFactor * securityFactor * homelessFactor * healthFactor * foodSecurityFactor * crimeFactor * pollutionFactor;
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
    const totalHousingCapacity =
      (Number(detail.rumah_subsidi) || 0) * 4 +
      (Number(detail.apartemen) || 0) * 50 +
      (Number(detail.mansion) || 0) * 8;
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
  countryName?: string
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
    };
  }

  const populasi = detail.jumlah_penduduk || 10_000_000;

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

  let dailyDeaths = calculateDailyDeaths(populasi, lifeExpectancy, securityLevel, detailWithDefaults);
  
  // Agar pertumbuhan populasi default selalu positif (+), kematian tidak melebihi kelahiran pada keadaan baseline
  if (dailyDeaths >= dailyBirths) {
    dailyDeaths = Math.floor(dailyBirths * 0.7);
  }

  // Minimal pertumbuhan positif 0.002% per hari untuk semua negara (termasuk microstates)
  const minPositiveGrowth = Math.max(1, Math.ceil(populasi * 0.00002));
  const netDailyChange = Math.max(minPositiveGrowth, dailyBirths - dailyDeaths);
  const sektoral = calculateSectoralSatisfaction(detailWithDefaults);
  const homelessCount = calculateHomelessCount(populasi, sektoral.hunian);

  return {
    dailyBirths,
    dailyDeaths,
    netDailyChange,
    homelessCount,
    kepuasanUmum,
    lifeExpectancy,
    securityLevel,
  };
};

// ==============================
// 8-11. Helper UI (Tetap sama)
// ==============================
export const updateDailyPopulation = (
  detail: CountryDetail,
  metrics?: PopulationDailyMetrics,
  countryName?: string
): Partial<CountryDetail> => {
  if (!detail) return {};
  const dailyMetrics = metrics || calculateDailyPopulationChange(detail, countryName);
  const currentPopulasi = Number(detail.jumlah_penduduk) || 10_000_000;
  const newPopulasi = Math.max(0, currentPopulasi + dailyMetrics.netDailyChange);
  const accumulatedBirths = (Number(detail.accumulated_births) || 0) + dailyMetrics.dailyBirths;
  const accumulatedDeaths = (Number(detail.accumulated_deaths) || 0) + dailyMetrics.dailyDeaths;
  return {
    jumlah_penduduk: newPopulasi,
    accumulated_births: accumulatedBirths,
    accumulated_deaths: accumulatedDeaths,
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
export const calculateCountryNetPopulation = (detail: CountryDetail): number => {
  if (!detail || typeof detail !== 'object') return 0;
  const metrics = calculateDailyPopulationChange(detail);
  return metrics.netDailyChange;
};