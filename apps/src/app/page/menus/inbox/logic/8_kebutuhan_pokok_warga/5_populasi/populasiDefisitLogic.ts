import type { NotificationMessage } from "../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic";

export interface PopulasiDefisitNotification extends NotificationMessage {
  tradeType: "defisit_populasi";
  dailyChange: number;
  monthlyEstimate: number;
  currentPopulation: number;
}

export function generatePopulasiDefisitNotification(
  dailyChange: number,
  currentPopulation: number,
  dateStr: string,
  countryName: string,
): PopulasiDefisitNotification {
  const monthlyEstimate = dailyChange * 30;

  return {
    id: `population-deficit-${countryName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${dateStr.slice(0, 7)}`,
    title: "⚠️ Peringatan Defisit Populasi",
    sender: "Kementerian Dalam Negeri",
    message: `Populasi ${countryName} sedang mengalami penurunan bersih ${Math.abs(dailyChange).toLocaleString("id-ID")} jiwa per hari. Jika kondisi ini bertahan, estimasi penurunan mencapai ${Math.abs(monthlyEstimate).toLocaleString("id-ID")} jiwa dalam 30 hari. Tinjau kembali kebijakan dan kondisi pangan, hunian, serta layanan kesehatan.`,
    timestamp: dateStr,
    type: "kepuasan",
    value: dailyChange,
    isRead: false,
    tradeType: "defisit_populasi",
    dailyChange,
    monthlyEstimate,
    currentPopulation,
  };
}
