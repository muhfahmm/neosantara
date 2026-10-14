/**
 * 6_layanan_publik.ts — Otak indikator LAYANAN PUBLIK & TEMPAT UMUM.
 * Skor = rata-rata pemenuhan 6 kategori (Infrastruktur, Pendidikan, Kesehatan, Penegakan Hukum,
 * Olahraga & Hiburan, Komersial). Variabel yang diubah = jumlah fasilitas pada kategori
 * dengan pemenuhan TERENDAH, memakai fasilitas termurah yang bahannya tersedia.
 */
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
import { biayaBangunan, type SektorBangunan } from "../core/sectorBuilder";
import { pasokBahanKurang } from "../sectors";
import { SEKTOR_INFRASTRUKTUR, TARGET_RASIO_INFRASTRUKTUR } from "../sectors/layanan/infrastruktur/infrastrukturSektor";
import { SEKTOR_PENDIDIKAN, TARGET_RASIO_PENDIDIKAN } from "../sectors/layanan/pendidikan/pendidikanSektor";
import { SEKTOR_KESEHATAN, TARGET_RASIO_KESEHATAN } from "../sectors/layanan/kesehatan/kesehatanSektor";
import { SEKTOR_PENEGAKAN_HUKUM, TARGET_RASIO_PENEGAKAN_HUKUM } from "../sectors/layanan/penegakan_hukum/penegakanHukumSektor";
import { SEKTOR_OLAHRAGA_HIBURAN, TARGET_RASIO_OLAHRAGA_HIBURAN } from "../sectors/layanan/olahraga_hiburan/olahragaHiburanSektor";
import { SEKTOR_KOMERSIAL, TARGET_RASIO_KOMERSIAL } from "../sectors/layanan/komersial/komersialSektor";

interface KategoriLayanan {
  sektor: SektorBangunan;
  targetRasio: number;
}

const KATEGORI: KategoriLayanan[] = [
  { sektor: SEKTOR_INFRASTRUKTUR, targetRasio: TARGET_RASIO_INFRASTRUKTUR },
  { sektor: SEKTOR_PENDIDIKAN, targetRasio: TARGET_RASIO_PENDIDIKAN },
  { sektor: SEKTOR_KESEHATAN, targetRasio: TARGET_RASIO_KESEHATAN },
  { sektor: SEKTOR_PENEGAKAN_HUKUM, targetRasio: TARGET_RASIO_PENEGAKAN_HUKUM },
  { sektor: SEKTOR_OLAHRAGA_HIBURAN, targetRasio: TARGET_RASIO_OLAHRAGA_HIBURAN },
  { sektor: SEKTOR_KOMERSIAL, targetRasio: TARGET_RASIO_KOMERSIAL },
];

/** Berapa kategori terendah yang digarap per aksi, menurut tingkat alert. */
const JUMLAH_KATEGORI: Record<string, number> = { KRITIS: 3, TINGGI: 2, SEDANG: 1 };

export function cekAlertLayananPublik(ctx: BrainContext): AlertCandidate[] {
  const c = cekSkorTurun(
    ctx,
    "layananPublik",
    KATEGORI.flatMap((k) => k.sektor.keys),
    "Fasilitas publik belum memenuhi kebutuhan penduduk",
  );
  return c ? [c] : [];
}

function pemenuhan(ctx: BrainContext, kat: KategoriLayanan, populasi: number) {
  const total = kat.sektor.keys.reduce((s, k) => s + nilaiAngka(ctx.country[k]), 0);
  const targetUnit = kat.targetRasio * populasi;
  return { total, targetUnit, persen: targetUnit > 0 ? Math.min(100, (total / targetUnit) * 100) : 100 };
}

export function otakLayananPublik(ctx: BrainContext, alert: NpcAlert): BrainResult {
  if (!bolehBertindak(alert)) return TAHAN("Layanan publik waspada tapi skor tidak menurun — tahan");
  const populasi = nilaiAngka(ctx.country.jumlah_penduduk);
  if (populasi <= 0) return TAHAN("Populasi tidak diketahui");

  const urut = KATEGORI.map((kat) => ({ kat, ...pemenuhan(ctx, kat, populasi) }))
    .filter((k) => k.persen < 100)
    .sort((a, b) => a.persen - b.persen)
    .slice(0, JUMLAH_KATEGORI[alert.tingkat]);

  if (urut.length === 0) return TAHAN("Semua kategori layanan sudah memenuhi target");

  const ringkas: string[] = [];
  const diubah: string[] = [];
  const bahanKurang = new Set<string>();

  for (const item of urut) {
    const butuhUnit = Math.max(1, Math.ceil(item.targetUnit - item.total));
    const batas = Math.max(5, Math.ceil(item.total * 0.25));
    const jumlahDiminta = Math.min(butuhUnit, batas);

    // Fasilitas termurah lebih dulu.
    const keyUrut = [...item.kat.sektor.keys].sort((a, b) => biayaBangunan(ctx, a) - biayaBangunan(ctx, b));
    for (const key of keyUrut) {
      if (sedangCooldown(ctx, `bangun.${key}`)) continue;
      const hasil = item.kat.sektor.bangun(ctx, key, jumlahDiminta);
      if (hasil.dibangun > 0) {
        setCooldown(ctx, `bangun.${key}`, COOLDOWN_BANGUN_HARI);
        diubah.push(key);
        ringkas.push(`+${hasil.dibangun} ${key} (${item.kat.sektor.label})`);
        break;
      }
      hasil.bahanKurang.forEach((b) => bahanKurang.add(b));
    }
  }

  if (diubah.length > 0) {
    return { diubah: true, ringkasan: `Bangun fasilitas: ${ringkas.join(", ")}`, variabelDiubah: diubah };
  }
  if (bahanKurang.size > 0) {
    const alasan = `bahan/anggaran kurang: ${Array.from(bahanKurang).join(", ")}`;
    const pasok = pasokBahanKurang(ctx, Array.from(bahanKurang));
    if (pasok) return { diubah: true, ringkasan: `Bahan fasilitas kurang → ${pasok}`, variabelDiubah: ["pasok_bahan"], terblokir: alasan };
    return TAHAN("Tidak membangun fasilitas: bahan tidak cukup", alasan);
  }
  return TAHAN("Pembangunan fasilitas publik masih cooldown");
}

export const OTAK_LAYANAN_PUBLIK: IndikatorOtak = {
  id: "layananPublik",
  cek: cekAlertLayananPublik,
  otak: otakLayananPublik,
};
