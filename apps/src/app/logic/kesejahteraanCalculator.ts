/**
 * kesejahteraanCalculator.ts
 * Utility untuk menghitung Indeks Kesejahteraan (Welfare Index) rakyat
 * 
 * Kesejahteraan dihitung dari 3 sektor utama:
 * 1. Pendidikan (Education)
 * 2. Kesehatan (Health)
 * 3. Tempat Umum (Public Facilities)
 * 
 * Nilai kesejahteraan otomatis naik/turun berdasarkan:
 * - Jumlah bangunan pendidikan, kesehatan, dan tempat umum
 * - Rasio fasilitas terhadap populasi
 * - Kecukupan layanan publik
 */

import { calculateKeterbukaanScore } from "@/app/logic/kepuasanCalculator";

// ─── Helper Functions ─────────────────────────────────────────────────────

/**
 * Mencari metadata bangunan berdasarkan key
 * Digunakan untuk mendapatkan informasi kapasitas, produksi, dll
 */
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

/**
 * Hitung persentase pemenuhan target untuk kategori fasilitas
 */
function calculateFacilityFulfillmentPercentage(
  facilityCount: number,
  population: number,
  targetRatio: number
): number {
  if (population <= 0) return 0;
  const actualRatio = facilityCount / population;
  const percentageMet = Math.min(100, (actualRatio / targetRatio) * 100);
  return percentageMet;
}

// ─── Sektor 1: Pendidikan (Education) ────────────────────────────────────

export interface PendidikanMetrics {
  totalFacilities: number;
  score: number;
  detail: {
    prasekolah: number;
    dasar: number;
    menengah: number;
    lanjutan: number;
    universitas: number;
    lembagaPendidikan: number;
    laboratorium: number;
    observatorium: number;
    pusatPenelitian: number;
    pusatPengembangan: number;
    literasi: number;
  };
}

/**
 * Hitung skor sektor Pendidikan
 * 
 * Kategori:
 * - Pendidikan Dasar: Prasekolah, SD, SMP, SMA, SMK
 * - Pendidikan Lanjutan: Universitas, Lembaga Pendidikan
 * - Penelitian: Laboratorium, Observatorium, Pusat Penelitian, Pusat Pengembangan
 * - Literasi: Program literasi
 * 
 * Target: 1 fasilitas per 10,000 jiwa (lebih ketat untuk pendidikan berkualitas)
 */
export function calculatePendidikanScore(countryDetail: any): PendidikanMetrics {
  const population = Number(countryDetail?.jumlah_penduduk) || 0;
  
  if (population <= 0) {
    return {
      totalFacilities: 0,
      score: 50,
      detail: {
        prasekolah: 0,
        dasar: 0,
        menengah: 0,
        lanjutan: 0,
        universitas: 0,
        lembagaPendidikan: 0,
        laboratorium: 0,
        observatorium: 0,
        pusatPenelitian: 0,
        pusatPengembangan: 0,
        literasi: 0,
      },
    };
  }

  // Kategori pendidikan dengan target rasio berbeda
  const educationCategories = [
    { keys: ["prasekolah", "dasar", "menengah", "lanjutan"], target: 0.00005, weight: 0.5 }, // 1 per 20k (dasar)
    { keys: ["universitas", "lembaga_pendidikan"], target: 0.00001, weight: 0.3 },           // 1 per 100k (lanjutan)
    { keys: ["laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan"], target: 0.000005, weight: 0.15 }, // 1 per 200k (penelitian)
    { keys: ["literasi"], target: 0.00001, weight: 0.05 },                                  // 1 per 100k
  ];

  let totalFacilities = 0;
  let weightedScore = 0;
  let totalWeight = 0;
  const details: any = {};

  educationCategories.forEach((cat, idx) => {
    const categoryTotal = cat.keys.reduce((sum, key) => sum + (Number(countryDetail[key]) || 0), 0);
    totalFacilities += categoryTotal;

    const percentageMet = calculateFacilityFulfillmentPercentage(categoryTotal, population, cat.target);
    weightedScore += percentageMet * cat.weight;
    totalWeight += cat.weight;

    // Store detail
    cat.keys.forEach((key) => {
      details[key] = Number(countryDetail[key]) || 0;
    });
  });

  const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50;

  return {
    totalFacilities,
    score: Math.min(100, Math.max(1, score)),
    detail: {
      prasekolah: details.prasekolah || 0,
      dasar: details.dasar || 0,
      menengah: details.menengah || 0,
      lanjutan: details.lanjutan || 0,
      universitas: details.universitas || 0,
      lembagaPendidikan: details.lembaga_pendidikan || 0,
      laboratorium: details.laboratorium || 0,
      observatorium: details.observatorium || 0,
      pusatPenelitian: details.pusat_penelitian || 0,
      pusatPengembangan: details.pusat_pengembangan || 0,
      literasi: details.literasi || 0,
    },
  };
}

