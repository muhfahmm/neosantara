import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface HunianDefisitNotification extends NotificationMessage {
  tradeType: 'defisit_hunian';
  totalCapacity: number;
  population: number;
  shortage: number;
  percentageMet: number;
  housingSatisfaction: number;
}

export function generateHunianDefisitNotification(
  totalCapacity: number,
  population: number,
  shortage: number,
  percentageMet: number,
  housingSatisfaction: number,
  dateStr: string
): HunianDefisitNotification {
  const formattedShortage = shortage.toLocaleString('id-ID');
  const formattedPop = population.toLocaleString('id-ID');

  const title = housingSatisfaction <= 20
    ? `🏠 KRISIS KRITIS PERUMAHAN: Indeks Kepuasan Perumahan ${housingSatisfaction}/100!`
    : `🏠 PERINGATAN DEFISIT PEMUKIMAN: Kebutuhan Tempat Hunian Warga`;

  const message = `Indeks Kepuasan Rakyat (Perumahan) berada di tingkat sangat rendah yaitu ${housingSatisfaction}/100. Terdapat ${formattedShortage} jiwa tunawisma yang belum memiliki tempat hunian terakomodasi (hanya ${percentageMet.toFixed(1)}% populasi terfasilitasi dari total ${formattedPop} jiwa). Segera bangun Perumahan Subsidi, Apartemen, atau Mansion untuk mengatasi krisis perumahan rakyat ini!`;

  return {
    id: `hunian-defisit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title,
    sender: `Kementerian Perumahan & Kawasan Permukiman`,
    message,
    timestamp: dateStr,
    type: 'kesejahteraan',
    value: shortage,
    isRead: false,
    tradeType: 'defisit_hunian',
    totalCapacity,
    population,
    shortage,
    percentageMet,
    housingSatisfaction,
  };
}
