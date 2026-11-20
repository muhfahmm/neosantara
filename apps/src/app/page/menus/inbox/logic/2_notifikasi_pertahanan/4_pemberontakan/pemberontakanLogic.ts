import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';
import {
  applyPencegahanSeparatismeBonus,
  applyGardaNasionalSeparatismeReduction,
} from '@/app/page/bonus_logic';

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
 * - Dikurangi oleh bonus penelitian "Pencegahan Separatisme" jika sudah diteliti.
 * - Dikurangi oleh bonus Garda Nasional (Departemen Keamanan).
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
  const researchReducedRisk = applyPencegahanSeparatismeBonus(
    (defisitKepuasan + defisitKesejahteraan) / 2,
    countryDetail
  );

  const finalRisk = applyGardaNasionalSeparatismeReduction(
    researchReducedRisk,
    countryDetail
  );

  return Math.max(0, Math.min(100, Math.round(finalRisk * 10) / 10));
}

export function generatePemberontakanNotification(
  countryName: string,
  dateStr: string,
  riskPercent?: number
): PemberontakanNotification {
  const displayRisk = riskPercent !== undefined
    ? `${riskPercent}%`
    : getDefaultInboxText('side_inbox.defense.independenceDeclarationRisk');
  const titleKey = 'side_inbox.defense.pemberontakanTitle';
  const titleParams = { country: countryName };
  const senderKey = 'side_inbox.defense.pemberontakanSender';
  const senderParams = { country: countryName };
  const effectTextKey = 'side_inbox.defense.pemberontakanEffect';
  const effectTextParams = { risk: displayRisk };

  return {
    id: `pemberontakan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText(senderKey, senderParams),
    senderKey,
    senderParams,
    ...createInboxNotificationText('side_inbox.notificationMessages.rebellion', {
      country: countryName,
    }),
    timestamp: dateStr,
    type: 'kepuasan',
    value: 0,
    isRead: false,
    tradeType: 'pemberontakan',
    provinceName: countryName,
    rebelGroup: `Kelompok Pemberontak ${countryName}`,
    costEM: 250,
    effectText: getDefaultInboxText(effectTextKey, effectTextParams),
    effectTextKey,
    effectTextParams,
    isHandled: false
  };
}
