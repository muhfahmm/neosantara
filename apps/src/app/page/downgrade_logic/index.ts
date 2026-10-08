/**
 * Logika Pengaruh Poin Pendidikan & Bonus Agama (Ateisme) terhadap Waktu Penelitian (Research Duration)
 * 
 * Aturan Poin Pendidikan:
 * - 0 - 25   : Waktu penelitian bertambah +25% (+25)
 * - 26 - 40  : Waktu penelitian bertambah +20% (+20)
 * - 41 - 65  : Waktu penelitian bertambah +15% (+15)
 * - 66 - 80  : Waktu penelitian berkurang -5%  (-5)
 * - 81 - 100 : Waktu penelitian berkurang -10% (-10)
 * 
 * Bonus Agama Ateisme:
 * - Waktu penelitian berkurang -15% (-15)
 * 
 * Penggabungan: Total persentase dijumlahkan langsung (+ dengan + atau - dengan - atau + dengan -).
 */

export interface EducationResearchModifierInfo {
  educationPoints: number;
  percentageChange: number; // e.g. +25, +20, +15, -5, -10
  multiplier: number;       // e.g. 1.25, 1.20, 1.15, 0.95, 0.90
  label: string;            // e.g. "+25% Waktu Penelitian"
  isPenalty: boolean;       // true jika bertambah (penalti), false jika berkurang (bonus)
}

export interface CombinedResearchModifierInfo {
  totalPercentageChange: number; // e.g. 0 (+15 - 15), +10 (+25 - 15), -25 (-10 - 15)
  multiplier: number;            // e.g. 1.0, 1.10, 0.75
  educationPercentageChange: number;
  atheismPercentageChange: number;
  hasAtheismBonus: boolean;
  label: string;
}

/**
 * Menghitung Poin Pendidikan dari countryDetail (0 - 100).
 */
export function calculateEducationPoints(countryDetail: any): number {
  if (!countryDetail) return 50; // default 50 poin
  
  if (typeof countryDetail.poin_pendidikan === 'number' && !isNaN(countryDetail.poin_pendidikan)) {
    return Math.min(100, Math.max(0, countryDetail.poin_pendidikan));
  }

  const pop = Number(countryDetail.jumlah_penduduk) || 1;
  const keys = [
    "prasekolah", "dasar", "menengah", "lanjutan", "universitas",
    "lembaga_pendidikan", "laboratorium", "observatorium",
    "pusat_penelitian", "pusat_pengembangan"
  ];
  const totalFacilities = keys.reduce((s, k) => s + (Number(countryDetail[k]) || 0), 0);
  const ratio = totalFacilities / pop;
  return Math.min(100, Math.max(0, Math.round((ratio / 0.0001) * 100)));
}

/**
 * Mendapatkan informasi modifier durasi penelitian berdasarkan poin pendidikan (0-100).
 */
export function getEducationResearchModifier(educationPoints: number): EducationResearchModifierInfo {
  const points = Math.max(0, Math.min(100, Number(educationPoints) || 0));

  if (points <= 25) {
    return {
      educationPoints: points,
      percentageChange: 25,
      multiplier: 1.25,
      label: '+25% Waktu Penelitian',
      isPenalty: true,
    };
  } else if (points <= 40) {
    return {
      educationPoints: points,
      percentageChange: 20,
      multiplier: 1.20,
      label: '+20% Waktu Penelitian',
      isPenalty: true,
    };
  } else if (points <= 65) {
    return {
      educationPoints: points,
      percentageChange: 15,
      multiplier: 1.15,
      label: '+15% Waktu Penelitian',
      isPenalty: true,
    };
  } else if (points <= 80) {
    return {
      educationPoints: points,
      percentageChange: -5,
      multiplier: 0.95,
      label: '-5% Waktu Penelitian',
      isPenalty: false,
    };
  } else {
    // 81 - 100
    return {
      educationPoints: points,
      percentageChange: -10,
      multiplier: 0.90,
      label: '-10% Waktu Penelitian',
      isPenalty: false,
    };
  }
}

/**
 * Menghitung akumulasi persentase gabungan antara Poin Pendidikan dan Bonus Ateisme.
 */
export function calculateCombinedResearchDurationModifier(
  educationPoints: number,
  religion: unknown
): CombinedResearchModifierInfo {
  const eduMod = getEducationResearchModifier(educationPoints);
  const normalizedReligion = String(religion || "").trim().toLowerCase();
  const hasAtheismBonus = normalizedReligion === "ateisme";
  const atheismPercentageChange = hasAtheismBonus ? -15 : 0;

  const totalPercentageChange = eduMod.percentageChange + atheismPercentageChange;
  const multiplier = Math.max(0.1, 1 + totalPercentageChange / 100);

  const formattedTotal = totalPercentageChange > 0
    ? `+${totalPercentageChange}% Waktu Penelitian`
    : totalPercentageChange < 0
      ? `${totalPercentageChange}% Waktu Penelitian`
      : `0% Penyesuaian Waktu (Netral)`;

  return {
    totalPercentageChange,
    multiplier,
    educationPercentageChange: eduMod.percentageChange,
    atheismPercentageChange,
    hasAtheismBonus,
    label: formattedTotal,
  };
}

/**
 * Menghitung durasi penelitian akhir setelah memperhitungkan poin pendidikan dan bonus agama.
 */
export function applyCombinedResearchDuration(
  baseDurationDays: number,
  educationPoints: number,
  religion: unknown
): number {
  if (baseDurationDays <= 0) return baseDurationDays;
  const combined = calculateCombinedResearchDurationModifier(educationPoints, religion);
  return Math.max(1, Math.ceil(baseDurationDays * combined.multiplier));
}

/**
 * @deprecated Digunakan untuk backwards compatibility
 */
export function applyEducationResearchDuration(
  baseDurationDays: number,
  educationPoints: number
): number {
  if (baseDurationDays <= 0) return baseDurationDays;
  const modifier = getEducationResearchModifier(educationPoints);
  return Math.max(1, Math.ceil(baseDurationDays * modifier.multiplier));
}