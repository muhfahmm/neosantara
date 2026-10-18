import { DemonstrasiNotification } from '../demonstrasiEkonomiLogic';

export interface PenuhiTuntutanResult {
  success: boolean;
  message: string;
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
  let causeLabel = 'Kebijakan Subsidi';

  if (notification.cause === 'harga') {
    targetMenuId = 'Menu:Harga';
    causeLabel = 'Kontrol Harga Barang Pokok';
  } else if (notification.cause === 'pajak') {
    targetMenuId = 'Menu:Pajak';
    causeLabel = 'Manajemen Pajak';
  }

  const updatedNotification: DemonstrasiNotification = {
    ...notification,
    demo_status: 'selesai',
  };

  return {
    success: true,
    presidentRatingBonus: PENUHI_TUNTUTAN_RATING_BONUS,
    targetMenuId,
    message: `Pemerintah resmi menyatakan kesediaan memenuhi aspirasi publik dan meninjau kembali ${causeLabel}. Massa aksi membubarkan diri dengan suka cita. Peringkat Presiden naik +10 poin. Mengalihkan ke menu pengaturan...`,
    updatedNotification,
  };
}
