/**
 * 5_hunian.ts — Otak indikator HUNIAN PERMUKIMAN.
 * Skor = kapasitas hunian / populasi. Variabel yang diubah = jumlah bangunan hunian
 * (dipilih yang paling murah per jiwa dan yang bahannya tersedia).
 */
import { findBuildingMetadata } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";
import type { AlertCandidate, NpcAlert } from "../types/alertTypes";
import { COOLDOWN_BANGUN_HARI } from "../types/alertTypes";
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
import { biayaBangunan } from "../core/sectorBuilder";
import { bangunLewatSektor, pasokBahanKurang } from "../sectors";
import { KAPASITAS_HUNIAN_DEFAULT, SEKTOR_PERUMAHAN } from "../sectors/lainnya/perumahan/perumahanSektor";

const TARGET_KAPASITAS = 1.02;

function kapasitasPerUnit(ctx: BrainContext, key: string): number {
  const meta = findBuildingMetadata(ctx.metadata, key);
  return nilaiAngka(meta?.kapasitas) || KAPASITAS_HUNIAN_DEFAULT[key] || 0;
}

export function cekAlertHunian(ctx: BrainContext): AlertCandidate[] {
  const c = cekSkorTurun(ctx, "hunian", SEKTOR_PERUMAHAN.keys, "Kapasitas hunian tidak menampung seluruh penduduk");
  return c ? [c] : [];
}

export function otakHunian(ctx: BrainContext, alert: NpcAlert): BrainResult {
  if (!bolehBertindak(alert)) return TAHAN("Hunian waspada tapi skor tidak menurun — tahan");

  const populasi = nilaiAngka(ctx.country.jumlah_penduduk ?? ctx.country.population);
  if (populasi <= 0) return TAHAN("Populasi tidak diketahui");

  let kapasitasTotal = 0;
  for (const key of SEKTOR_PERUMAHAN.keys) {
    kapasitasTotal += nilaiAngka(ctx.country[key]) * kapasitasPerUnit(ctx, key);
  }
  const butuhKapasitas = populasi * TARGET_KAPASITAS - kapasitasTotal;
  if (butuhKapasitas <= 0) return TAHAN("Kapasitas hunian sudah mencukupi");

  // Urutkan: biaya per jiwa termurah lebih dulu.
  const kandidat = SEKTOR_PERUMAHAN.keys
    .map((key) => {
      const kap = kapasitasPerUnit(ctx, key);
      const biaya = biayaBangunan(ctx, key);
      return { key, kap, biayaPerJiwa: kap > 0 ? biaya / kap : Number.POSITIVE_INFINITY };
    })
    .filter((k) => k.kap > 0)
    .sort((a, b) => a.biayaPerJiwa - b.biayaPerJiwa);

  const bahanKurang = new Set<string>();
  for (const k of kandidat) {
    if (sedangCooldown(ctx, `bangun.${k.key}`)) continue;
    const butuhUnit = Math.max(1, Math.ceil(butuhKapasitas / k.kap));
    const batas = Math.max(10, Math.ceil(nilaiAngka(ctx.country[k.key]) * 0.2));
    const hasil = bangunLewatSektor(ctx, k.key, Math.min(butuhUnit, batas));
    if (hasil.dibangun > 0) {
      setCooldown(ctx, `bangun.${k.key}`, COOLDOWN_BANGUN_HARI);
      return { diubah: true, ringkasan: `Bangun +${hasil.dibangun} ${k.key}`, variabelDiubah: [k.key] };
    }
    hasil.bahanKurang.forEach((b) => bahanKurang.add(b));
  }

  if (bahanKurang.size > 0) {
    const alasan = `bahan/anggaran kurang: ${Array.from(bahanKurang).join(", ")}`;
    const pasok = pasokBahanKurang(ctx, Array.from(bahanKurang));
    if (pasok) return { diubah: true, ringkasan: `Bahan hunian kurang → ${pasok}`, variabelDiubah: ["pasok_bahan"], terblokir: alasan };
    return TAHAN("Tidak membangun hunian: bahan tidak cukup", alasan);
  }
  return TAHAN("Pembangunan hunian masih cooldown");
}

export const OTAK_HUNIAN: IndikatorOtak = { id: "hunian", cek: cekAlertHunian, otak: otakHunian };
