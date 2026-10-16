const AUTOMATIC_CHANGE_TRADE_TYPES = new Set([
  "perubahan_pajak",
  "harga_barang_pokok",
  "kebijakan_subsidi",
  "perubahan_sistem_ekonomi",
  "perubahan_ideologi",
  "perubahan_agama",
  "perubahan_doktrin",
  "perubahan_fokus_riset",
  "perubahan_kabinet",
]);

const COMPLETED_AGREEMENT_NOTIFICATION_IDS = [
  "pact-ratified-",
  "diplomacy-ratified-",
];

const COMPLETED_AGREEMENT_TITLES = new Set([
  "Pakta Non-Agresi Resmi Berlaku",
  "Aliansi Pertahanan Resmi Berlaku",
  "Perjanjian Dagang Resmi Berlaku",
  "Kontrak Penelitian Resmi Berlaku",
]);

export function isNonActionableUpdateNotification(notification: unknown): boolean {
  if (typeof notification !== "object" || notification === null) return false;

  const record = notification as Record<string, unknown>;
  const tradeType = record.tradeType;
  if (typeof tradeType === "string" && AUTOMATIC_CHANGE_TRADE_TYPES.has(tradeType)) {
    return true;
  }

  const id = typeof record.id === "string" ? record.id : "";
  const title = typeof record.title === "string" ? record.title : "";
  return COMPLETED_AGREEMENT_NOTIFICATION_IDS.some(prefix => id.startsWith(prefix)) ||
    COMPLETED_AGREEMENT_TITLES.has(title);
}
