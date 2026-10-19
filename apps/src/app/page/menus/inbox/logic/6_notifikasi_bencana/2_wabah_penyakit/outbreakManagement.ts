/**
 * outbreakManagement.ts
 * Logika manajemen pandemi & epidemi:
 * - Frekuensi tahunan dengan persentase probabilitas
 * - Population decline selama outbreak
 * - Population recovery ketika bantuan diberikan
 */

// ===============================================
// 📊 DISTRIBUSI PROBABILITAS TAHUNAN
// ===============================================

export interface YearlyOutbreakDistribution {
  count: number;
  probability: number;
  description: string;
}

/**
 * Pandemi: 0-1 kali per tahun
 * Pola Persentase Kemunculan Pandemi per Tahun:
 * - Tahun ke-1: 30%
 * - Tahun ke-2: 35%
 * - Tahun ke-3: 40%
 * - Tahun ke-4: 45%
 * - Tahun ke-5: 50%
 * - Tahun ke-6: kembali ke 30%
 * - ... Tahun ke-10: 40% (siklus 5 tahunan: [30, 35, 40, 45, 50])
 */
export const PANDEMIC_YEARLY_PERCENTAGE_CYCLE = [30, 35, 40, 45, 50] as const;

export function getPandemicBaseChancePercentByYear(
  countryDetail: any,
  currentDateStr: string
): number {
  const currentYearMonth = parseYearMonth(currentDateStr);
  const currentYear = currentYearMonth ? currentYearMonth.year : new Date().getFullYear();

  // Ambil tahun mulai simulasi jika ada
  let startYear = currentYear;
  const gameStartStr = countryDetail?.game_start_date as string | undefined;
  if (gameStartStr) {
    const parsedStart = parseYearMonth(gameStartStr) || { year: parseInt(gameStartStr.split('-')[0], 10), month: 1 };
    if (parsedStart && !isNaN(parsedStart.year)) {
      startYear = parsedStart.year;
    }
  } else if (countryDetail?.game_start_year) {
    startYear = Number(countryDetail.game_start_year);
  }

  // Hitung index tahun ke-berapa (tahun ke-1 = index 0)
  const yearIndex = Math.max(0, currentYear - startYear);
  const cycleIndex = yearIndex % PANDEMIC_YEARLY_PERCENTAGE_CYCLE.length;
  return PANDEMIC_YEARLY_PERCENTAGE_CYCLE[cycleIndex];
}

export function getPandemicYearlyDistribution(
  countryDetail: any,
  currentDateStr: string
): YearlyOutbreakDistribution[] {
  const chancePercent = getPandemicBaseChancePercentByYear(countryDetail, currentDateStr);
  const prob = chancePercent / 100;
  return [
    { count: 0, probability: Math.max(0, 1 - prob), description: `Tahun aman, 0 pandemi (${(100 - chancePercent)}%)` },
    { count: 1, probability: prob, description: `1 pandemi dalam tahun ini (${chancePercent}%)` },
  ];
}

export const PANDEMIC_YEARLY_DISTRIBUTION: YearlyOutbreakDistribution[] = [
  { count: 0, probability: 0.70, description: 'Tahun aman, 0 pandemi' },
  { count: 1, probability: 0.30, description: '1 pandemi dalam tahun ini (default th-1)' },
];

/**
 * Epidemi: 1-5 kali per tahun
 * - 1 kali: 60%
 * - 2 kali: 15%
 * - 3 kali: 12%
 * - 4 kali: 8%
 * - 5 kali: 3%
 * - >5 kali: 2% (fallback ke 5 kali)
 */
export const EPIDEMIC_YEARLY_DISTRIBUTION: YearlyOutbreakDistribution[] = [
  { count: 1, probability: 0.60, description: '1 epidemi dalam tahun ini' },
  { count: 2, probability: 0.15, description: '2 epidemi dalam tahun ini' },
  { count: 3, probability: 0.12, description: '3 epidemi dalam tahun ini' },
  { count: 4, probability: 0.08, description: '4 epidemi dalam tahun ini' },
  { count: 5, probability: 0.03, description: '5 epidemi dalam tahun ini' },
  { count: 5, probability: 0.02, description: '5 epidemi (fallback dari >5)' },
];

// ===============================================
// 🎯 DATE PARSING & UTILITY FUNCTIONS
// ===============================================

