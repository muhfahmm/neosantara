import { DemonstrasiNotification } from '../demonstrasiEkonomiLogic';
import { getDefaultInboxText } from '../../../notificationMessage';

export interface PenuhiTuntutanResult {
  success: boolean;
  message: string;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  targetMenuId: string;
  presidentRatingBonus: number;
  updatedNotification: DemonstrasiNotification;
}

export const PENUHI_TUNTUTAN_RATING_BONUS = 10;

/**
 * Logika Penuhi Tuntutan
 * - Demo bubar seketika (status "DITANGANI")
 * - Redirect ke menu terkait sesuai tipe demonstrasi:
 *    - 'subsidi' -> 'Menu:KebijakanSubsidi'
 *    - 'harga'   -> 'Menu:Harga'
 *    - 'pajak'   -> 'Menu:Pajak'
 * - Dampak Instan: Peringkat Presiden naik +10
 */
export function executePenuhiTuntutan(
  notification: DemonstrasiNotification
): PenuhiTuntutanResult {
  let targetMenuId = 'Menu:KebijakanSubsidi';
  let cause = 'subsidi';

  if (notification.cause === 'harga') {
    targetMenuId = 'Menu:Harga';
    cause = 'harga';
  } else if (notification.cause === 'pajak') {
    targetMenuId = 'Menu:Pajak';
    cause = 'pajak';
  }
  const messageKey = `side_inbox.demo.actions.fulfilled.${cause}`;
  const messageParams = { bonus: PENUHI_TUNTUTAN_RATING_BONUS };

  const updatedNotification: DemonstrasiNotification = {
    ...notification,
    demo_status: 'selesai',
  };

  return {
    success: true,
    presidentRatingBonus: PENUHI_TUNTUTAN_RATING_BONUS,
    targetMenuId,
    message: getDefaultInboxText(messageKey, messageParams),
    messageKey,
    messageParams,
    updatedNotification,
  };
}
