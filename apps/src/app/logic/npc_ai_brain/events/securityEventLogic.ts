/**
 * securityEventLogic.ts
 *
 * Menangani respon negara AI terhadap event Insiden Keamanan & Kriminalitas (Inbox: 14_notifikasi_keamanan):
 * 1. Mengecek tingkat resiko keamanan (securityRiskPercent) dan korban kejahatan.
 * 2. Mengalokasikan dana respon kepolisian/operasi penegakan hukum (responseCost).
 * 3. Mempercepat tindakan penanganan agar kriminalitas tidak menjatuhkan kepuasan masyarakat.
 */

import type { BrainContext } from "../core/brainContext";
import { nilaiAngka } from "../core/brainContext";
import type { AiInboxEvent, AiEventDecision } from "./eventTypes";

export function handleSecurityEvent(
  ctx: BrainContext,
  event: AiInboxEvent,
): AiEventDecision {
  const responseCost = Number(event.data.responseCost || 25000);
  const securityRisk = Number(event.data.securityRiskPercent || 30);
  const kasSekarang = nilaiAngka(ctx.country.anggaran);

  // Jika resiko keamanan tinggi (> 20%) dan kas cukup, lakukan respon taktis kepolisian
  if (kasSekarang > responseCost + 30000) {
    ctx.country.anggaran = kasSekarang - responseCost;

    return {
      handled: true,
      category: "keamanan",
      eventId: event.id,
      actionTaken: "OPERASI_PENERTIBAN",
      biayaDikeluarkan: responseCost,
      alasan: `Mengerahkan operasi kepolisian untuk meredam ${event.title} (resiko: ${securityRisk}%) dengan biaya respon ${responseCost.toLocaleString()} NEO.`,
      dampak: { responseCost, statusKeamanan: "terkendali" },
    };
  }

  return {
    handled: false,
    category: "keamanan",
    eventId: event.id,
    actionTaken: "PATROLI_RUTIN",
    biayaDikeluarkan: 0,
    alasan: `Anggaran tidak mencukupi untuk operasi khusus insiden ${event.title}. Memaksimalkan aparat patroli reguler yang ada.`,
  };
}
