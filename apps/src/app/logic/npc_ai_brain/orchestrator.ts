/**
 * orchestrator.ts
 * Orkestrator utama otak AI negara NPC.
 * Dipanggil pada tiap tick simulasi untuk setiap negara selain pemain.
 *
 * Alur:
 * 1. Hitung skor 9 indikator dari data negara + metadata.
 * 2. Cek kandidat alert dari ke-9 file indikator.
 * 3. Sinkronkan alert ke state AI negara (status: aktif, ditangani, selesai).
 * 4. Urutkan alert: KETIDAKCOCOKAN -> KEKURANGAN preventif -> KRITIS -> TINGGI -> SEDANG.
 * 5. Panggil file otak indikator yang sesuai untuk mengambil keputusan (ubah / tahan).
 * 6. Update status alert menjadi "ditangani" atau "selesai" bila skor >= 66.
 * 7. Simpan state otak AI ke dalam country.ai_brain_state.
 */

import { calculateSatisfactionIndicatorScores } from "@/app/logic/kepuasanCalculator";
import type {
  IndikatorId,
  NpcAiBrainState,
  AlertCandidate,
} from "./types/alertTypes";
import { buatStateKosong, BATAS_HIJAU } from "./types/alertTypes";
import type { BrainContext, BrainResult } from "./core/brainContext";
import { sinkronkanAlert, urutkanAlertUntukDitangani } from "./core/alertStore";
import { SEMUA_OTAK_INDIKATOR, MAP_OTAK_INDIKATOR } from "./indicators";
import {
  prosesPembangunanSipil,
  type CivilianConstructionDecision,
} from "./civilian/civilianConstructionLogic";
import {
  jalankanKeputusanMiliter,
  type MilitaryDecision,
} from "./military/militaryOrchestrator";
import {
  jalankanKeputusanNuklirAI,
  type NuclearDecision,
} from "./military/nuclearControllerAI";
import {
  jalankanEventOrkestratorAI,
} from "./events/eventOrchestrator";
import type { AiEventDecision } from "./events/eventTypes";
import {
  buatBeritaPerubahanKebijakan,
  buatBeritaPembangunanIndikatorAI,
  buatBeritaEventAI,
  terbitkanBeritaAI,
} from "./core/aiNewsBridge";

export interface OrchestrationResult {
  negaraId: string;
  actionsTaken: Array<{
    indikator: IndikatorId;
    alertId: string;
    result: BrainResult;
  }>;
  alertsSummary: {
    aktif: number;
    ditangani: number;
    kritis: number;
    tinggi: number;
    sedang: number;
  };
  civilianDecision?: CivilianConstructionDecision;
  militaryDecision?: MilitaryDecision;
  nuclearDecision?: NuclearDecision;
  eventDecisions?: AiEventDecision[];
}

/**
 * Helper untuk menghitung skor terkini 9 indikator untuk sebuah negara.
 */
export function hitungSkorSemuaIndikator(
  country: Record<string, any>,
  metadata: Record<string, any>,
): Record<IndikatorId, number> {
  return calculateSatisfactionIndicatorScores(country, metadata);
}

/**
 * Eksekusi otak AI untuk 1 negara NPC pada tanggal tertentu.
 * Menghasilkan data negara yang sudah dimutasi jika ada keputusan perubahan.
 */
