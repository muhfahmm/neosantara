/**
 * eventOrchestrator.ts
 *
 * Orkestrator Pengolah Notifikasi Inbox & Event untuk Negara AI:
 * Membaca antrian event / pesan inbox negara, mengklasifikasikan kategori,
 * lalu mendelegasikannya ke sub-handler yang sesuai:
 * - Bencana Alam & Wabah -> disasterEventLogic.ts
 * - Insiden Keamanan & Kriminal -> securityEventLogic.ts
 * - Ancaman Pertahanan & Sabotase -> defenseEventLogic.ts
 * - Tawaran Perdagangan Masuk -> tradeEventLogic.ts
 * - Sidang Resolusi PBB & Geopolitik -> geopoliticsEventLogic.ts
 */

import type { BrainContext } from "../core/brainContext";
import type { AiInboxEvent, AiEventDecision, AiEventCategory } from "./eventTypes";
import { handleDisasterEvent } from "./disasterEventLogic";
import { handleSecurityEvent } from "./securityEventLogic";
import { handleDefenseEvent } from "./defenseEventLogic";
import { handleTradeEvent } from "./tradeEventLogic";
import { handleGeopoliticsEvent } from "./geopoliticsEventLogic";

export function klasifikasikanKategoriEvent(raw: Record<string, any>): AiEventCategory {
  const type = String(raw.tradeType || raw.type || "").toLowerCase();
  const cat = String(raw.category || "").toLowerCase();
  const title = String(raw.title || "").toLowerCase();

  if (type === "bencana_alam" || cat.includes("bencana") || cat.includes("geologi") || cat.includes("klimatologi") || title.includes("gempa") || title.includes("tsunami")) {
    return "bencana";
  }
  if (type === "keamanan" || cat.includes("keamanan") || cat.includes("kepolisian") || title.includes("perampokan") || title.includes("kerusuhan")) {
    return "keamanan";
  }
  if (type === "diserang" || type === "sabotase" || type === "spionase" || type === "invasi" || title.includes("nuklir") || title.includes("perang") || title.includes("pemberontakan")) {
    return "pertahanan";
  }
  if (type === "beli" || type === "jual" || title.includes("penawaran dagang") || title.includes("ekspor")) {
    return "perdagangan";
  }
  if (type === "usulan_resolusi_pbb" || title.includes("resolusi") || title.includes("pbb") || title.includes("pakta") || title.includes("kedutaan")) {
    return "geopolitik";
  }

  return "kebutuhan_pokok";
}

/**
 * Menjalankan siklus penanganan inbox/event untuk 1 negara AI.
 */
export function jalankanEventOrkestratorAI(ctx: BrainContext): AiEventDecision[] {
  // Ambil daftar notifikasi yang tersimpan di state negara atau ai_brain_state
  const rawNotifications: Array<Record<string, any>> = Array.isArray(ctx.country.notifications)
    ? ctx.country.notifications
    : Array.isArray(ctx.country.ai_inbox_events)
    ? ctx.country.ai_inbox_events
    : [];

  if (rawNotifications.length === 0) return [];

  const decisions: AiEventDecision[] = [];
  const unhandledEvents: Array<Record<string, any>> = [];

  for (const raw of rawNotifications) {
    if (raw.isHandled) continue;

    const eventId = String(raw.id || `event-${Date.now()}`);
    const category = klasifikasikanKategoriEvent(raw);
    const event: AiInboxEvent = {
      id: eventId,
      category,
      title: String(raw.title || "Notifikasi Masuk"),
      sender: raw.sender,
      date: raw.timestamp || ctx.date,
      rawType: raw.tradeType || raw.type,
      data: raw,
      isHandled: false,
    };

    let decision: AiEventDecision | null = null;

    switch (category) {
      case "bencana":
        decision = handleDisasterEvent(ctx, event);
        break;
      case "keamanan":
        decision = handleSecurityEvent(ctx, event);
        break;
      case "pertahanan":
        decision = handleDefenseEvent(ctx, event);
        break;
      case "perdagangan":
        decision = handleTradeEvent(ctx, event);
        break;
      case "geopolitik":
        decision = handleGeopoliticsEvent(ctx, event);
        break;
      default:
        decision = {
          handled: true,
          category,
          eventId,
          actionTaken: "BACA_NOTIFIKASI",
          alasan: `Mencatat notifikasi berkala: ${event.title}.`,
        };
        break;
    }

    if (decision) {
      raw.isHandled = decision.handled;
      decisions.push(decision);
    }

    if (!raw.isHandled) {
      unhandledEvents.push(raw);
    }
  }

  // Simpan kembali daftar event aktif yang belum selesai ditangani
  ctx.country.ai_inbox_events = unhandledEvents;

  return decisions;
}
