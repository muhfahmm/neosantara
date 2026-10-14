/**
 * 2_harga.ts — Otak indikator HARGA BARANG POKOK.
 * Skor naik bila harga turun (rentang 10.000–100.000), jadi variabel yang diubah = country.harga.harga_*.
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

const HARGA_MINIMUM = 10000;
const FAKTOR_TURUN: Record<string, number> = { KRITIS: 0.88, TINGGI: 0.93, SEDANG: 0.98 };

export function cekAlertHarga(ctx: BrainContext): AlertCandidate[] {
  const harga = ctx.country.harga;
  const variabel = harga && typeof harga === "object"
    ? Object.keys(harga).filter((k) => k.startsWith("harga_"))
    : ["harga"];
  const c = cekSkorTurun(ctx, "harga", variabel, "Harga barang pokok tidak terjangkau");
  return c ? [c] : [];
}

export function otakHarga(ctx: BrainContext, alert: NpcAlert): BrainResult {
  if (!bolehBertindak(alert)) return TAHAN("Harga waspada tapi skor tidak menurun — tahan");
  if (sedangCooldown(ctx, "harga.semua")) return TAHAN("Harga baru diubah — menunggu hasil (cooldown)");

  const harga = ctx.country.harga;
  if (!harga || typeof harga !== "object") {
    return TAHAN("Data harga tidak tersedia", "country.harga kosong");
  }

  const faktor = FAKTOR_TURUN[alert.tingkat];
  const baru: Record<string, any> = { ...harga };
  const diubah: string[] = [];

  for (const [key, value] of Object.entries(harga)) {
    if (!key.startsWith("harga_")) continue;
    const lama = nilaiAngka(value);
    if (lama <= HARGA_MINIMUM) continue; // jangan pernah menaikkan harga yang sudah murah
    const target = Math.max(HARGA_MINIMUM, Math.round(lama * faktor));
    if (target >= lama) continue;
    baru[key] = target;
    diubah.push(key);
  }

  if (diubah.length === 0) {
    return TAHAN("Semua harga pokok sudah di batas bawah", "harga sudah minimum");
  }
  ctx.country.harga = baru;
  setCooldown(ctx, "harga.semua", COOLDOWN_HARI[alert.tingkat]);
  return {
    diubah: true,
    ringkasan: `Turunkan ${diubah.length} harga pokok ×${faktor}`,
    variabelDiubah: diubah.map((k) => `harga.${k}`),
  };
}

export const OTAK_HARGA: IndikatorOtak = { id: "harga", cek: cekAlertHarga, otak: otakHarga };
