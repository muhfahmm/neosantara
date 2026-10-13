import { getBuildingMetadata } from "@/lib/buildingMetadataRegistry";

/**
 * Menghitung waktu perekrutan berdasarkan jumlah pasukan
 * Setiap 10.000 pasukan membutuhkan 8 hari (dari metadata waktu_pembangunan_armada_aktif)
 * @param recruitAmount - Jumlah pasukan yang akan direkrut
 * @param unitsPerChunk - Jumlah pasukan per chunk waktu (default 10.000)
 * @param daysPerChunk - Hari yang dibutuhkan per chunk (default 8)
 * @returns Jumlah hari yang dibutuhkan
 */
export function calculateRecruitmentDays(
  recruitAmount: number,
  unitsPerChunk: number = 10000,
  daysPerChunk: number = 8
): number {
  if (recruitAmount <= 0) return 0;
  const chunks = Math.ceil(recruitAmount / unitsPerChunk);
  return chunks * daysPerChunk;
}

/**
 * Mendapatkan informasi waktu pembangunan untuk armada aktif dari metadata
 * @param unitDataKey - Data key dari unit (misal: 'pasukan_infanteri')
 * @returns waktu dalam hari
 */
export function getArmadaRecruitmentTime(unitDataKey: string): number {
  const metadata = Object.values(getBuildingMetadata()).find(
    (item) => (item as { dataKey?: string }).dataKey === unitDataKey
  );
  
  if (!metadata) {
    console.warn(`Metadata not found for ${unitDataKey}, using default 8 days`);
    return 8;
  }

  const days = (metadata as { waktu_pembangunan_armada_aktif?: number }).waktu_pembangunan_armada_aktif;
  return days || 8;
}

/**
 * Interface untuk ongoing recruitment
 */
export interface OngoingRecruitment {
  id: string;
  unitDataKey: string;
  unitLabel: string;
  amount: number;
  costPerUnit: number;
  totalCost: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  daysRequired: number;
  progressPercentage: number;
  status: 'in_progress' | 'completed';
}

/**
 * Menambahkan recruitment baru ke dalam daftar ongoing reconstructions
 * @param existing - Array dari ongoing constructions
 * @param unitDataKey - Data key dari unit
 * @param unitLabel - Label dari unit (misal: 'Pasukan Infanteri')
 * @param amount - Jumlah yang akan direkrut
 * @param costPerUnit - Biaya per unit
 * @param currentDate - Tanggal saat ini (ISO string)
 * @returns Array konstruksi yang diperbarui dengan recruitment baru
 */
export function addOngoingRecruitment(
  existing: any[] = [],
  unitDataKey: string,
  unitLabel: string,
  amount: number,
  costPerUnit: number,
  currentDate: string
): any[] {
  const recruitmentDays = calculateRecruitmentDays(amount);
  
  // Parse current date
  const startDateObj = new Date(currentDate);
  const endDateObj = new Date(startDateObj);
  endDateObj.setDate(endDateObj.getDate() + recruitmentDays);

  const newRecruitment: OngoingRecruitment = {
    id: `recruitment_${unitDataKey}_${Date.now()}`,
    unitDataKey,
    unitLabel,
    amount,
    costPerUnit,
    totalCost: amount * costPerUnit,
    startDate: currentDate,
    endDate: endDateObj.toISOString(),
    daysRequired: recruitmentDays,
    progressPercentage: 0,
    status: 'in_progress',
  };

  return [...existing, newRecruitment];
}

/**
 * Update progress dari ongoing recruitments berdasarkan game date saat ini
 * @param ongoingRecruit - Array ongoing recruitments
 * @param currentDate - Tanggal game saat ini (ISO string)
 * @returns Object berisi updated array dan list recruitment yang completed
 */
export function updateRecruitmentProgress(
  ongoingRecruit: any[] = [],
  currentDate: string
): {
  updated: any[];
  completed: OngoingRecruitment[];
} {
  const completed: OngoingRecruitment[] = [];
  const updated = ongoingRecruit.map((recruitment) => {
    if (recruitment.status === 'completed') {
      return recruitment;
    }

    const startDate = new Date(recruitment.startDate);
    const endDate = new Date(recruitment.endDate);
    const now = new Date(currentDate);

    if (now >= endDate) {
      // Recruitment complete
      completed.push({ ...recruitment, status: 'completed', progressPercentage: 100 });
      return { ...recruitment, status: 'completed', progressPercentage: 100 };
    }

    // Calculate progress
    const totalTime = endDate.getTime() - startDate.getTime();
    const elapsedTime = now.getTime() - startDate.getTime();
    const progress = Math.round((elapsedTime / totalTime) * 100);

    return { ...recruitment, progressPercentage: Math.min(progress, 99) };
  });

  return { updated, completed };
}

/**
 * Menghitung recruitment time berdasarkan unit type dari metadata
 * @param unitDataKey - Data key dari unit
 * @param amount - Jumlah unit
 * @param unitsPerChunk - Default units per time chunk
 * @returns Jumlah hari yang dibutuhkan
 */
export function calculateCustomRecruitmentTime(
  unitDataKey: string,
  amount: number,
  unitsPerChunk: number = 10000
): number {
  const daysPerChunk = getArmadaRecruitmentTime(unitDataKey);
  const chunks = Math.ceil(amount / unitsPerChunk);
  return chunks * daysPerChunk;
}
