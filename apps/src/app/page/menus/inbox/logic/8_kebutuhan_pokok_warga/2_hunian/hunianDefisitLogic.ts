import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface HunianDefisitNotification extends NotificationMessage {
  tradeType: 'defisit_hunian';
  totalCapacity: number;
  population: number;
  shortage: number;
  percentageMet: number;
}

export function generateHunianDefisitNotification(
  totalCapacity: number,
  population: number,
  shortage: number,
  percentageMet: number,
  dateStr: string
): HunianDefisitNotification {
  const formattedShortage = shortage.toLocaleString('id-ID');
  const formattedPop = population.toLocaleString('id-ID');
  const formattedCap = totalCapacity.toLocaleString('id-ID');

  return {
    id: `hunian-defisit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: `🏠 PERINGATAN KRISIS PEMUKIMAN: Defisit Tempat Hunian Warga!`,
    sender: `Kementerian Perumahan & Kawasan Permukiman`,
    message: `Kebutuhan tempat tinggal masyarakat mengalami krisis defisit. Terdapat sebanyak ${formattedShortage} jiwa warga tunawisma yang belum memiliki tempat hunian terakomodasi (hanya ${percentageMet.toFixed(1)}% populasi terfasilitasi dari total ${formattedPop} jiwa). Segera bangun Perumahan Subsidi, Apartemen, atau Mansion untuk mengatasi krisis sosial perumahan nasional ini!`,
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: shortage,
    isRead: false,
    tradeType: 'defisit_hunian',
    totalCapacity,
    population,
    shortage,
    percentageMet,
  };
}
