import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { formatElectricityMW } from '@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/1_grid_nasional/consumptionLogic';
import { createInboxNotificationText, getDefaultInboxText } from '../../notificationMessage';

export interface ListrikDefisitNotification extends NotificationMessage {
  tradeType: 'defisit_listrik';
  totalProduction: number;
  totalConsumption: number;
  deficitMW: number;
  deficitPct: number;
  deficitStep: number;
  ratingPenalty?: number;
}

export function generateListrikDefisitNotification(
  totalProduction: number,
  totalConsumption: number,
  deficitMW: number,
  deficitPct: number,
  deficitStep: number,
  dateStr: string
): ListrikDefisitNotification {
  const formattedDeficitMW = formatElectricityMW(deficitMW);
  const formattedProd = formatElectricityMW(totalProduction);
  const formattedCons = formatElectricityMW(totalConsumption);

  // Setiap notifikasi kelistrikan kurang menurunkan rating sebesar 1 poin
  const ratingPenalty = 1; // Setiap notifikasi turun 1 poin

  const titleKey = 'side_inbox.dynamicNotifications.basicNeeds.electricity.title';
  const titleParams = { step: deficitStep };
  const messageKey = 'side_inbox.dynamicNotifications.basicNeeds.electricity.message';
  const messageParams = {
    deficit: formattedDeficitMW,
    production: formattedProd,
    consumption: formattedCons,
    step: deficitStep,
    ratingPenalty,
  };

  return {
    id: `listrik-defisit-${deficitStep}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText('side_inbox.dynamicNotifications.basicNeeds.electricity.sender'),
    senderKey: 'side_inbox.dynamicNotifications.basicNeeds.electricity.sender',
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp: dateStr,
    type: 'peringkat', // Mengubah dari 'kepuasan' ke 'peringkat' untuk memicu penurunan rating
    value: -ratingPenalty, // Nilai negatif untuk menurunkan rating
    isRead: false,
    tradeType: 'defisit_listrik',
    totalProduction,
    totalConsumption,
    deficitMW,
    deficitPct,
    deficitStep,
    ratingPenalty,
  };
}