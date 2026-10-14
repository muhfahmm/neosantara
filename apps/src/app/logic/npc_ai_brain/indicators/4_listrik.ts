/**
 * 4_listrik.ts — Otak indikator PRODUKSI LISTRIK.
 * Skor listrik harus SELALU hijau → PREVENTIF: tambah pembangkit sebelum produksi < konsumsi + cadangan.
 * Pembangkit berbahan bakar hanya dibangun bila produksi bahan bakarnya cukup (cek neraca bahan bakar).
 */
import { getCountryConsumptionBreakdown } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/1_grid_nasional/consumptionLogic";
import {
  getElectricityFuelBalance,
  getKelistrikanFuelRequirements,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/1_kelistrikan/fuelLogic";
import { findBuildingMetadata } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";
import { getProductionBonusMultiplier } from "@/app/page/bonus_logic";
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
import { buatKandidat, cekSkorTurun, tingkatDariRasio } from "../core/alertFactory";
import { bangunLewatSektor, pasokBahanKurang } from "../sectors";
import {
  KELISTRIKAN_BERBAHAN_BAKAR,
  KELISTRIKAN_TANPA_BAHAN_BAKAR,
} from "../sectors/produksi/kelistrikan/kelistrikanSektor";

/** Cadangan: produksi minimal 110% konsumsi sebelum dianggap kekurangan. */
const BATAS_AMAN = 1.1;
const TARGET_PRODUKSI = 1.15;
const SEMUA_PEMBANGKIT = [...KELISTRIKAN_TANPA_BAHAN_BAKAR, ...KELISTRIKAN_BERBAHAN_BAKAR];

interface AnalisisListrik {
  produksi: number;
  konsumsi: number;
  rasio: number;
  /** bahan bakar yang neracanya negatif -> jumlah defisit */
  defisitBahanBakar: Record<string, number>;
}

function analisis(ctx: BrainContext): AnalisisListrik {
  if (ctx.cache.listrik) return ctx.cache.listrik as AnalisisListrik;
  const b = getCountryConsumptionBreakdown(ctx.country, ctx.metadata);
  const produksi = nilaiAngka(b.totalProductionMW);
  const konsumsi = nilaiAngka(b.totalAllBreakdownConsumption);

  const defisitBahanBakar: Record<string, number> = {};
  for (const plant of KELISTRIKAN_BERBAHAN_BAKAR) {
    if (nilaiAngka(ctx.country[plant]) <= 0) continue;
    for (const req of getKelistrikanFuelRequirements(plant)) {
      const saldo = getElectricityFuelBalance(ctx.country, req.resourceKey, ctx.metadata).balance;
      if (saldo < 0) defisitBahanBakar[req.resourceKey] = -saldo;
    }
  }

  const hasil = { produksi, konsumsi, rasio: konsumsi > 0 ? produksi / konsumsi : 99, defisitBahanBakar };
  ctx.cache.listrik = hasil;
  return hasil;
}

export function cekAlertListrik(ctx: BrainContext): AlertCandidate[] {
  const out: AlertCandidate[] = [];
  const skor = cekSkorTurun(ctx, "listrik", SEMUA_PEMBANGKIT, "Daya pembangkit tidak menutup beban konsumsi");
  if (skor) out.push(skor);

  const a = analisis(ctx);
  const tingkat = a.konsumsi > 0 ? tingkatDariRasio(a.rasio, BATAS_AMAN) : null;
  if (tingkat) {
    out.push(
      buatKandidat(ctx, "listrik", "KEKURANGAN", tingkat,
        `Produksi ${Math.round(a.produksi)} MW vs konsumsi ${Math.round(a.konsumsi)} MW (${Math.round(a.rasio * 100)}%, batas aman ${Math.round(BATAS_AMAN * 100)}%)`,
        SEMUA_PEMBANGKIT),
    );
  }
  const bahan = Object.keys(a.defisitBahanBakar);
  if (bahan.length > 0) {
    out.push(
      buatKandidat(ctx, "listrik", "KEKURANGAN", "TINGGI",
        `Bahan bakar pembangkit defisit: ${bahan.join(", ")}`, bahan),
    );
  }
  return out;
}

function unitMW(ctx: BrainContext, plantKey: string): number {
  const meta = findBuildingMetadata(ctx.metadata, plantKey);
  return nilaiAngka(meta?.produksi) * getProductionBonusMultiplier(ctx.country, plantKey);
}

/** Jumlah pembangkit berbahan bakar yang masih aman ditopang pasokan bahan bakar sekarang. */
function batasBahanBakar(ctx: BrainContext, plantKey: string): number {
  const reqs = getKelistrikanFuelRequirements(plantKey);
  if (reqs.length === 0) return Number.POSITIVE_INFINITY;
  let maks = Number.POSITIVE_INFINITY;
  for (const req of reqs) {
    const saldo = getElectricityFuelBalance(ctx.country, req.resourceKey, ctx.metadata).balance;
    maks = Math.min(maks, Math.floor(Math.max(0, saldo) / Math.max(1, req.amount)));
  }
  return maks;
}

export function otakListrik(ctx: BrainContext, alert: NpcAlert): BrainResult {
  if (!bolehBertindak(alert, true)) return TAHAN("Listrik waspada tapi skor tidak menurun — tahan");
  const a = analisis(ctx);
  const ringkas: string[] = [];
  const diubah: string[] = [];
  const bahanKurang = new Set<string>();

  // 1) Bahan bakar defisit → perluas tambang bahan bakarnya.
  for (const [bahan, defisit] of Object.entries(a.defisitBahanBakar)) {
    if (sedangCooldown(ctx, `bangun.${bahan}`)) continue;
    const meta = findBuildingMetadata(ctx.metadata, bahan);
    const perUnit = Math.max(0.0001, nilaiAngka(meta?.produksi) * getProductionBonusMultiplier(ctx.country, bahan));
    const butuh = Math.max(1, Math.ceil((defisit * 1.2) / perUnit));
    const batas = Math.max(5, Math.ceil(nilaiAngka(ctx.country[bahan]) * 0.25));
    const hasil = bangunLewatSektor(ctx, bahan, Math.min(butuh, batas));
    if (hasil.dibangun > 0) {
      setCooldown(ctx, `bangun.${bahan}`, COOLDOWN_BANGUN_HARI);
      diubah.push(bahan);
      ringkas.push(`+${hasil.dibangun} tambang ${bahan}`);
    } else {
      hasil.bahanKurang.forEach((b) => bahanKurang.add(b));
    }
  }

  // 2) Kekurangan daya → tambah pembangkit (tanpa bahan bakar lebih dulu).
  if (a.konsumsi > 0 && a.rasio < BATAS_AMAN) {
    const butuhMW = a.konsumsi * TARGET_PRODUKSI - a.produksi;
    for (const plant of SEMUA_PEMBANGKIT) {
      if (sedangCooldown(ctx, `bangun.${plant}`)) continue;
      const mw = unitMW(ctx, plant);
      if (mw <= 0) continue;
      const butuhUnit = Math.max(1, Math.ceil(butuhMW / mw));
      const batasStruktur = Math.max(5, Math.ceil(nilaiAngka(ctx.country[plant]) * 0.25));
      const batasBBM = batasBahanBakar(ctx, plant);
      const jumlah = Math.min(butuhUnit, batasStruktur, batasBBM);
      if (jumlah <= 0) continue; // bahan bakar belum mencukupi untuk pembangkit ini
      const hasil = bangunLewatSektor(ctx, plant, jumlah);
      if (hasil.dibangun > 0) {
        setCooldown(ctx, `bangun.${plant}`, COOLDOWN_BANGUN_HARI);
        diubah.push(plant);
        ringkas.push(`+${hasil.dibangun} ${plant.replace("pembangkit_listrik_tenaga_", "PLT ")}`);
        break; // satu jenis pembangkit per tick; sisa kebutuhan ditangani tick berikutnya
      }
      hasil.bahanKurang.forEach((b) => bahanKurang.add(b));
    }
  }

  if (diubah.length > 0) {
    return { diubah: true, ringkasan: `Bangun preventif: ${ringkas.join(", ")}`, variabelDiubah: diubah };
  }
  if (bahanKurang.size > 0) {
    const alasan = `bahan/anggaran kurang: ${Array.from(bahanKurang).join(", ")}`;
    const pasok = pasokBahanKurang(ctx, Array.from(bahanKurang));
    if (pasok) return { diubah: true, ringkasan: `Bahan pembangunan kurang → ${pasok}`, variabelDiubah: ["pasok_bahan"], terblokir: alasan };
    return TAHAN("Tidak membangun pembangkit: bahan tidak cukup", alasan);
  }
  return TAHAN("Tidak ada pembangkit yang bisa/perlu dibangun sekarang (cooldown/bahan bakar)");
}

export const OTAK_LISTRIK: IndikatorOtak = { id: "listrik", cek: cekAlertListrik, otak: otakListrik };
