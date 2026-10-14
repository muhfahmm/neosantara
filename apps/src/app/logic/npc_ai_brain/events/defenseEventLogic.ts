/**
 * defenseEventLogic.ts
 *
 * Menangani respon negara AI terhadap event Pertahanan, Sabotase, Spionase, dan Eskalasi Nuklir (Inbox: 2_notifikasi_pertahanan):
 * 1. Mendeteksi adanya agresi militer atau sabotase infrastruktur oleh pihak luar.
 * 2. Mengaktifkan mode kesiapsiagaan darurat pertahanan (Emergency Defense Posture).
 * 3. Menyiapkan alokasi pertahanan darurat jika negara diserang atau terancam.
 */

import type { BrainContext } from "../core/brainContext";
import { nilaiAngka, setCooldown } from "../core/brainContext";
import type { AiInboxEvent, AiEventDecision } from "./eventTypes";

export function handleDefenseEvent(
  ctx: BrainContext,
  event: AiInboxEvent,
): AiEventDecision {
  const aggressor = event.data.aggressorCountry || event.sender || "Asing";
  const rawType = event.rawType || event.data.tradeType || "pertahanan";

  if (rawType === "diserang" || rawType === "invasi") {
    // Mobilisasi militer darurat
    ctx.country.ai_defense_emergency_active = true;
    setCooldown(ctx, "darurat_pertahanan", 14);

    return {
      handled: true,
      category: "pertahanan",
      eventId: event.id,
      actionTaken: "MOBILISASI_DARURAT",
      alasan: `Negara sedang dalam serangan militer aktif dari ${aggressor}! Mengaktifkan mobilisasi darurat armada pertahanan dan menghentikan pengeluaran sipil non-esensial.`,
      dampak: { statusDarurat: true, lawan: aggressor },
    };
  }

  if (rawType === "sabotase" || rawType === "spionase") {
    // Tingkatkan keamanan kontra-intelijen
    const biayaPenyelidikan = 15000;
    if (nilaiAngka(ctx.country.anggaran) > biayaPenyelidikan + 50000) {
      ctx.country.anggaran = nilaiAngka(ctx.country.anggaran) - biayaPenyelidikan;
      return {
        handled: true,
        category: "pertahanan",
        eventId: event.id,
        actionTaken: "KONTRA_INTELIJEN",
        biayaDikeluarkan: biayaPenyelidikan,
        alasan: `Merespons aksi sabotase/spionase dengan memperketat jaringan kontra-intelijen dan penjagaan fasilitas vital.`,
      };
    }
  }

  return {
    handled: true,
    category: "pertahanan",
    eventId: event.id,
    actionTaken: "WASPADA_MILITER",
    alasan: `Mencatat perkembangan militer pada event ${event.title} dan meningkatkan level kesiapsiagaan pangkalan militer.`,
  };
}
