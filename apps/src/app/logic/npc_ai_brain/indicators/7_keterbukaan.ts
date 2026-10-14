/**
 * 7_keterbukaan.ts — Otak indikator DOKTRIN & KETERBUKAAN.
 * Skor = opennessIndex (rata-rata 9 skor doktrin). Variabel yang diubah = skor doktrin yang
 * paling rendah (lalu opennessIndex dihitung ulang agar dibaca skor kepuasan).
 */
import type { AlertCandidate, NpcAlert } from "../types/alertTypes";
import { COOLDOWN_HARI } from "../types/alertTypes";
import {
  type BrainContext,
  type BrainResult,
  type IndikatorOtak,
  TAHAN,
  bolehBertindak,
  nilaiAngka,
  sedangCooldown,
  setCooldown,
} from "../core/brainContext";
import { cekSkorTurun } from "../core/alertFactory";

/** Nilai bawaan sama dengan kepuasanCalculator bila data negara belum punya skor. */
const DOKTRIN_DEFAULT: Record<string, number> = {
  speechScore: 50,
  religionScore: 60,
  demoScore: 45,
  transparencyScore: 55,
  mediaScore: 50,
  internetScore: 60,
  borderScore: 40,
  tradeScore: 60,
  diplomacyScore: 55,
};
const LANGKAH: Record<string, number> = { KRITIS: 8, TINGGI: 5, SEDANG: 2 };
const JUMLAH_VARIABEL: Record<string, number> = { KRITIS: 3, TINGGI: 2, SEDANG: 1 };

export function cekAlertKeterbukaan(ctx: BrainContext): AlertCandidate[] {
  const c = cekSkorTurun(ctx, "keterbukaan", Object.keys(DOKTRIN_DEFAULT), "Indeks doktrin & keterbukaan rendah");
  return c ? [c] : [];
}

export function otakKeterbukaan(ctx: BrainContext, alert: NpcAlert): BrainResult {
  if (!bolehBertindak(alert)) return TAHAN("Keterbukaan waspada tapi skor tidak menurun — tahan");

  const nilai: Record<string, number> = {};
  for (const [key, def] of Object.entries(DOKTRIN_DEFAULT)) {
    nilai[key] = nilaiAngka(ctx.country[key], def);
  }

  const kandidat = Object.keys(nilai)
    .filter((k) => nilai[k] < 100 && !sedangCooldown(ctx, `doktrin.${k}`))
    .sort((a, b) => nilai[a] - nilai[b])
    .slice(0, JUMLAH_VARIABEL[alert.tingkat]);

  if (kandidat.length === 0) {
    return TAHAN("Semua variabel doktrin sudah maksimal / masih cooldown", "tidak ada variabel doktrin yang bisa dinaikkan");
  }

  const ringkas: string[] = [];
  for (const key of kandidat) {
    const lama = nilai[key];
    const baru = Math.min(100, lama + LANGKAH[alert.tingkat]);
    ctx.country[key] = baru;
    nilai[key] = baru;
    setCooldown(ctx, `doktrin.${key}`, COOLDOWN_HARI[alert.tingkat]);
    ringkas.push(`${key} ${lama}→${baru}`);
  }

  const rata = Math.round(Object.values(nilai).reduce((s, v) => s + v, 0) / Object.keys(nilai).length);
  ctx.country.opennessIndex = rata;

  return {
    diubah: true,
    ringkasan: `Naikkan doktrin: ${ringkas.join(", ")} (indeks ${rata})`,
    variabelDiubah: [...kandidat, "opennessIndex"],
  };
}

export const OTAK_KETERBUKAAN: IndikatorOtak = {
  id: "keterbukaan",
  cek: cekAlertKeterbukaan,
  otak: otakKeterbukaan,
};
