import type { NotificationMessage } from "../../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic";
import { createInboxNotificationText, getDefaultInboxText } from "../../notificationMessage";

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
  const titleKey = "side_inbox.basicNeeds.population.title";
  const messageKey = "side_inbox.basicNeeds.population.message";
  const messageParams = {
    country: countryName,
    dailyLoss: Math.abs(dailyChange).toLocaleString("id-ID"),
    monthlyLoss: Math.abs(monthlyEstimate).toLocaleString("id-ID"),
  };

  return {
    id: `population-deficit-${countryName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${dateStr.slice(0, 7)}`,
    title: getDefaultInboxText(titleKey),
    titleKey,
    sender: getDefaultInboxText("side_inbox.basicNeeds.population.sender"),
    senderKey: "side_inbox.basicNeeds.population.sender",
    ...createInboxNotificationText(messageKey, messageParams),
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
