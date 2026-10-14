/**
 * geopoliticsEventLogic.ts
 *
 * Menangani respon negara AI terhadap event Geopolitik & Sidang PBB (Inbox: 5_notifikasi_geopolitik):
 * 1. Merespons usulan Resolusi PBB (Larangan Perang, Embargo Ekonomi, Larangan Produksi, Invasi).
 * 2. Memberikan suara (Vote: Setuju / Tolak / Abstain) berdasarkan:
 *    - Hubungan diplomatik dengan negara pengusul vs negara target.
 *    - Dampak resolusi terhadap kepentingan ekonomi nasional AI itu sendiri.
 * 3. Merespons tawaran Pakta Non-Agresi (NAP) & Aliansi Pertahanan Bersama.
 */

import type { BrainContext } from "../core/brainContext";
import type { AiInboxEvent, AiEventDecision } from "./eventTypes";

export function handleGeopoliticsEvent(
  ctx: BrainContext,
  event: AiInboxEvent,
): AiEventDecision {
  const tradeType = event.data.tradeType || event.rawType;
  const proposer = event.data.proposerCountry || event.sender || "";
  const target = event.data.targetCountry || "";
  const resolutionType = event.data.resolutionType;

  // Respon terhadap Usulan Resolusi PBB
  if (tradeType === "usulan_resolusi_pbb" || resolutionType) {
    const isTargetingUs = target.toLowerCase() === ctx.negaraNama.toLowerCase() || target.toLowerCase() === ctx.negaraId.toLowerCase();

    // Jika resolusi merugikan kita sendiri -> Pasti TOLAK keras
    if (isTargetingUs) {
      return {
        handled: true,
        category: "geopolitik",
        eventId: event.id,
        actionTaken: "VOTE_TOLAK_PBB",
        alasan: `Menolak usulan resolusi PBB (${resolutionType}) yang menargetkan negara kita sendiri secara langsung.`,
        dampak: { vote: "tolak", resolutionType, target },
      };
    }

    // Jika resolusi embargo terhadap negara lain: evaluasi hubungan
    const skorHubunganTarget = Number(event.data.relationScore || 50);

    // Jika hubungan dengan target buruk (< 30) -> SETUJU
    if (skorHubunganTarget < 30) {
      return {
        handled: true,
        category: "geopolitik",
        eventId: event.id,
        actionTaken: "VOTE_SETUJU_PBB",
        alasan: `Mendukung resolusi PBB (${resolutionType}) terhadap ${target} demi stabilitas kawasan internasional.`,
        dampak: { vote: "setuju", resolutionType, target },
      };
    }

    // Hubungan netral atau baik -> ABSTAIN agar tidak memicu ketegangan bilateral
    return {
      handled: true,
      category: "geopolitik",
      eventId: event.id,
      actionTaken: "VOTE_ABSTAIN_PBB",
      alasan: `Memilih abstain dalam pemungutan suara resolusi PBB (${resolutionType}) terhadap ${target} guna menjaga netralitas diplomatik.`,
      dampak: { vote: "abstain", resolutionType, target },
    };
  }

  // Respon terhadap tawaran Pakta Non-Agresi / Aliansi
  if (tradeType === "pakta_non_agresi" || tradeType === "aliansi_pertahanan") {
    return {
      handled: true,
      category: "geopolitik",
      eventId: event.id,
      actionTaken: "TERIMA_PAKTA_DIPLOMATIK",
      alasan: `Menerima inisiatif diplomatik ${event.title} bersama ${proposer} untuk memperkuat keamanan bilateral.`,
      dampak: { partner: proposer, status: "aktif" },
    };
  }

  return {
    handled: true,
    category: "geopolitik",
    eventId: event.id,
    actionTaken: "MONITORING_DIPLOMASI",
    alasan: `Mencatat nota diplomatik ${event.title} ke dalam arsip kementerian luar negeri.`,
  };
}
