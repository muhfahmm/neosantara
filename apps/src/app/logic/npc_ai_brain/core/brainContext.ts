/**
 * brainContext.ts
 * Konteks eksekusi otak AI untuk satu negara NPC pada satu tick, plus helper cooldown.
 * Hanya dipakai logika NPC — tidak menyentuh logika pemain.
 */
import type { AlertCandidate, IndikatorId, NpcAiBrainState, NpcAlert, TingkatAlert } from "../types/alertTypes";
import { COOLDOWN_HARI } from "../types/alertTypes";

export interface BrainContext {
  /** Salinan kerja data negara. Boleh dimutasi oleh file otak. */
  country: Record<string, any>;
  metadata: Record<string, any>;
  date: string;
  negaraId: string;
  negaraNama: string;
  scores: Record<IndikatorId, number>;
  prevScores: Partial<Record<IndikatorId, number>>;
  state: NpcAiBrainState;
  /** cache perhitungan mahal dalam satu tick */
  cache: Record<string, any>;
}

export interface BrainResult {
  /** true bila ada variabel yang benar-benar diubah */
  diubah: boolean;
  ringkasan: string;
  variabelDiubah: string[];
  /** bila terisi: aksi tertahan (bahan / anggaran / opsi tidak cukup) */
  terblokir?: string;
}

export const TAHAN = (ringkasan: string, terblokir?: string): BrainResult => ({
  diubah: false,
  ringkasan,
  variabelDiubah: [],
  terblokir,
});

/** Kontrak tiap file indikator: satu pengecek alert + satu otak keputusan. */
export interface IndikatorOtak {
  id: IndikatorId;
  cek: (ctx: BrainContext) => AlertCandidate[];
  otak: (ctx: BrainContext, alert: NpcAlert) => BrainResult;
}

export function tambahHari(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function sedangCooldown(ctx: BrainContext, variabel: string): boolean {
  const until = ctx.state.cooldowns[variabel];
  return Boolean(until) && ctx.date < until;
}

export function setCooldown(ctx: BrainContext, variabel: string, hari: number): void {
  ctx.state.cooldowns[variabel] = tambahHari(ctx.date, hari);
}

export function cooldownUntukTingkat(tingkat: TingkatAlert): number {
  return COOLDOWN_HARI[tingkat];
}

/**
 * Gerbang "ubah bertahap hanya bila skor menurun" untuk zona Waspada (41–65).
 * KRITIS/TINGGI selalu boleh bertindak. Alert KEKURANGAN pada Pangan/Listrik juga
 * tidak menunggu skor turun (preventif) — dikecualikan lewat parameter preventif.
 */
export function bolehBertindak(alert: NpcAlert, preventif = false): boolean {
  if (alert.tingkat !== "SEDANG") return true;
  if (preventif && alert.jenis === "KEKURANGAN") return true;
  return alert.skorSekarang < alert.skorSebelumnya;
}

export function nilaiAngka(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