// ─── Sektor 2: Kesehatan (Health) ────────────────────────────────────────

export interface KesehatanMetrics {
  totalFacilities: number;
  score: number;
  detail: {
    rumahSakitBesar: number;
    rumahSakitKecil: number;
    pusatDiagnostik: number;
    harapanHidup: number;
    indeksKesehatan: number;
  };
  lifeExpectancyBonus: number;
}

/**
 * Hitung skor sektor Kesehatan
 * 
 * Kategori:
 * - Rumah Sakit Besar: Full service hospitals
 * - Rumah Sakit Kecil: Clinics & local health centers
 * - Pusat Diagnostik: Advanced diagnostic centers
 * - Harapan Hidup: Life expectancy index (bonus/penalty)
 * - Indeks Kesehatan: General health index (bonus/penalty)
 * 
 * Target: 1 fasilitas per 25,000 jiwa (standard WHO)
 * Bonus: Harapan hidup > 75 tahun (+20 poin)
 */
export function calculateKesehatanScore(countryDetail: any): KesehatanMetrics {
  const population = Number(countryDetail?.jumlah_penduduk) || 0;
  
  if (population <= 0) {
    return {
      totalFacilities: 0,
      score: 50,
      detail: {
        rumahSakitBesar: 0,
        rumahSakitKecil: 0,
        pusatDiagnostik: 0,
        harapanHidup: 0,
        indeksKesehatan: 0,
      },
      lifeExpectancyBonus: 0,
    };
  }

  // Hitung fasilitas kesehatan
  const healthCategories = [
    { keys: ["rumah_sakit_besar", "rumah_sakit_kecil"], target: 0.00004, weight: 0.6 },     // 1 per 25k
    { keys: ["pusat_diagnostik"], target: 0.000002, weight: 0.4 },                          // 1 per 500k (spesialisasi)
  ];

  let totalFacilities = 0;
  let weightedScore = 0;
  let totalWeight = 0;
  const details: any = {};

  healthCategories.forEach((cat) => {
    const categoryTotal = cat.keys.reduce((sum, key) => sum + (Number(countryDetail[key]) || 0), 0);
    totalFacilities += categoryTotal;

    const percentageMet = calculateFacilityFulfillmentPercentage(categoryTotal, population, cat.target);
    weightedScore += percentageMet * cat.weight;
    totalWeight += cat.weight;

    cat.keys.forEach((key) => {
      details[key] = Number(countryDetail[key]) || 0;
    });
  });

  // Health indices bonus/penalty
  const harapanHidup = Number(countryDetail?.harapan_hidup) || 73.2;
  const indeksKesehatan = Number(countryDetail?.indeks_kesehatan) || 50;

  // Life expectancy bonus: setiap 1 tahun di atas 75 = +1 poin
  let lifeExpectancyBonus = 0;
  if (harapanHidup >= 75) {
    lifeExpectancyBonus = Math.min(20, (harapanHidup - 75) * 4); // Max +20
  } else if (harapanHidup < 70) {
    lifeExpectancyBonus = (harapanHidup - 70) * 2; // Penalty untuk < 70
  }

  // Health index contribution (0-20 points)
  const healthIndexScore = Math.min(20, (indeksKesehatan / 100) * 20);

  let baseScore = totalWeight > 0 ? weightedScore / totalWeight : 50;
  const finalScore = baseScore + lifeExpectancyBonus + healthIndexScore;

  details.harapanHidup = harapanHidup;
  details.indeksKesehatan = indeksKesehatan;

  return {
    totalFacilities,
    score: Math.min(100, Math.max(1, Math.round(finalScore))),
    detail: {
      rumahSakitBesar: details.rumah_sakit_besar || 0,
      rumahSakitKecil: details.rumah_sakit_kecil || 0,
      pusatDiagnostik: details.pusat_diagnostik || 0,
      harapanHidup: Number(harapanHidup),
      indeksKesehatan: Number(indeksKesehatan),
    },
    lifeExpectancyBonus,
  };
}

// ─── Sektor 3: Tempat Umum (Public Facilities) ────────────────────────────

