import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

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
  const formattedDeficitMW = deficitMW.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const formattedProd = totalProduction.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const formattedCons = totalConsumption.toLocaleString('id-ID', { maximumFractionDigits: 2 });

  // Setiap notifikasi kelistrikan kurang menurunkan rating sebesar 1 poin
  const ratingPenalty = 1; // Setiap notifikasi turun 1 poin

  const penaltyMessage = `\n\n⚠️ DAMPAK TERHADAP KEPERCAYAAN PUBLIK:\nKrisis kelistrikan ini mengurangi peringkat kepuasan rakyat sebesar ${ratingPenalty} poin. Setiap notifikasi kelistrikan kurang akan menurunkan peringkat Anda.`;

  return {
    id: `listrik-defisit-${deficitStep}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: `⚡ PERINGATAN KRISIS LISTRIK: Defisit Daya reach ${deficitStep}%`,
    sender: `PT PLN (Persero) & Grid Kelistrikan Nasional`,
    message: `Grid kelistrikan nasional mengalami defisit pasokan listrik sebesar -${formattedDeficitMW} MW (-${deficitStep}% dari total beban). Total produksi saat ini ${formattedProd} MW sedangkan estimasi konsumsi mencapai ${formattedCons} MW. Segera bangun atau operasikan pembangkit listrik tambahan untuk menghindari pemadatan bergilir masif!${penaltyMessage}`,
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