export function parseYearMonth(
  dateStr: string
): { year: number; month: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  // Coba format ISO "YYYY-MM-DD" atau "YYYY-MM"
  const isoMatch = dateStr.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    if (!isNaN(year) && !isNaN(month)) {
      return { year, month };
    }
  }

  const months: Record<string, number> = {
    january: 1, jan: 1, januari: 1,
    february: 2, feb: 2, februari: 2,
    march: 3, mar: 3, maret: 3,
    april: 4, apr: 4,
    may: 5, mei: 5,
    june: 6, jun: 6, juni: 6,
    july: 7, jul: 7, juli: 7,
    august: 8, aug: 8, agustus: 8,
    september: 9, sep: 9,
    october: 10, oct: 10, oktober: 10,
    november: 11, nov: 11,
    december: 12, dec: 12, desember: 12,
  };

  const match = dateStr.match(/(\w+)\s+(\d{4})/i);
  if (!match) return null;

  const monthStr = match[1].toLowerCase();
  const year = parseInt(match[2], 10);
  const month = months[monthStr];

  return month ? { year, month } : null;
}

export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  try {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 999;
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 999;
  }
}

export function getMonthsDifference(
  dateStr1: string,
  dateStr2: string
): number {
  const d1 = parseYearMonth(dateStr1);
  const d2 = parseYearMonth(dateStr2);
  if (!d1 || !d2) return 0;

  return Math.abs((d2.year - d1.year) * 12 + (d2.month - d1.month));
}

// ===============================================
// 📋 TAHUNAN OUTBREAK QUOTA MANAGEMENT
// ===============================================

/**
 * Tentukan berapa kali pandemi/epidemi SEHARUSNYA terjadi tahun ini
 * Dipanggil SEKALI saat user mulai tahun baru (Jan 1)
 */
export function determineYearlyOutbreakCount(
  distribution: YearlyOutbreakDistribution[]
): number {
  const roll = Math.random();
  let cumulative = 0;

  for (const { count, probability } of distribution) {
    cumulative += probability;
    if (roll < cumulative) {
      return count;
    }
  }

  // Fallback
  return distribution[distribution.length - 1].count;
}

/**
 * Get sisa quota pandemi/epidemi tahun ini yang masih boleh terjadi
 */
export function getRemainingOutbreakQuota(
  countryDetail: any,
  isEpidemic: boolean,
  currentDateStr: string
): number {
  const currentYearMonth = parseYearMonth(currentDateStr);
  if (!currentYearMonth) return isEpidemic ? 5 : 1;

  // Key untuk store di countryDetail
  const quotaKey = isEpidemic
    ? `epidemic_yearly_quota_${currentYearMonth.year}`
    : `pandemic_yearly_quota_${currentYearMonth.year}`;

  let storedQuota = Number(countryDetail?.[quotaKey] ?? -1);

  // Jika belum ada quota tahun ini, tentukan sekarang
  if (storedQuota < 0) {
    storedQuota = determineYearlyOutbreakCount(
      isEpidemic
        ? EPIDEMIC_YEARLY_DISTRIBUTION
        : getPandemicYearlyDistribution(countryDetail, currentDateStr)
    );
    console.log(
      `[Outbreak Quota] Year ${currentYearMonth.year}: ${isEpidemic ? 'Epidemi' : 'Pandemi'} quota = ${storedQuota}`
    );
  }

  // Kurangi dengan event yang sudah terjadi tahun ini
  const allOutbreaks = Array.isArray(countryDetail?.active_outbreaks)
    ? countryDetail.active_outbreaks
    : [];

  const outbreaksThisYear = allOutbreaks.filter((outbreak: any) => {
    if (!outbreak.startDate) return false;
    const outbreakYearMonth = parseYearMonth(outbreak.startDate);
    if (
      !outbreakYearMonth ||
      outbreakYearMonth.year !== currentYearMonth.year
    ) {
      return false;
    }

    if (isEpidemic) {
      return !outbreak.category?.includes('Pandemi');
    } else {
      return outbreak.category?.includes('Pandemi');
    }
  });

  return Math.max(0, storedQuota - outbreaksThisYear.length);
}

// ===============================================
// 🎯 CHECKS UNTUK ALLOW/DISALLOW OUTBREAK
// ===============================================

/**
 * CEK apakah PANDEMI boleh terjadi hari ini
 */
export function canPandemicOccur(
  countryDetail: any,
  currentDateStr: string
): boolean {
  const quota = getRemainingOutbreakQuota(
    countryDetail,
    false,
    currentDateStr
  );
  return quota > 0;
}

/**
 * CEK apakah EPIDEMI boleh terjadi hari ini
 * Rules:
 * - Belum exceed quota tahun ini
 * - Minimum 14 hari spacing dari epidemi terakhir
 */
