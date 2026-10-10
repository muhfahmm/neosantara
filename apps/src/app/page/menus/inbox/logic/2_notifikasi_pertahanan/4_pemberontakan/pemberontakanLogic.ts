import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface PemberontakanNotification extends NotificationMessage {
  tradeType: 'pemberontakan';
  provinceName: string;
  rebelGroup: string;
  costEM?: number;
  effectText?: string;
  isHandled?: boolean;
}

/**
 * Menghitung tingkat risiko separatisme (%) berdasarkan:
 * - Kekurangan Kepuasan: (100 - Kepuasan) %
 * - Kekurangan Kesejahteraan: (100 - Kesejahteraan) %
 * - Rata-rata risiko dasar = (Defisit Kepuasan + Defisit Kesejahteraan) / 2
 * - Dikurangi oleh bonus penelitian "Pencegahan Separatisme" (kontra_separatisme) jika sudah diteliti.
 */
export function calculateSeparatismeRiskPercent(
  countryDetail: Record<string, any> | null | undefined
): number {
  if (!countryDetail) return 0;

  const kepuasan = Math.max(0, Math.min(100, Number(countryDetail.kepuasan ?? countryDetail.kepuasan_publik ?? 78)));
  const kesejahteraan = Math.max(0, Math.min(100, Number(countryDetail.kesejahteraan ?? countryDetail.indeks_kesejahteraan ?? 55)));

  const defisitKepuasan = 100 - kepuasan;
  const defisitKesejahteraan = 100 - kesejahteraan;

  // Akumulasi rata-rata defisit ketidakpuasan & ketidaksejahteraan
  let rawRisk = (defisitKepuasan + defisitKesejahteraan) / 2;

  // Cek bonus penelitian Pencegahan Separatisme (kontra_separatisme)
  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  if (completedResearch.includes("kontra_separatisme")) {
    const researchLevels = countryDetail.research_levels && typeof countryDetail.research_levels === "object"
      ? (countryDetail.research_levels as Record<string, unknown>)
      : {};
    const level = Math.max(1, Number(researchLevels["kontra_separatisme"]) || 1);
    const reductionPercent = level * 2; // -2% per level
    rawRisk = Math.max(0, rawRisk - reductionPercent);
  }

  return Math.max(0, Math.min(100, Math.round(rawRisk * 10) / 10));
}

export function generatePemberontakanNotification(
  provinceName: string,
  dateStr: string,
  riskPercent?: number
): PemberontakanNotification {
  const displayRisk = riskPercent !== undefined ? `${riskPercent}%` : 'Risiko Deklarasi Kemerdekaan';

  return {
    id: `pemberontakan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: `🔥 Pemberontakan Bersenjata: Provinsi ${provinceName}`,
    sender: `Gubernur & Pangdam Provinsi ${provinceName}`,
    message: `Lapor Presiden! Terjadi gelombang demonstrasi radikal dan gerakan separatis bersenjata di wilayah provinsi ${provinceName}. Milisi lokal menuntut deklarasi kemerdekaan penuh dari kedaulatan negara!`,
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'pemberontakan',
    provinceName,
    rebelGroup: `Gerakan Kemerdekaan ${provinceName}`,
    costEM: 250,
    effectText: `Risiko Separatisme: ${displayRisk} | Risiko Lepas Provinsi`,
    isHandled: false
  };
}