export function runNpcCountryBrain(
  country: Record<string, any>,
  metadata: Record<string, any>,
  date: string,
): { updatedCountry: Record<string, any>; result: OrchestrationResult } {
  const negaraId = String(country.country_slug || country.slug || country.country || "npc");
  const negaraNama = String(
    country.name_id || country.nama_negara || country.country || country.country_name || negaraId,
  );

  // Ambil atau buat state otak AI
  let brainState: NpcAiBrainState = country.ai_brain_state
    ? (country.ai_brain_state as NpcAiBrainState)
    : buatStateKosong();

  // Pastikan struktur state valid
  if (!brainState.alerts) brainState.alerts = [];
  if (!brainState.prevScores) brainState.prevScores = {};
  if (!brainState.cooldowns) brainState.cooldowns = {};
  if (!brainState.blokir) brainState.blokir = {};
  if (!brainState.abaikan) brainState.abaikan = [];

  // Hitung skor 9 indikator saat ini
  const scores = hitungSkorSemuaIndikator(country, metadata);

  // Buat konteks eksekusi
  const ctx: BrainContext = {
    country: { ...country },
    metadata,
    date,
    negaraId,
    negaraNama,
    scores,
    prevScores: brainState.prevScores,
    state: brainState,
    cache: {},
  };

  // 1. Kumpulkan semua kandidat alert dari ke-9 indikator
  const allCandidates: AlertCandidate[] = [];
  for (const indikator of SEMUA_OTAK_INDIKATOR) {
    try {
      const candidates = indikator.cek(ctx);
      if (candidates && candidates.length > 0) {
        allCandidates.push(...candidates);
      }
    } catch (err) {
      console.warn(`[AI Brain] Error saat cek alert ${indikator.id} untuk ${negaraNama}:`, err);
    }
  }

  // 2. Sinkronkan dengan store alert (tanpa duplikat, auto status "selesai" bila skor >= 66)
  sinkronkanAlert(brainState, {
    negaraId,
    date,
    candidates: allCandidates,
    scores,
    prevScores: brainState.prevScores,
  });

  // 3. Urutkan alert yang perlu ditangani: KETIDAKCOCOKAN -> KEKURANGAN preventif -> KRITIS -> TINGGI -> SEDANG
  const antrianAlert = urutkanAlertUntukDitangani(brainState.alerts);

  const actionsTaken: OrchestrationResult["actionsTaken"] = [];

  // 4. Eksekusi otak indikator terkait
  for (const alert of antrianAlert) {
    // Jika skor sudah pulih kembali ke hijau, tandai selesai
    if (ctx.scores[alert.indikator] >= BATAS_HIJAU) {
      alert.status = "selesai";
      delete brainState.blokir[alert.indikator];
      continue;
    }

    const otakIndikator = MAP_OTAK_INDIKATOR[alert.indikator];
    if (!otakIndikator) continue;

    try {
      const queueBefore = Array.isArray(ctx.country.ai_civilian_construction_queue)
        ? new Set(
            (ctx.country.ai_civilian_construction_queue as Array<{ id?: string }>)
              .map((item) => item.id)
              .filter((id): id is string => Boolean(id)),
          )
        : new Set<string>();
      const hasil = otakIndikator.otak(ctx, alert);

      if (hasil.diubah) {
        alert.status = "ditangani";
        delete brainState.blokir[alert.indikator];

        // Terbitkan berita perubahan kebijakan indikator ke Berita & Update Geopolitik
        const queueAfter = Array.isArray(ctx.country.ai_civilian_construction_queue)
          ? ctx.country.ai_civilian_construction_queue as Array<{
              id?: string;
              buildingKey?: string;
              jumlah?: number;
              completionDate?: string;
            }>
          : [];
        const newConstruction = queueAfter.find((item) => item.id && !queueBefore.has(item.id));
        if (newConstruction?.buildingKey) {
          const previousPending = queueAfter
            .filter((item) => item.buildingKey === newConstruction.buildingKey && item.id !== newConstruction.id)
            .reduce((total, item) => total + Number(item.jumlah || 0), 0);
          terbitkanBeritaAI(
            buatBeritaPembangunanIndikatorAI(
              negaraNama,
              newConstruction.buildingKey,
              Number(newConstruction.jumlah || 0),
              date,
              newConstruction.completionDate || date,
              Number(ctx.country[newConstruction.buildingKey] || 0) + previousPending,
              String(ctx.country.country_slug || ""),
            ),
          );
        } else {
          const beritaKebijakan = buatBeritaPerubahanKebijakan(
            negaraNama,
            alert.indikator,
            hasil.ringkasan || `Penyesuaian indikator ${alert.indikator}`,
            date,
            String(ctx.country.country_slug || ""),
          );
          terbitkanBeritaAI(beritaKebijakan);
        }
      } else if (hasil.terblokir) {
        brainState.blokir[alert.indikator] = hasil.terblokir;
      }

      actionsTaken.push({
        indikator: alert.indikator,
        alertId: alert.id,
        result: hasil,
      });
    } catch (err) {
      console.error(`[AI Brain] Error eksekusi otak ${alert.indikator} untuk ${negaraNama}:`, err);
    }
  }

  // 5. PENANGANAN EVENT & NOTIFIKASI INBOX AI (Bencana, Keamanan, Pertahanan, Perdagangan, Geopolitik)
  let eventDecisions: AiEventDecision[] = [];
  try {
    eventDecisions = jalankanEventOrkestratorAI(ctx);
    // Terbitkan berita event yang ditangani AI jika berdampak
    for (const ev of eventDecisions) {
      if (ev.handled && ev.actionTaken !== "BACA_NOTIFIKASI" && ev.actionTaken !== "LEWATI") {
        const catMap = ev.category === "pertahanan" ? "pencapaian_militer" : "ekonomi_keuangan";
        terbitkanBeritaAI(buatBeritaEventAI(negaraNama, ev.category.toUpperCase(), ev.alasan, catMap, date));
      }
    }
  } catch (err) {
    console.error(`[AI Brain] Error eksekusi event inbox untuk ${negaraNama}:`, err);
  }

  // 6. BAGIAN 3: Eksekusi Pembangunan Sipil (14 Sektor, 4 Syarat, Queue Waktu Pembangunan)
  let civilianDecision: CivilianConstructionDecision | undefined;
  try {
    civilianDecision = prosesPembangunanSipil(ctx);
  } catch (err) {
    console.error(`[AI Brain] Error eksekusi pembangunan sipil untuk ${negaraNama}:`, err);
  }

  // 7. BAGIAN 4: Eksekusi Pembangunan & Rekrutmen Militer Cerdas
  let militaryDecision: MilitaryDecision | undefined;
  try {
    militaryDecision = jalankanKeputusanMiliter(ctx);
  } catch (err) {
    console.error(`[AI Brain] Error eksekusi militer untuk ${negaraNama}:`, err);
  }

  // 8. BAGIAN 5: Eksekusi Program Nuklir & Rudal ICBM Cerdas
  let nuclearDecision: NuclearDecision | undefined;
  try {
    nuclearDecision = jalankanKeputusanNuklirAI(ctx);
  } catch (err) {
    console.error(`[AI Brain] Error eksekusi nuklir untuk ${negaraNama}:`, err);
  }

  // Re-read the final country snapshot so AI scores match what the dashboard renders.
  const finalScores = hitungSkorSemuaIndikator(ctx.country, metadata);
  for (const alert of brainState.alerts) {
    alert.skorSekarang = finalScores[alert.indikator];
    if (alert.status !== "selesai" && alert.skorSekarang >= BATAS_HIJAU) {
      alert.status = "selesai";
      delete brainState.blokir[alert.indikator];
    }
  }

  // Simpan skor akhir setelah seluruh tindakan AI sebagai pembanding tick berikutnya.
  brainState.prevScores = { ...finalScores };
  brainState.lastRunDate = date;

  // Pasang state otak kembali ke country
  ctx.country.ai_brain_state = brainState;

  // Hitung ringkasan alert
  const aktifList = brainState.alerts.filter((a) => a.status === "aktif");
  const ditanganiList = brainState.alerts.filter((a) => a.status === "ditangani");

  const alertsSummary = {
    aktif: aktifList.length,
    ditangani: ditanganiList.length,
    kritis: brainState.alerts.filter((a) => a.status !== "selesai" && a.tingkat === "KRITIS").length,
    tinggi: brainState.alerts.filter((a) => a.status !== "selesai" && a.tingkat === "TINGGI").length,
    sedang: brainState.alerts.filter((a) => a.status !== "selesai" && a.tingkat === "SEDANG").length,
  };

  return {
    updatedCountry: ctx.country,
    result: {
      negaraId,
      actionsTaken,
      alertsSummary,
      civilianDecision,
      militaryDecision,
      eventDecisions,
    },
  };
}
