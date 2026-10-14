/**
 * 1_pajak.ts — Otak indikator PAJAK.
 * Skor Pajak naik bila beban tarif turun, jadi variabel yang diubah = tarif pajak langsung.
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

/** Kunci tarif flat -> kunci objek country.pajak (bila ada). */
const TARIF_PAJAK: Record<string, string> = {
  ppn: "ppn",
  corporate: "korporasi",
  income_tax: "penghasilan",
  cigarette_tax: "bea_cukai",
  environment_tax: "lingkungan",
};
const TARIF_MINIMUM = 5;
const LANGKAH: Record<string, number> = { KRITIS: 5, TINGGI: 3, SEDANG: 1 };

function bacaTarif(country: Record<string, any>, flatKey: string): number {
  const flat = nilaiAngka(country[flatKey]);
  if (flat > 0) return flat;
  return nilaiAngka(country.pajak?.[TARIF_PAJAK[flatKey]]?.tarif);
}

function tulisTarif(country: Record<string, any>, flatKey: string, nilai: number): void {
  country[flatKey] = nilai;
  const nested = country.pajak?.[TARIF_PAJAK[flatKey]];
  if (nested && typeof nested === "object") {
    country.pajak = { ...country.pajak, [TARIF_PAJAK[flatKey]]: { ...nested, tarif: nilai } };
  }
}

export function cekAlertPajak(ctx: BrainContext): AlertCandidate[] {
  const c = cekSkorTurun(ctx, "pajak", Object.keys(TARIF_PAJAK), "Beban tarif pajak terlalu berat bagi rakyat & usaha");
  return c ? [c] : [];
}

export function otakPajak(ctx: BrainContext, alert: NpcAlert): BrainResult {
  if (!bolehBertindak(alert)) return TAHAN("Pajak waspada tapi skor tidak menurun — tahan");

  const langkah = LANGKAH[alert.tingkat];
  const diubah: string[] = [];
  const ringkas: string[] = [];

  for (const key of Object.keys(TARIF_PAJAK)) {
    if (sedangCooldown(ctx, `pajak.${key}`)) continue;
    const lama = bacaTarif(ctx.country, key);
    if (lama <= TARIF_MINIMUM) continue;
    const baru = Math.max(TARIF_MINIMUM, lama - langkah);
    if (baru === lama) continue;
    tulisTarif(ctx.country, key, baru);
    setCooldown(ctx, `pajak.${key}`, COOLDOWN_HARI[alert.tingkat]);
    diubah.push(key);
    ringkas.push(`${key} ${lama}→${baru}`);
  }

  if (diubah.length === 0) {
    return TAHAN(
      "Tarif pajak tidak bisa diturunkan lagi / masih cooldown",
      "tarif pajak sudah di batas minimum atau cooldown",
    );
  }
  return { diubah: true, ringkasan: `Turunkan tarif: ${ringkas.join(", ")}`, variabelDiubah: diubah };
}

export const OTAK_PAJAK: IndikatorOtak = { id: "pajak", cek: cekAlertPajak, otak: otakPajak };