export interface TempatUmumMetrics {
  totalFacilities: number;
  score: number;
  detail: {
    transportasi: number;
    rekreasi: number;
    komersial: number;
  };
}

/**
 * Hitung skor sektor Tempat Umum
 * 
 * Kategori:
 * - Transportasi: Jalur sepeda, jalan raya, terminal, stasiun, pelabuhan, bandara
 * - Rekreasi: Kolam renang, stadion, gym, golf, esports, bioskop, teater
 * - Komersial: Mall, hotel, pusat grosir
 * 
 * Transportasi target: 1 per 20,000 jiwa (infrastruktur penting)
 * Rekreasi target: 1 per 12,500 jiwa (quality of life)
 * Komersial target: 1 per 50,000 jiwa (ekonomi)
 */
export function calculateTempatUmumScore(countryDetail: any): TempatUmumMetrics {
  const population = Number(countryDetail?.jumlah_penduduk) || 0;

  if (population <= 0) {
    return {
      totalFacilities: 0,
      score: 50,
      detail: {
        transportasi: 0,
        rekreasi: 0,
        komersial: 0,
      },
    };
  }

  // Kategori tempat umum dengan prioritas berbeda
  const facilityCategories = [
    {
      name: "transportasi",
      keys: ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad"],
      target: 0.00005,
      weight: 0.45, // 45% - paling penting untuk aksesibilitas
    },
    {
      name: "rekreasi",
      keys: ["kolam_renang", "sirkuit_balap", "stadion", "stadion_internasional", "gym", "golf", "esports", "gokart", "bioskop", "teater"],
      target: 0.00008,
      weight: 0.35, // 35% - quality of life
    },
    {
      name: "komersial",
      keys: ["mall", "hotel", "pusat_grosir_tekstil"],
      target: 0.00002,
      weight: 0.2, // 20% - ekonomi
    },
  ];

  let totalFacilities = 0;
  let weightedScore = 0;
  let totalWeight = 0;
  const details: any = {};

  facilityCategories.forEach((cat) => {
    const categoryTotal = cat.keys.reduce((sum, key) => sum + (Number(countryDetail[key]) || 0), 0);
    totalFacilities += categoryTotal;

    const percentageMet = calculateFacilityFulfillmentPercentage(categoryTotal, population, cat.target);
    weightedScore += percentageMet * cat.weight;
    totalWeight += cat.weight;

    details[cat.name] = categoryTotal;
  });

  const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50;

  return {
    totalFacilities,
    score: Math.min(100, Math.max(1, score)),
    detail: {
      transportasi: details.transportasi || 0,
      rekreasi: details.rekreasi || 0,
      komersial: details.komersial || 0,
    },
  };
}

// ─── Main: Calculate Overall Welfare Index ────────────────────────────────

export interface KesejahteraanIndex {
  overallScore: number;
  pendidikanScore: number;
  kesehatanScore: number;
  tempatUmumScore: number;
  panganScore: number;  // ← NEW
  hunianScore: number;  // ← NEW
  keterbukaanScore?: number; // ← NEW
  trend: 'naik' | 'turun' | 'stabil';
  detail: {
    pendidikan: PendidikanMetrics;
    kesehatan: KesehatanMetrics;
    tempatUmum: TempatUmumMetrics;
    pangan?: any;  // ← NEW
    hunian?: any;  // ← NEW
    keterbukaan?: any; // ← NEW
  };
}

/**
 * Hitung Indeks Kesejahteraan Keseluruhan
 * 
 * Kesejahteraan = Rata-rata tertimbang dari 3 sektor:
 * - Pendidikan: 35% (sumber daya manusia penting)
 * - Kesehatan: 40% (kesehatan masyarakat prioritas)
 * - Tempat Umum: 25% (kualitas hidup)
 * 
 * Nilai: 1-100
 * - 1-20: Sangat Buruk (krisis kesejahteraan)
 * - 21-40: Buruk (kesejahteraan rendah)
 * - 41-60: Sedang (kesejahteraan mencukupi)
 * - 61-80: Baik (kesejahteraan tinggi)
 * - 81-100: Sangat Baik (kesejahteraan luar biasa)
 */
/**
 * Hitung Indeks Kesejahteraan Keseluruhan secara presisi sesuai dengan modal detail
 */
