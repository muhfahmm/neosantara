/**
 * eventTypes.ts
 * Tipe data & antarmuka untuk sistem penanganan Event & Notifikasi Inbox bagi Negara AI.
 */

export type AiEventCategory =
  | "bencana"
  | "keamanan"
  | "pertahanan"
  | "perdagangan"
  | "geopolitik"
  | "kebutuhan_pokok";

export interface AiInboxEvent {
  id: string;
  category: AiEventCategory;
  title: string;
  sender?: string;
  date: string;
  rawType?: string;
  data: Record<string, any>;
  isHandled?: boolean;
}

export interface AiEventDecision {
  handled: boolean;
  category: AiEventCategory;
  eventId: string;
  actionTaken: string;
  biayaDikeluarkan?: number;
  alasan: string;
  dampak?: Record<string, any>;
}
