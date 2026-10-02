import { NotificationMessage } from '../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

export interface ListrikDefisitNotification extends NotificationMessage {
  tradeType: 'defisit_listrik';
  totalProduction: number;
  totalConsumption: number;
  deficitMW: number;
  deficitPct: number;
  deficitStep: number;
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
  const formattedProd = totalProduction.toLocaleString('id-ID');
  const formattedCons = totalConsumption.toLocaleString('id-ID', { maximumFractionDigits: 2 });

  return {
    id: `listrik-defisit-${deficitStep}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title: `⚡ PERINGATAN KRISIS LISTRIK: Defisit Daya reach ${deficitStep}%`,
    sender: `PT PLN (Persero) & Grid Kelistrikan Nasional`,
    message: `Grid kelistrikan nasional mengalami defisit pasokan listrik sebesar -${formattedDeficitMW} MW (-${deficitStep}% dari total beban). Total produksi saat ini ${formattedProd} MW sedangkan estimasi konsumsi mencapai ${formattedCons} MW. Segera bangun atau operasikan pembangkit listrik tambahan untuk menghindari pemadaman bergilir masif!`,
    timestamp: dateStr,
    type: 'kepuasan',
    value: deficitStep,
    isRead: false,
    tradeType: 'defisit_listrik',
    totalProduction,
    totalConsumption,
    deficitMW,
    deficitPct,
    deficitStep,
  };
}