export function calculateKesejahteraan(
  countryDetail: any,
  metadata: any,
  FOOD_CONSUMPTION_PER_CAPITA: any,
  calculateProduction: any,
  previousScore?: number
): KesejahteraanIndex {
  // Sektor 1: Pendidikan
  const pop = Number(countryDetail?.jumlah_penduduk) || 1;
  const pendKeys = ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan", "literasi"];
  const pendTotal = pendKeys.reduce((s, k) => s + (Number(countryDetail?.[k]) || 0), 0);
  const pendIndex = pendTotal / pop;
  const pendidikanScore = Math.min(100, Math.round((pendIndex / 0.0001) * 100));

  // Sektor 2: Kesehatan
  const kesKeys = ["rumah_sakit_besar", "rumah_sakit_kecil", "pusat_diagnostik", "harapan_hidup", "indeks_kesehatan"];
  const kesTotal = kesKeys.reduce((s, k) => s + (Number(countryDetail?.[k]) || 0), 0);
  const kesIndex = kesTotal / pop;
  const kesehatanScore = Math.min(100, Math.round((kesIndex / 0.00004) * 100));

  // Sektor 3: Tempat Umum (Infrastruktur)
  const infraKeys = ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad"];
  const infraTotal = infraKeys.reduce((s, k) => s + (Number(countryDetail?.[k]) || 0), 0);
  const infraIndex = infraTotal / pop;
  const tempatUmumScore = Math.min(100, Math.round((infraIndex / 0.00005) * 100));

  // Sektor 4: Pangan
  let panganScore = 1;
  const storedFood = countryDetail?.satisfaction?.food;
  if (!metadata) {
    panganScore = storedFood !== undefined && storedFood !== null ? Math.round(Number(storedFood)) : 0;
  } else {
    const allKeys = Object.keys(FOOD_CONSUMPTION_PER_CAPITA || {});
    let totalRatio = 0;
    let count = 0;
    for (const key of allKeys) {
      const prod = calculateProduction ? calculateProduction(key, countryDetail, metadata) : 0;
      const cons = (pop / 1000) * FOOD_CONSUMPTION_PER_CAPITA[key];
      if (cons > 0) {
        totalRatio += Math.min(prod / cons, 2);
        count++;
      }
    }
    if (count === 0) {
      panganScore = Math.round(Number(countryDetail?.indeks_ketahanan_pangan) || 1);
    } else {
      const avgRatio = totalRatio / count;
      panganScore = Math.min(100, Math.max(1, Math.round((avgRatio / 2) * 100)));
    }
  }

  // Sektor 5: Hunian
  let hunianScore = 1;
  const storedHousing = countryDetail?.satisfaction?.housing;
  if (!metadata) {
    hunianScore = storedHousing !== undefined && storedHousing !== null ? Math.round(Number(storedHousing)) : 0;
  } else {
    const HUNIAN_KEYS = ["rumah_subsidi", "apartemen", "mansion"];
    const findMeta = (key: string) => {
      if (!metadata) return undefined;
      if (metadata[key]) return metadata[key];
      for (const k of Object.keys(metadata)) {
        const entry = metadata[k];
        if (!entry) continue;
        if (entry.dataKey === key) return entry;
        if (k.endsWith(`_${key}`) || k === `1_${key}`) return entry;
      }
      return undefined;
    };
    let totalCapacity = 0;
    for (const key of HUNIAN_KEYS) {
      const count = Number(countryDetail?.[key]) || 0;
      const meta = findMeta(key);
      const kapasitas = Number(meta?.kapasitas) || 0;
      totalCapacity += count * kapasitas;
    }
    if (totalCapacity <= 0) {
      hunianScore = 1;
    } else {
      const ratio = Math.min(totalCapacity / pop, 2);
      hunianScore = Math.min(100, Math.max(1, Math.round((ratio / 2) * 100)));
    }
  }

  // Indeks Kesejahteraan Keseluruhan (rata-rata 6 sektor + bonus dari program bantuan sosial - akumulasi decay penurunan)
  const keterbukaanScore = calculateKeterbukaanScore(countryDetail);
  const baseScore = Math.round(
    (pendidikanScore + kesehatanScore + tempatUmumScore + panganScore + hunianScore + keterbukaanScore) / 6
  );
  const bonus = Number(countryDetail?.kesejahteraan_bonus) || 0;
  const decayAccumulated = Number(countryDetail?.kesejahteraan_decay) || 0;
  const overallScore = Math.min(100, Math.max(1, baseScore + bonus - decayAccumulated));
  console.log('[calculateKesejahteraan] Calc results:', {
    country: countryDetail?.country,
    pendidikanScore,
    kesehatanScore,
    tempatUmumScore,
    panganScore,
    hunianScore,
    keterbukaanScore,
    baseScore,
    kesejahteraan_bonus: countryDetail?.kesejahteraan_bonus,
    kesejahteraan_decay: countryDetail?.kesejahteraan_decay,
    bonus,
    decayAccumulated,
    overallScore
  });

  // Tentukan trend
  let trend: 'naik' | 'turun' | 'stabil' = 'stabil';
  if (previousScore !== undefined) {
    if (overallScore > previousScore + 2) {
      trend = 'naik';
    } else if (overallScore < previousScore - 2) {
      trend = 'turun';
    }
  }

  // Fallback dummy structs for backward compatibility
  const dummyPendidikanMetrics: PendidikanMetrics = {
    totalFacilities: pendTotal,
    score: pendidikanScore,
    detail: { prasekolah: 0, dasar: 0, menengah: 0, lanjutan: 0, universitas: 0, lembagaPendidikan: 0, laboratorium: 0, observatorium: 0, pusatPenelitian: 0, pusatPengembangan: 0, literasi: 0 }
  };
  const dummyKesehatanMetrics: KesehatanMetrics = {
    totalFacilities: kesTotal,
    score: kesehatanScore,
    detail: { rumahSakitBesar: 0, rumahSakitKecil: 0, pusatDiagnostik: 0, harapanHidup: 0, indeksKesehatan: 0 },
    lifeExpectancyBonus: 0
  };
  const dummyTempatUmumMetrics: TempatUmumMetrics = {
    totalFacilities: infraTotal,
    score: tempatUmumScore,
    detail: { transportasi: 0, rekreasi: 0, komersial: 0 }
  };

  return {
    overallScore: Math.min(100, Math.max(1, overallScore)),
    pendidikanScore,
    kesehatanScore,
    tempatUmumScore,
    panganScore,
    hunianScore,
    keterbukaanScore,
    trend,
    detail: {
      pendidikan: dummyPendidikanMetrics,
      kesehatan: dummyKesehatanMetrics,
      tempatUmum: dummyTempatUmumMetrics,
      pangan: { score: panganScore },
      hunian: { score: hunianScore },
      keterbukaan: { score: keterbukaanScore },
    },
  };
}

