import { NotificationMessage } from '../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface KabinetChangeNotification extends NotificationMessage {
  tradeType: 'perubahan_kabinet';
  deptId: string;
  deptName: string;
  oldLevel: number;
  newLevel: number;
  isUpgrade: boolean;
  effectLabel: string;
}

export function generateKabinetChangeNotification(
  deptId: string,
  deptName: string,
  oldLevel: number,
  newLevel: number,
  effectLabel: string,
  dateStr: string
): KabinetChangeNotification {
  const isUpgrade = newLevel > oldLevel;

  const title = isUpgrade
    ? `🏛️ PENINGKATAN KABINET: ${deptName} (Lvl ${oldLevel} ➔ Lvl ${newLevel})`
    : `📉 RESTRUKTURISASI KABINET: ${deptName} (Lvl ${oldLevel} ➔ Lvl ${newLevel})`;

  const message = isUpgrade
    ? `Presiden dan Kabinet menyetujui penambahan anggaran serta peningkatan kapasitas operasional ${deptName} dari Level ${oldLevel} menjadi Level ${newLevel}. Peningkatan ini memberikan dorongan pada ${effectLabel}.`
    : `Pemerintah menyesuaikan penataan efisiensi pos kementerian pada ${deptName} dari Level ${oldLevel} menjadi Level ${newLevel}.`;

  return {
    id: `kabinet-change-${deptId}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title,
    sender: `Sekretariat Kabinet & Dewan Kementerian Nasional`,
    message,
    timestamp: dateStr,
    type: isUpgrade ? 'kepuasan' : 'kesejahteraan',
    value: newLevel - oldLevel,
    isRead: false,
    tradeType: 'perubahan_kabinet',
    deptId,
    deptName,
    oldLevel,
    newLevel,
    isUpgrade,
    effectLabel,
  };
}
