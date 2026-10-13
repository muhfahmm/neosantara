/**
 * Barak Logic
 * Mengatur konversi jumlah barak ke jumlah pasukan infanteri
 * 1 barak = 10.000 pasukan
 */

export const BARAK_TO_SOLDIERS_MULTIPLIER = 10000;

/**
 * Konversi jumlah barak menjadi jumlah pasukan infanteri
 * @param barakCount - Jumlah barak
 * @returns Jumlah pasukan infanteri
 */
export const convertBarakToSoldiers = (barakCount: number): number => {
  const normalizedCount = Number(barakCount ?? 0);
  const validCount = Number.isFinite(normalizedCount) ? normalizedCount : 0;
  return validCount * BARAK_TO_SOLDIERS_MULTIPLIER;
};

/**
 * Dapatkan multiplier untuk konversi barak ke pasukan
 * @returns Multiplier value (10.000)
 */
export const getBarakMultiplier = (): number => {
  return BARAK_TO_SOLDIERS_MULTIPLIER;
};

/**
 * Dapatkan deskripsi format barak
 * @returns String deskripsi multiplier
 */
export const getBarakDescription = (): string => {
  return `1 barak = ${BARAK_TO_SOLDIERS_MULTIPLIER.toLocaleString('id-ID', { maximumFractionDigits: 2 })} pasukan infanteri`;
};