// ─── Utility Functions ────────────────────────────────────────────────────

/**
 * Get warna untuk indeks kesejahteraan di UI
 */
export function getKesejahteraanColor(score: number): string {
  if (score >= 81) return 'text-emerald-700 font-black';     // Sangat baik - hijau gelap
  if (score >= 61) return 'text-emerald-600';                // Baik - hijau
  if (score >= 41) return 'text-yellow-600';                 // Sedang - kuning
  if (score >= 21) return 'text-orange-600';                 // Buruk - oranye
  return 'text-red-700 font-black';                           // Sangat buruk - merah gelap
}

/**
 * Get status text untuk indeks kesejahteraan
 */
export function getKesejahteraanStatus(score: number): string {
  if (score >= 81) return 'Sangat Baik';
  if (score >= 61) return 'Baik';
  if (score >= 41) return 'Sedang';
  if (score >= 21) return 'Buruk';
  return 'Sangat Buruk';
}

/**
 * Get emoji/icon untuk trend
 */
export function getKesejahteraanTrendIcon(trend: 'naik' | 'turun' | 'stabil'): string {
  switch (trend) {
    case 'naik':
      return '📈';
    case 'turun':
      return '📉';
    case 'stabil':
      return '➡️';
    default:
      return '•';
  }
}

/**
 * Format kesejahteraan untuk display
 */
export function formatKesejahteraan(score: number): string {
  return `${Math.max(1, Math.min(100, Math.round(score)))}/100`;
}

/**
 * Get detailed breakdown untuk logging/debugging
 */
export function getKesejahteraanBreakdown(kesejahteraan: KesejahteraanIndex): string {
  return `
Indeks Kesejahteraan: ${kesejahteraan.overallScore}/100 (${getKesejahteraanStatus(kesejahteraan.overallScore)}) ${getKesejahteraanTrendIcon(kesejahteraan.trend)}

Breakdown:
  • Pendidikan: ${kesejahteraan.pendidikanScore}/100
    - ${kesejahteraan.detail.pendidikan.totalFacilities} fasilitas pendidikan
  
  • Kesehatan: ${kesejahteraan.kesehatanScore}/100 (Bonus harapan hidup: ${kesejahteraan.detail.kesehatan.lifeExpectancyBonus.toFixed(1)} poin)
    - ${kesejahteraan.detail.kesehatan.totalFacilities} fasilitas kesehatan
  
  • Tempat Umum: ${kesejahteraan.tempatUmumScore}/100
    - ${kesejahteraan.detail.tempatUmum.totalFacilities} fasilitas umum
  `.trim();
}

