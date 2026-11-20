import { DemonstrasiNotification } from '../demonstrasiEkonomiLogic';
import { getDefaultInboxText } from '../../../notificationMessage';

export interface DialogTerbukaResult {
  success: boolean;
  cost: number;
  message: string;
  messageKey: string;
  targetPath: string;
  error?: string;
  updatedNotification?: DemonstrasiNotification;
}

export const DIALOG_TERBUKA_COST = 0;

/**
 * Logika Memulai Dialog Terbuka
 * - Demo tidak perlu menunggu 3 hari
 * - Mengarahkan (redirect) ke menu Dialog Terbuka
 * - Status di notifikasi ditandai 'dialog' atau langsung dapat diakses
 */
export function startDialogTerbuka(
  notification: DemonstrasiNotification
): DialogTerbukaResult {
  const updatedNotification: DemonstrasiNotification = {
    ...notification,
    demo_status: 'dialog',
  };
  const messageKey = 'side_inbox.demo.actions.dialogStarted';

  return {
    success: true,
    cost: DIALOG_TERBUKA_COST,
    targetPath: '/page/map_system/forum-dialog-terbuka',
    message: getDefaultInboxText(messageKey),
    messageKey,
    updatedNotification,
  };
}
