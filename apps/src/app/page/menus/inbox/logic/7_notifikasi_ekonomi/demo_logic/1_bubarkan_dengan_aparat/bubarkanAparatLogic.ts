import { DemonstrasiNotification } from '../demonstrasiEkonomiLogic';

export interface BubarkanAparatResult {
  success: boolean;
  cost: number;
  message: string;
  error?: string;
  presidentRatingPenalty: number;
  updatedNotification?: DemonstrasiNotification;
}

export const BUBARKAN_APARAT_COST = 100000;
export const BUBARKAN_APARAT_RATING_PENALTY = 10;

/**
 * Logika Bubarkan (Aparat) — Hard Power
 * - Demo langsung bubar hari itu juga (status "DITANGANI")
 * - Biaya: 100.000 NEO
 * - Dampak Instan: Peringkat Presiden -10
 */
export function executeBubarkanAparat(
  notification: DemonstrasiNotification,
  currentBudget: number
): BubarkanAparatResult {
  if (currentBudget < BUBARKAN_APARAT_COST) {
    return {
      success: false,
      cost: BUBARKAN_APARAT_COST,
      presidentRatingPenalty: 0,
      message: `Anggaran kas negara tidak mencukupi untuk pengerahan pasukan keamanan (${currentBudget.toLocaleString('id-ID')} NEO dari ${BUBARKAN_APARAT_COST.toLocaleString('id-ID')} NEO yang dibutuhkan).`,
      error: 'INSUFFICIENT_FUNDS'
    };
  }

  const updatedNotification: DemonstrasiNotification = {
    ...notification,
    demo_status: 'selesai',
  };

  return {
    success: true,
    cost: BUBARKAN_APARAT_COST,
    presidentRatingPenalty: BUBARKAN_APARAT_RATING_PENALTY,
    message: `Aparat keamanan gabungan berhasil membubarkan konsentrasi massa demonstran. Tensi unjuk rasa di jalanan berhasil diredam seketika, namun tindakan represif ini menurunkan Peringkat Presiden sebesar -10 poin.`,
    updatedNotification,
  };
}