export function canEpidemicOccur(
  countryDetail: any,
  currentDateStr: string
): boolean {
  const quota = getRemainingOutbreakQuota(
    countryDetail,
    true,
    currentDateStr
  );
  if (quota <= 0) return false;

  // Cek spacing dari epidemi terakhir
  const allOutbreaks = Array.isArray(countryDetail?.active_outbreaks)
    ? countryDetail.active_outbreaks
    : [];

  const currentYearMonth = parseYearMonth(currentDateStr);
  if (!currentYearMonth) return true;

  const epidemicsThisYear = allOutbreaks.filter((outbreak: any) => {
    if (!outbreak.startDate || outbreak.category?.includes('Pandemi'))
      return false;
    if (
      !outbreak.category?.includes('Epidemi') &&
      !outbreak.category?.includes('Hewan') &&
      !outbreak.category?.includes('Tumbuhan') &&
      !outbreak.category?.includes('Mutasi')
    ) {
      return false;
    }

    const outbreakYearMonth = parseYearMonth(outbreak.startDate);
    return outbreakYearMonth && outbreakYearMonth.year === currentYearMonth.year;
  });

  // Cek spacing 14 hari dari epidemi terakhir
  if (epidemicsThisYear.length > 0) {
    const lastEpidemic = epidemicsThisYear[epidemicsThisYear.length - 1];
    if (lastEpidemic.startDate) {
      const daysDiff = getDaysDifference(lastEpidemic.startDate, currentDateStr);
      if (daysDiff < 14) return false;
    }
  }

  return true;
}

// ===============================================
// 👥 POPULATION MANAGEMENT
// ===============================================

/**
 * Hitung populasi yang hilang per hari selama outbreak aktif
 * Format: outbreak dalam active_outbreaks dengan isHandled=false
 */
export function getActiveOutbreakPopulationLoss(
  countryDetail: any,
  currentDateStr: string
): number {
  const allOutbreaks = Array.isArray(countryDetail?.active_outbreaks)
    ? countryDetail.active_outbreaks
    : [];

  let totalLoss = 0;

  for (const outbreak of allOutbreaks) {
    if (outbreak.isHandled) continue; // Skip yang sudah ditangani

    if (!outbreak.startDate || !outbreak.durationDays) continue;

    const daysSinceStart = getDaysDifference(outbreak.startDate, currentDateStr);
    if (daysSinceStart > outbreak.durationDays) continue; // Outbreak sudah berakhir secara alami

    // Populasi hilang per hari = korban / duration
    const dailyLoss = Math.ceil(
      (outbreak.korban || 0) / (outbreak.durationDays || 1)
    );
    totalLoss += dailyLoss;
  }

  return totalLoss;
}

/**
 * HANDLE BANTUAN MEDIS:
 * - Tandai outbreak sebagai isHandled=true
 * - Return populasi yang akan di-restore
 */
export function handleMedicalAssistance(
  countryDetail: any,
  outbreakId: string
): { restored: number; message: string } | null {
  const allOutbreaks = Array.isArray(countryDetail?.active_outbreaks)
    ? countryDetail.active_outbreaks
    : [];

  const outbreak = allOutbreaks.find((o: any) => o.id === outbreakId);
  if (!outbreak) {
    return null;
  }

  if (outbreak.isHandled) {
    return {
      restored: 0,
      message: `Outbreak sudah ditangani sebelumnya`,
    };
  }

  // Populasi yang akan di-restore = korban yang tersisa
  const restored = outbreak.korban || 0;

  return {
    restored,
    message: `Populasi ${restored.toLocaleString(
      'id-ID'
    )} orang berhasil diselamatkan dari ${outbreak.eventName}`,
  };
}

/**
 * DEACTIVATE OUTBREAK SETELAH BANTUAN
 * Update countryDetail untuk set isHandled=true pada outbreak tertentu
 */
export function deactivateOutbreak(
  countryDetail: any,
  outbreakId: string
): any {
  if (!countryDetail) return countryDetail;

  return {
    ...countryDetail,
    active_outbreaks: Array.isArray(countryDetail.active_outbreaks)
      ? countryDetail.active_outbreaks.map((o: any) =>
          o.id === outbreakId ? { ...o, isHandled: true } : o
        )
      : countryDetail.active_outbreaks,
  };
}

/**
 * APPLY POPULATION DECLINE SAAT OUTBREAK MUNCUL
 * Populasi langsung berkurang sebesar perkiraanKematian (tidak bertahap)
 */
export function applyOutbreakPopulationLoss(
  currentPopulation: number,
  outbreak: any
): number {
  const deaths = outbreak.perkiraanKematian || 0;
  return Math.max(0, currentPopulation - deaths);
}
