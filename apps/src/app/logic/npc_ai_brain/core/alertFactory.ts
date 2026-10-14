/**
 * alertFactory.ts
 * Pembuat kandidat alert (dipakai file pengecek tiap indikator).
 */
import type { AlertCandidate, IndikatorId, JenisAlert, TingkatAlert } from "../types/alertTypes";
import { tingkatDariSkor } from "../types/alertTypes";
import type { BrainContext } from "./brainContext";

/** Alert SKOR_TURUN standar berdasarkan spektrum skor. Null bila tidak perlu alert. */
export function cekSkorTurun(
  ctx: BrainContext,
  indikator: IndikatorId,
  variabelYangBisaDiubah: string[],
  penyebab: string,
): AlertCandidate | null {
  const skor = ctx.scores[indikator];
  const tingkat = tingkatDariSkor(skor, ctx.prevScores[indikator]);
  if (!tingkat) return null;
  return {
    indikator,
    jenis: "SKOR_TURUN",
    tingkat,
    skorSekarang: skor,
    penyebab: `${penyebab} (skor ${skor}%)`,
    variabelYangBisaDiubah,
  };
}

export function buatKandidat(
  ctx: BrainContext,
  indikator: IndikatorId,
  jenis: JenisAlert,
  tingkat: TingkatAlert,
  penyebab: string,
  variabelYangBisaDiubah: string[],
): AlertCandidate {
  return {
    indikator,
    jenis,
    tingkat,
    skorSekarang: ctx.scores[indikator],
    penyebab,
    variabelYangBisaDiubah,
  };
}

/** Rasio kecukupan -> tingkat alert KEKURANGAN. */
export function tingkatDariRasio(rasio: number, batasAman: number): TingkatAlert | null {
  if (rasio >= batasAman) return null;
  if (rasio < 0.5) return "KRITIS";
  if (rasio < 0.85) return "TINGGI";
  return "SEDANG";
}
