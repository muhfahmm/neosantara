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

import {
  calculateKesehatanScore as calculateSharedKesehatanScore,
  calculateKeterbukaanScore,
  calculatePanganScore,
  calculatePenegakanHukumScore,
  calculateServiceDeficitMetrics,
  PENEGAKAN_HUKUM_KEYS,
} from "@/app/logic/kepuasanCalculator";

// ─── Helper Functions ─────────────────────────────────────────────────────

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
      score: calculateSharedKesehatanScore(countryDetail),
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
}

/**
 * Skor mengikuti kalkulator Kepuasan Rakyat; indeks non-fasilitas hanya
 * ditampilkan sebagai informasi, bukan dihitung sebagai jumlah bangunan.
 */
export function calculateKesehatanScore(countryDetail: any): KesehatanMetrics {
  const population = Number(countryDetail?.jumlah_penduduk) || 0;
  
  if (population <= 0) {
    return {
      totalFacilities: 0,
      score: calculateSharedKesehatanScore(countryDetail),
      detail: {
        rumahSakitBesar: 0,
        rumahSakitKecil: 0,
        pusatDiagnostik: 0,
        harapanHidup: 0,
        indeksKesehatan: 0,
      },
    };
  }

  // Hitung fasilitas kesehatan
  const healthCategories = [
    { keys: ["rumah_sakit_besar", "rumah_sakit_kecil"] },
    { keys: ["pusat_diagnostik"] },
  ];

  let totalFacilities = 0;
  const details: any = {};

  healthCategories.forEach((cat) => {
    const categoryTotal = cat.keys.reduce((sum, key) => sum + (Number(countryDetail[key]) || 0), 0);
    totalFacilities += categoryTotal;

    cat.keys.forEach((key) => {
      details[key] = Number(countryDetail[key]) || 0;
    });
  });

  const harapanHidup = Number(countryDetail?.harapan_hidup) || 73.2;
  const indeksKesehatan = Number(countryDetail?.indeks_kesehatan) || 50;

  details.harapanHidup = harapanHidup;
  details.indeksKesehatan = indeksKesehatan;

  return {
    totalFacilities,
    score: calculateSharedKesehatanScore(countryDetail),
    detail: {
      rumahSakitBesar: details.rumah_sakit_besar || 0,
      rumahSakitKecil: details.rumah_sakit_kecil || 0,
      pusatDiagnostik: details.pusat_diagnostik || 0,
      harapanHidup: Number(harapanHidup),
      indeksKesehatan: Number(indeksKesehatan),
    },
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

export interface PenegakanHukumMetrics {
  totalFacilities: number;
  score: number;
  detail: {
    pusatBantuanHukum: number;
    pengadilan: number;
    kejaksaan: number;
    posPolisi: number;
    akademiPolisi: number;
  };
}

/**
 * Gunakan skor kepuasan penegakan hukum yang sama dengan menu Kepuasan Rakyat.
 */
export function calculatePenegakanHukumMetrics(
  countryDetail: Record<string, unknown> | null | undefined
): PenegakanHukumMetrics {
  const detail = {
    pusatBantuanHukum: Number(countryDetail?.pusat_bantuan_hukum) || 0,
    pengadilan: Number(countryDetail?.pengadilan) || 0,
    kejaksaan: Number(countryDetail?.kejaksaan) || 0,
    posPolisi: Number(countryDetail?.pos_polisi) || 0,
    akademiPolisi: Number(countryDetail?.akademi_polisi) || 0,
  };
  const totalFacilities = PENEGAKAN_HUKUM_KEYS.reduce(
    (total, key) => total + (Number(countryDetail?.[key]) || 0),
    0,
  );

  return {
    totalFacilities,
    score: calculatePenegakanHukumScore(countryDetail),
    detail,
  };
}

// ─── Main: Calculate Overall Welfare Index ────────────────────────────────

export interface KesejahteraanIndex {
  overallScore: number;
  pendidikanScore: number;
  kesehatanScore: number;
  tempatUmumScore: number;
  penegakanHukumScore: number;
  panganScore: number;  // ← NEW
  hunianScore: number;  // ← NEW
  listrikScore: number;
  keterbukaanScore?: number; // ← NEW
  trend: 'naik' | 'turun' | 'stabil';
  detail: {
    pendidikan: PendidikanMetrics;
    kesehatan: KesehatanMetrics;
    tempatUmum: TempatUmumMetrics;
    penegakanHukum: PenegakanHukumMetrics;
    pangan?: any;  // ← NEW
    hunian?: any;  // ← NEW
    keterbukaan?: any; // ← NEW
  };
}

/**
 * Hitung Indeks Kesejahteraan Keseluruhan.
 * Skor dasar merupakan rata-rata dari delapan komponen layanan dan keterbukaan,
 * termasuk kepuasan penegakan hukum.
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
  previousScore?: number
): KesejahteraanIndex {
  // Sektor 1: Pendidikan
  const pop = Number(countryDetail?.jumlah_penduduk) || 1;
  const pendKeys = ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan", "literasi"];
  const pendTotal = pendKeys.reduce((s, k) => s + (Number(countryDetail?.[k]) || 0), 0);
  const pendIndex = pendTotal / pop;
  const pendidikanScore = Math.min(100, Math.round((pendIndex / 0.0001) * 100));

  // Sektor 2: Kesehatan
  const kesKeys = ["rumah_sakit_besar", "rumah_sakit_kecil", "pusat_diagnostik"];
  const kesTotal = kesKeys.reduce((s, k) => s + (Number(countryDetail?.[k]) || 0), 0);
  const kesehatanScore = calculateSharedKesehatanScore(countryDetail);

  // Sektor 3: Tempat Umum (Infrastruktur)
  const infraKeys = ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad"];
  const infraTotal = infraKeys.reduce((s, k) => s + (Number(countryDetail?.[k]) || 0), 0);
  const infraIndex = infraTotal / pop;
  const tempatUmumScore = Math.min(100, Math.round((infraIndex / 0.00005) * 100));

  // Sektor 4: Penegakan hukum, memakai skor yang sama dengan Kepuasan Rakyat.
  const penegakanHukum = calculatePenegakanHukumMetrics(countryDetail);

  const serviceMetrics = metadata && Object.keys(metadata).length > 0
    ? calculateServiceDeficitMetrics(countryDetail, metadata)
    : undefined;

  // Sektor 5: Pangan
  let panganScore = 1;
  const storedFood = countryDetail?.satisfaction?.food;
  if (!serviceMetrics) {
    panganScore = storedFood !== undefined && storedFood !== null ? Math.round(Number(storedFood)) : 0;
  } else {
    panganScore = calculatePanganScore(countryDetail, metadata);
  }

  // Sektor 6: Hunian
  let hunianScore = 1;
  const storedHousing = countryDetail?.satisfaction?.housing;
  if (!serviceMetrics) {
    hunianScore = storedHousing !== undefined && storedHousing !== null ? Math.round(Number(storedHousing)) : 0;
  } else {
    hunianScore = Math.round(serviceMetrics.housingCoverage * 100);
  }
  const storedElectricity = countryDetail?.satisfaction?.electricity;
  const listrikScore = serviceMetrics
    ? Math.round(serviceMetrics.electricityCoverage * 100)
    : storedElectricity !== undefined && storedElectricity !== null
      ? Math.round(Number(storedElectricity))
      : 50;

  // Indeks kesejahteraan mencakup listrik bersama pangan dan hunian.
  const keterbukaanScore = calculateKeterbukaanScore(countryDetail);
  const baseScore = Math.round(
    (pendidikanScore + kesehatanScore + tempatUmumScore + penegakanHukum.score + panganScore + hunianScore + listrikScore + keterbukaanScore) / 8
  );
  const bonus = Number(countryDetail?.kesejahteraan_bonus) || 0;
  const decayAccumulated = Number(countryDetail?.kesejahteraan_decay) || 0;
  const overallScore = Math.min(100, Math.max(1, baseScore + bonus - decayAccumulated));
  console.log('[calculateKesejahteraan] Calc results:', {
    country: countryDetail?.country,
    pendidikanScore,
    kesehatanScore,
    tempatUmumScore,
    penegakanHukumScore: penegakanHukum.score,
    panganScore,
    hunianScore,
    listrikScore,
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
    penegakanHukumScore: penegakanHukum.score,
    panganScore,
    hunianScore,
    listrikScore,
    keterbukaanScore,
    trend,
    detail: {
      pendidikan: dummyPendidikanMetrics,
      kesehatan: dummyKesehatanMetrics,
      tempatUmum: dummyTempatUmumMetrics,
      penegakanHukum,
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
  
  • Kesehatan: ${kesejahteraan.kesehatanScore}/100
    - ${kesejahteraan.detail.kesehatan.totalFacilities} fasilitas kesehatan
  
  • Tempat Umum: ${kesejahteraan.tempatUmumScore}/100
    - ${kesejahteraan.detail.tempatUmum.totalFacilities} fasilitas umum

  • Penegakan Hukum: ${kesejahteraan.penegakanHukumScore}/100
    - ${kesejahteraan.detail.penegakanHukum.totalFacilities} fasilitas penegakan hukum
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
export function getKesejahteraanDecayThreshold(
  kepuasan: number,
  keterbukaanScore?: number,
  serviceDeficitPressure = 0,
  lowSectorCount = 0,
): number {
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

  const serviceFactor = 1 - Math.min(1, Math.max(0, serviceDeficitPressure)) * 0.5;
  baseThreshold = Math.max(1, Math.floor(baseThreshold * serviceFactor));
  if (lowSectorCount > 0) baseThreshold = Math.min(baseThreshold, 6);
  return baseThreshold;
}

export interface KesejahteraanDecayInput {
  currentKesejahteraan: number;
  kesejahteraanMonthCounter: number;
  lastKesejahteraanThreshold: number;
  monthsPassed: number;
  currentKepuasan: number;
  keterbukaanScore?: number;
  serviceDeficitPressure?: number;
  lowSectorCount?: number;
  additionalDecay?: number;
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
    serviceDeficitPressure = 0,
    lowSectorCount = 0,
    additionalDecay = 0,
  } = input;

  // Step 1: Tambahkan bulan yang berlalu ke counter
  let counter = kesejahteraanMonthCounter + (monthsPassed > 0 ? monthsPassed : 0);

  // Step 2: Tentukan threshold baru berdasarkan kepuasan & keterbukaan
  const newThreshold = getKesejahteraanDecayThreshold(
    currentKepuasan,
    keterbukaanScore,
    serviceDeficitPressure,
    lowSectorCount,
  );

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

  const totalDecay = decay + Math.max(0, additionalDecay);
  const nextKesejahteraan = Math.max(1, Math.min(100, currentKesejahteraan - totalDecay));

  return {
    nextKesejahteraan,
    kesejahteraan_month_counter: finalCounter,
    last_kesejahteraan_threshold: newThreshold,
    decayThisTick: totalDecay,
  };
}
