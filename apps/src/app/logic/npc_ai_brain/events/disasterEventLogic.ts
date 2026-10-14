/**
 * disasterEventLogic.ts
 *
 * Menangani respon negara AI terhadap event Bencana Alam & Wabah Penyakit (Inbox: 6_notifikasi_bencana):
 * 1. Menghitung biaya tanggap darurat (bantuan dana rekonstruksi & logistik medis).
 * 2. Mengalokasikan dana darurat jika kas negara mencukupi.
 * 3. Memprioritaskan perbaikan cepat sektor Kesehatan (Puskesmas/RS) & Hunian yang rusak.
 */

import type { BrainContext } from "../core/brainContext";
import { nilaiAngka } from "../core/brainContext";
import type { AiInboxEvent, AiEventDecision } from "./eventTypes";

export function handleDisasterEvent(
  ctx: BrainContext,
  event: AiInboxEvent,
): AiEventDecision {
  const kerugian = Number(event.data.totalKerugian || event.data.kerugian || 0);
  const korban = Number(event.data.korban || 0);
  const bantuanCost = Number(event.data.bantuanCost || korban * 10 || 50000);

  const kasSekarang = nilaiAngka(ctx.country.anggaran);

  // Jika kas mencukupi di atas batas aman cadangan
  if (kasSekarang > bantuanCost + 50000) {
    ctx.country.anggaran = kasSekarang - bantuanCost;

    // Tingkatkan skor pemulihan atau kurangi dampak kepuasan
    if (ctx.country.kesejahteraan !== undefined) {
      ctx.country.kesejahteraan = Math.max(10, Number(ctx.country.kesejahteraan) - Math.min(5, Math.ceil(korban / 1000)));
    }

    return {
      handled: true,
      category: "bencana",
      eventId: event.id,
      actionTaken: "KIRIM_DANA_DARURAT",
      biayaDikeluarkan: bantuanCost,
      alasan: `Merespons bencana ${event.title} dengan mengirim bantuan rekonstruksi sebesar ${bantuanCost.toLocaleString()} NEO untuk menolong ${korban.toLocaleString()} korban terdampak.`,
      dampak: { bantuanCost, korbanTolong: korban },
    };
  }

  return {
    handled: false,
    category: "bencana",
    eventId: event.id,
    actionTaken: "BANTUAN_TERBATAS",
    biayaDikeluarkan: 0,
    alasan: `Kas negara (${kasSekarang.toLocaleString()}) terlalu minim untuk bantuan penuh bencana ${event.title}. Menjalankan evakuasi dasar tanpa pembiayaan besar.`,
  };
}