// ─── Decay: Penurunan Indeks Kesejahteraan Berbasis Waktu ─────────────────

/**
 * Threshold (bulan) sebelum indeks kesejahteraan berkurang 1 poin,
 * berdasarkan kepuasan rakyat — identik dengan logika peringkat presiden.
 *
 * Kepuasan 0–25   → turun 1 poin setiap 1 bulan
 * Kepuasan 26–45  → turun 1 poin setiap 3 bulan
 * Kepuasan 46–65  → turun 1 poin setiap 6 bulan
 * Kepuasan 66–79  → turun 1 poin setiap 9 bulan
 * Kepuasan 80–100 → turun 1 poin setiap 12 bulan (1 tahun)
 */
export function getKesejahteraanDecayThreshold(kepuasan: number, keterbukaanScore?: number): number {
  let baseThreshold = 12;
  if (kepuasan <= 25) baseThreshold = 1;
  else if (kepuasan <= 45) baseThreshold = 3;
  else if (kepuasan <= 65) baseThreshold = 6;
  else if (kepuasan <= 79) baseThreshold = 9;
  else baseThreshold = 12; // 80 - 100

  // Jika Indeks Keterbukaan rendah (< 50), percepat penurunan kesejahteraan
  if (keterbukaanScore !== undefined && keterbukaanScore < 50) {
    const factor = Math.max(0.4, 0.4 + (keterbukaanScore / 50) * 0.5);
    baseThreshold = Math.max(1, Math.floor(baseThreshold * factor));
  }

  return baseThreshold;
}

export interface KesejahteraanDecayInput {
  currentKesejahteraan: number;
  kesejahteraanMonthCounter: number;
  lastKesejahteraanThreshold: number;
  monthsPassed: number;
  currentKepuasan: number;
  keterbukaanScore?: number;
}

export interface KesejahteraanDecayOutput {
  nextKesejahteraan: number;
  kesejahteraan_month_counter: number;
  last_kesejahteraan_threshold: number;
  decayThisTick: number;
}

/**
 * Hitung penurunan indeks kesejahteraan untuk simulation tick ini.
 * Pola identik dengan calculatePresidentRating di peringkatCalculator.ts.
 *
 * Flow:
 * 1. Tambahkan monthsPassed ke counter
 * 2. Tentukan threshold dari kepuasan saat ini & keterbukaan
 * 3. Scale counter jika threshold berubah (smooth transition)
 * 4. Hitung penurunan (floor(counter / threshold))
 * 5. Reset counter dengan sisa (counter % threshold)
 * 6. Clamp ke [1, 100]
 */
export function calculateKesejahteraanDecay(input: KesejahteraanDecayInput): KesejahteraanDecayOutput {
  const {
    currentKesejahteraan,
    kesejahteraanMonthCounter,
    lastKesejahteraanThreshold,
    monthsPassed,
    currentKepuasan,
    keterbukaanScore,
  } = input;

  // Step 1: Tambahkan bulan yang berlalu ke counter
  let counter = kesejahteraanMonthCounter + (monthsPassed > 0 ? monthsPassed : 0);

  // Step 2: Tentukan threshold baru berdasarkan kepuasan & keterbukaan
  const newThreshold = getKesejahteraanDecayThreshold(currentKepuasan, keterbukaanScore);

  // Step 3: Scale counter jika threshold berubah (smooth transition)
  const prevThreshold = lastKesejahteraanThreshold || newThreshold;
  if (prevThreshold !== newThreshold && prevThreshold > 0) {
    counter = Math.round((counter / prevThreshold) * newThreshold);
  }

  // Step 4 & 5: Hitung penurunan dan sisa counter
  let decay = 0;
  let finalCounter = counter;
  if (counter >= newThreshold && newThreshold > 0) {
    decay = Math.floor(counter / newThreshold);
    finalCounter = counter % newThreshold;
  }

  const nextKesejahteraan = Math.max(1, Math.min(100, currentKesejahteraan - decay));

  return {
    nextKesejahteraan,
    kesejahteraan_month_counter: finalCounter,
    last_kesejahteraan_threshold: newThreshold,
    decayThisTick: decay,
  };
}

