import { DemonstrasiNotification } from '../demonstrasiEkonomiLogic';

export interface DialogTerbukaResult {
  success: boolean;
  cost: number;
  message: string;
  targetMenuId: string;
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

  return {
    success: true,
    cost: DIALOG_TERBUKA_COST,
    targetMenuId: 'Menu:DialogTerbukaDemo',
    message: `Pemerintah resmi mengumumkan pembukaan forum dialog terbuka dengan perwakilan massa demonstran. Mengalihkan ke forum dialog...`,
    updatedNotification,
  };
}
