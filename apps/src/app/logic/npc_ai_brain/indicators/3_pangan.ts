/**
 * 3_pangan.ts — Otak indikator PRODUKSI PANGAN.
 * Skor pangan harus SELALU hijau → AI PREVENTIF: membangun fasilitas produksi sebelum defisit,
 * tidak menunggu skor turun. Komoditas olahan yang macet karena bahan baku → bangun bahan bakunya.
 */
import {
  FOOD_CONSUMPTION_PER_CAPITA,
  RAW_MATERIAL_DEFAULT_PROD,
  calculateConsumption,
  calculateProduction,
  findMeta,
  getFoodIngredientsRequirements,
  isFoodRawMaterialDeficit,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic";
import { getProductionBonusMultiplier } from "@/app/page/bonus_logic";
import { isBuildingAvailable } from "@/app/logic/fisheries_production_logic/countryLandscapeLogic";
import type { AlertCandidate, NpcAlert } from "../types/alertTypes";
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
import { COOLDOWN_BANGUN_HARI } from "../types/alertTypes";
import { bangunLewatSektor, pasokBahanKurang } from "../sectors";

/** Batas aman: produksi minimal 115% dari konsumsi sebelum dianggap kekurangan. */
const BATAS_AMAN = 1.15;
/** Target saat membangun: 125% dari konsumsi (ada ruang bila populasi tumbuh). */
const TARGET_PRODUKSI = 1.25;
const MAKS_KOMODITAS_PER_TICK = 3;
const PABRIK_PENGOLAH = ["gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu", "beras"];

interface AnalisisKomoditas {
  key: string;
  konsumsi: number;
  produksi: number;
  rasio: number;
}

interface AnalisisPangan {
  kekurangan: AnalisisKomoditas[];
  /** komoditas yang punya bangunan padahal tidak tersedia (flag sumber daya/laut) */
  tidakSesuaiFlag: string[];
}

const KEY_PANGAN = Object.keys(FOOD_CONSUMPTION_PER_CAPITA).filter((k) => k !== "garam");

function populasi(ctx: BrainContext): number {
  return nilaiAngka(ctx.country.jumlah_penduduk ?? ctx.country.population);
}

function tersedia(ctx: BrainContext, key: string): boolean {
  try {
    return isBuildingAvailable(key, ctx.negaraNama, null);
  } catch {
    return true;
  }
}

function analisis(ctx: BrainContext): AnalisisPangan {
  if (ctx.cache.pangan) return ctx.cache.pangan as AnalisisPangan;
  const pop = populasi(ctx);
  const hasil: AnalisisPangan = { kekurangan: [], tidakSesuaiFlag: [] };
  if (pop > 0) {
    for (const key of KEY_PANGAN) {
      if (ctx.state.abaikan.includes(key)) continue;
      if (!tersedia(ctx, key)) {
        if (nilaiAngka(ctx.country[key]) > 0) hasil.tidakSesuaiFlag.push(key);
        continue;
      }
      const meta = findMeta(key, ctx.metadata);
      if (!meta?.produksi && !RAW_MATERIAL_DEFAULT_PROD[key]) continue;
      const konsumsi = calculateConsumption(pop, FOOD_CONSUMPTION_PER_CAPITA[key]);
      if (konsumsi <= 0) continue;
      const produksi = calculateProduction(key, ctx.country, ctx.metadata);
      const rasio = produksi / konsumsi;
      if (rasio < BATAS_AMAN) hasil.kekurangan.push({ key, konsumsi, produksi, rasio });
    }
    hasil.kekurangan.sort((a, b) => a.rasio - b.rasio);
  }
  ctx.cache.pangan = hasil;
  return hasil;
}

export function cekAlertPangan(ctx: BrainContext): AlertCandidate[] {
  const out: AlertCandidate[] = [];
  const skor = cekSkorTurun(ctx, "pangan", KEY_PANGAN, "Skor produksi pangan turun");
  if (skor) out.push(skor);

  const a = analisis(ctx);
  if (a.tidakSesuaiFlag.length > 0) {
    out.push(
      buatKandidat(ctx, "pangan", "KETIDAKCOCOKAN", "SEDANG",
        `Produksi tidak sesuai flag sumber daya: ${a.tidakSesuaiFlag.join(", ")}`,
        a.tidakSesuaiFlag),
    );
  }
  if (a.kekurangan.length > 0) {
    const terburuk = a.kekurangan[0];
    const tingkat = tingkatDariRasio(terburuk.rasio, BATAS_AMAN);
    if (tingkat) {
      const daftar = a.kekurangan
        .slice(0, 3)
        .map((k) => `${k.key} (${Math.round(k.rasio * 100)}%)`)
        .join(", ");
      out.push(
        buatKandidat(ctx, "pangan", "KEKURANGAN", tingkat,
          `Pangan di bawah batas aman ${Math.round(BATAS_AMAN * 100)}%: ${daftar}`,
          a.kekurangan.map((k) => k.key)),
      );
    }
  }
  return out;
}

/** Saldo bahan baku mentah: produksi kotor − konsumsi penduduk − konsumsi pabrik pengolah. */
function kebutuhanBahanBaku(ctx: BrainContext, rawKey: string): { permintaan: number; produksiKotor: number } {
  const pop = populasi(ctx);
  const meta = findMeta(rawKey, ctx.metadata);
  const dasar = nilaiAngka(meta?.produksi) || RAW_MATERIAL_DEFAULT_PROD[rawKey] || 0;
  const produksiKotor = dasar * nilaiAngka(ctx.country[rawKey]) * getProductionBonusMultiplier(ctx.country, rawKey);
  let permintaan = FOOD_CONSUMPTION_PER_CAPITA[rawKey] !== undefined
    ? calculateConsumption(pop, FOOD_CONSUMPTION_PER_CAPITA[rawKey])
    : 0;
  for (const pabrik of PABRIK_PENGOLAH) {
    const bahan = getFoodIngredientsRequirements(pabrik, ctx.metadata).find((b) => b.key === rawKey);
    if (bahan) permintaan += nilaiAngka(ctx.country[pabrik]) * nilaiAngka(bahan.amount);
  }
  return { permintaan, produksiKotor };
}

function produksiPerUnit(ctx: BrainContext, key: string): number {
  const meta = findMeta(key, ctx.metadata);
  const dasar = nilaiAngka(meta?.produksi) || RAW_MATERIAL_DEFAULT_PROD[key] || 1;
  return Math.max(0.0001, dasar * getProductionBonusMultiplier(ctx.country, key));
}

/** Tentukan apa yang harus dibangun & jumlahnya untuk satu komoditas yang kekurangan. */
function tentukanTarget(ctx: BrainContext, item: AnalisisKomoditas): { key: string; jumlah: number } {
  // Olahan macet karena bahan baku → bangun bahan bakunya dulu.
  if (isFoodRawMaterialDeficit(item.key, ctx.country, ctx.metadata)) {
    for (const bahan of getFoodIngredientsRequirements(item.key, ctx.metadata)) {
      const { permintaan, produksiKotor } = kebutuhanBahanBaku(ctx, bahan.key);
      if (nilaiAngka(ctx.country[bahan.key]) <= 0 || produksiKotor < permintaan) {
        const butuh = permintaan * TARGET_PRODUKSI - produksiKotor;
        return { key: bahan.key, jumlah: Math.max(1, Math.ceil(butuh / produksiPerUnit(ctx, bahan.key))) };
      }
    }
  }
  const butuh = item.konsumsi * TARGET_PRODUKSI - item.produksi;
  return { key: item.key, jumlah: Math.max(1, Math.ceil(butuh / produksiPerUnit(ctx, item.key))) };
}

export function otakPangan(ctx: BrainContext, alert: NpcAlert): BrainResult {
  const a = analisis(ctx);

  // 1) Ketidakcocokan dulu: kecualikan komoditas yang tak sesuai flag dari target kecukupan.
  if (alert.jenis === "KETIDAKCOCOKAN") {
    if (a.tidakSesuaiFlag.length === 0) return TAHAN("Tidak ada ketidakcocokan pangan");
    for (const key of a.tidakSesuaiFlag) {
      if (!ctx.state.abaikan.includes(key)) ctx.state.abaikan.push(key);
    }
    delete ctx.cache.pangan;
    return {
      diubah: true,
      ringkasan: `Komoditas ${a.tidakSesuaiFlag.join(", ")} dikeluarkan dari target kecukupan (tidak sesuai flag)`,
      variabelDiubah: a.tidakSesuaiFlag.map((k) => `abaikan:${k}`),
    };
  }

  // 2) Preventif: KEKURANGAN langsung membangun tanpa menunggu skor turun.
  if (!bolehBertindak(alert, true)) return TAHAN("Pangan waspada tapi skor tidak menurun — tahan");
  if (a.kekurangan.length === 0) return TAHAN("Tidak ada komoditas di bawah batas aman");

  const ringkas: string[] = [];
  const diubah: string[] = [];
  const bahanKurang = new Set<string>();
  let diproses = 0;

  for (const item of a.kekurangan) {
    if (diproses >= MAKS_KOMODITAS_PER_TICK) break;
    const target = tentukanTarget(ctx, item);
    if (sedangCooldown(ctx, `bangun.${target.key}`)) continue;
    diproses += 1;

    const sudahAda = nilaiAngka(ctx.country[target.key]);
    const batas = Math.max(10, Math.ceil(sudahAda * 0.25));
    const hasil = bangunLewatSektor(ctx, target.key, Math.min(target.jumlah, batas));
    if (hasil.dibangun > 0) {
      setCooldown(ctx, `bangun.${target.key}`, COOLDOWN_BANGUN_HARI);
      diubah.push(target.key);
      ringkas.push(`+${hasil.dibangun} ${target.key}`);
    } else {
      hasil.bahanKurang.forEach((b) => bahanKurang.add(b));
    }
  }

  if (diubah.length > 0) {
    return { diubah: true, ringkasan: `Bangun preventif: ${ringkas.join(", ")}`, variabelDiubah: diubah };
  }

  if (bahanKurang.size > 0) {
    const pasok = pasokBahanKurang(ctx, Array.from(bahanKurang));
    const alasan = `bahan/anggaran kurang: ${Array.from(bahanKurang).join(", ")}`;
    if (pasok) return { diubah: true, ringkasan: `Bahan pembangunan kurang → ${pasok}`, variabelDiubah: ["pasok_bahan"], terblokir: alasan };
    return TAHAN("Tidak membangun: bahan tidak cukup", alasan);
  }
  return TAHAN("Pembangunan pangan masih cooldown");
}

export const OTAK_PANGAN: IndikatorOtak = { id: "pangan", cek: cekAlertPangan, otak: otakPangan };
