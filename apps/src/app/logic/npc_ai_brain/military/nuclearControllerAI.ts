/**
 * nuclearControllerAI.ts
 *
 * Otak AI Negara NPC untuk Pengembangan Program Nuklir dan Rudal ICBM Cerdas.
 *
 * KETENTUAN LOGIKA:
 * 1. Kas negara AI harus cukup untuk pengembangan.
 * 2. Negara AI harus memiliki tambang uranium minimal 1.
 * 3. Jika 2 syarat di atas terpenuhi, negara AI dapat mengembangkan Program Nuklir,
 *    lalu setelah aktif dapat membangun rudal ICBM.
 * 4. Bila negara AI berhasil mengembangkan rudal ICBM (jumlah > 0), otomatis masuk
 *    ke jajaran negara pemilik ICBM di database & tabel status.
 * 5. Menggunakan parameter biaya yang dinamis (mengikuti metadata/config harga user,
 *    dengan fallback standar: Program Nuklir 2.500 NEO, ICBM 25.000 NEO per unit & 1 uranium).
 */

import type { BrainContext } from "../core/brainContext";
import { nilaiAngka, sedangCooldown, setCooldown, tambahHari } from "../core/brainContext";
import { findBuildingMetadata } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";
import {
  buatBeritaProgramNuklirAI,
  buatBeritaIcbmAI,
  terbitkanBeritaAI,
} from "../core/aiNewsBridge";

export interface PendingNuclearTask {
  type: "program_nuklir" | "icbm";
  quantity: number;
  startDate: string;
  completionDate: string;
  daysRemaining: number;
}

export interface NuclearDecision {
  tipe: "program_nuklir" | "bangun_icbm" | "tahan";
  alasan: string;
  biaya?: number;
  jumlah?: number;
}

/**
 * Daftar negara pemilik nuklir / ICBM default dunia (5 negara superpower/regional)
 * Selama tidak dikendalikan oleh player, negara-negara ini secara inheren sudah memiliki Program Nuklir aktif,
 * sehingga TIDAK PERLU dan TIDAK BOLEH memulai riset Program Nuklir dari awal lagi (hanya boleh menambah ICBM).
 */
export const DEFAULT_NUCLEAR_COUNTRIES = [
  "amerika_serikat",
  "rusia",
  "china",
  "korea_utara",
  "india",
];

export function isNegaraNuklirBawaan(countrySlug?: string, countryName?: string, iso?: string): boolean {
  const s = String(countrySlug || "").toLowerCase().trim();
  const n = String(countryName || "").toLowerCase().trim();
  const i = String(iso || "").toLowerCase().trim();

  // Pencocokan slug exact
  if (s && DEFAULT_NUCLEAR_COUNTRIES.includes(s)) return true;
  // Pencocokan ISO exact
  if (i && ["us", "ru", "cn", "kp", "in"].includes(i)) return true;

  // Pencocokan nama exact agar TIDAK mencocokkan "samoa amerika", "federasi mikronesia", dll
  const exactNames = [
    "amerika serikat",
    "united states",
    "usa",
    "rusia",
    "russia",
    "china",
    "tiongkok",
    "korea utara",
    "north korea",
    "india",
  ];
  if (exactNames.includes(n)) {
    return true;
  }

  return false;
}

/**
 * Mengambil harga biaya program nuklir secara dinamis
 * Mengikuti metadata jika ada, fallback ke 2.500 NEO (sesuai modal program nuklir).
 */
export function getBiayaProgramNuklirDinamis(metadata: Record<string, any>): number {
  const meta = findBuildingMetadata(metadata, "program_nuklir") || metadata?.program_nuklir;
  const cost = Number(meta?.biaya_pembangunan ?? meta?.biaya ?? meta?.cost);
  return Number.isFinite(cost) && cost > 0 ? cost : 2500;
}

/**
 * Mengambil durasi waktu pembangunan Program Nuklir secara dinamis
 * Mengikuti metadata jika ada, fallback ke 1 hari (sesuai standar modal user).
 */
export function getDurasiProgramNuklirDinamis(metadata: Record<string, any>): number {
  const meta = findBuildingMetadata(metadata, "program_nuklir") || metadata?.program_nuklir;
  const days = Number(meta?.waktu_pembangunan ?? meta?.durasi ?? meta?.duration);
  return Number.isFinite(days) && days > 0 ? Math.round(days) : 1;
}

/**
 * Mengambil harga biaya kas per unit ICBM secara dinamis
 * Mengikuti metadata jika ada, fallback ke 25.000 NEO (sesuai modal ICBM).
 */
export function getBiayaIcbmDinamis(metadata: Record<string, any>): number {
  const meta = findBuildingMetadata(metadata, "icbm") || metadata?.icbm;
  const cost = Number(meta?.biaya_pembangunan ?? meta?.biaya ?? meta?.cost);
  return Number.isFinite(cost) && cost > 0 ? cost : 25000;
}

/**
 * Mengambil durasi waktu pembangunan perakitan ICBM per unit secara dinamis
 * Mengikuti metadata jika ada, fallback ke 30 hari (sesuai standar modal user).
 */
export function getDurasiIcbmDinamis(metadata: Record<string, any>): number {
  const meta = findBuildingMetadata(metadata, "icbm") || metadata?.icbm;
  const days = Number(meta?.waktu_pembangunan ?? meta?.durasi ?? meta?.duration);
  return Number.isFinite(days) && days > 0 ? Math.round(days) : 30;
}

/**
 * Update antrean pembangunan Program Nuklir & ICBM negara AI
 */
function updateNuclearQueue(ctx: BrainContext): void {
  const queue: PendingNuclearTask[] = Array.isArray(ctx.country.ai_nuclear_queue)
    ? [...ctx.country.ai_nuclear_queue]
    : [];
  const remaining: PendingNuclearTask[] = [];

  for (const item of queue) {
    item.daysRemaining = Math.max(0, item.daysRemaining - 1);
    const isCompleted = item.daysRemaining <= 0 || (Boolean(item.completionDate) && item.completionDate <= ctx.date);
    if (!isCompleted) {
      remaining.push(item);
      continue;
    }

    // Task selesai
    if (item.type === "program_nuklir") {
      ctx.country.programNuklirActive = true;
      // Bersihkan task ongoing program nuklir
      if (Array.isArray(ctx.country.ongoingConstructions)) {
        ctx.country.ongoingConstructions = ctx.country.ongoingConstructions.filter(
          (c: any) => c.buildingKey !== "program_nuklir"
        );
      }

      // Siarkan berita pencapaian program nuklir beroperasi penuh
      terbitkanBeritaAI(
        buatBeritaProgramNuklirAI(
          ctx.negaraNama,
          "selesai",
          ctx.date,
          item.completionDate || ctx.date,
          String(ctx.country.country_slug || "")
        )
      );
    } else if (item.type === "icbm") {
      const currentIcbm = nilaiAngka(ctx.country.icbm_jumlah);
      const nextIcbm = currentIcbm + item.quantity;
      ctx.country.icbm_jumlah = nextIcbm;
      ctx.country.icbm_status = true;

      // Update state task ICBM
      if (ctx.country.icbmBuildTask) {
        ctx.country.icbmBuildTask = {
          ...ctx.country.icbmBuildTask,
          completed: true,
        };
      }

      // Siarkan berita pencapaian perolehan rudal ICBM siap tempur
      terbitkanBeritaAI(
        buatBeritaIcbmAI(
          ctx.negaraNama,
          "selesai",
          item.quantity,
          ctx.date,
          item.completionDate || ctx.date,
          String(ctx.country.country_slug || "")
        )
      );
    }
  }

  // Jika program nuklir sudah aktif, pastikan task program_nuklir tidak tersisa di ongoingConstructions
  if (ctx.country.programNuklirActive && Array.isArray(ctx.country.ongoingConstructions)) {
    ctx.country.ongoingConstructions = ctx.country.ongoingConstructions.filter(
      (c: any) => c.buildingKey !== "program_nuklir"
    );
  }

  ctx.country.ai_nuclear_queue = remaining;
}

/**
 * Eksekutor keputusan Otak AI Nuklir
 */
export function jalankanKeputusanNuklirAI(ctx: BrainContext): NuclearDecision {
  // 1. Update progres antrean nuklir & ICBM harian
  updateNuclearQueue(ctx);

  // Jika sedang ada proyek nuklir yang berjalan, tunggu sampai selesai
  const queue: PendingNuclearTask[] = Array.isArray(ctx.country.ai_nuclear_queue)
    ? ctx.country.ai_nuclear_queue
    : [];
  if (queue.length > 0) {
    return {
      tipe: "tahan",
      alasan: `Sedang dalam proses pengembangan ${queue[0].type} (${queue[0].daysRemaining} hari tersisa).`,
    };
  }

  // 2. Cooldown bulanan agar AI tidak menguras kas bertubi-tubi
  if (sedangCooldown(ctx, "ai_nuclear_evaluation")) {
    return {
      tipe: "tahan",
      alasan: "Negara AI dalam masa jeda evaluasi strategis nuklir.",
    };
  }

  // 3. Cek Syarat 2: Kepemilikan Tambang Uranium minimal 1 atau SDA Uranium
  const uraniumMines = nilaiAngka(ctx.country.uranium);
  const hasUraniumSda = Boolean(ctx.country.sda?.uranium);
  if (uraniumMines < 1 && !hasUraniumSda) {
    return {
      tipe: "tahan",
      alasan: "Negara AI belum memiliki tambang atau potensi SDA uranium.",
    };
  }

  const currentKas = nilaiAngka(ctx.country.anggaran);

  // Jika negara merupakan 5 negara pemilik nuklir default (AS, Rusia, China, Korut, India),
  // pastikan program nuklir selalu aktif dan tidak pernah memulai riset program nuklir dari awal!
  const isDefaultNuclear = isNegaraNuklirBawaan(
    String(ctx.country.country_slug || ""),
    ctx.negaraNama,
    String(ctx.country.iso || "")
  );
  if (isDefaultNuclear) {
    ctx.country.programNuklirActive = true;
  }

  const isProgramActive = Boolean(ctx.country.programNuklirActive);

  // =========================================================================
  // TAHAP A: PENGEMBANGAN PROGRAM NUKLIR (Jika belum aktif)
  // Catatan: Negara default nuklir dunia sudah inheren aktif dan tidak masuk ke sini
  // =========================================================================
  if (!isProgramActive && !isDefaultNuclear) {
    const biayaProgram = getBiayaProgramNuklirDinamis(ctx.metadata);

    // Syarat 1: Kas negara AI harus cukup (menyisakan cadangan kas minimum 2.000 NEO agar tidak bangkrut)
    const cadanganKasMinimum = 2000;
    if (currentKas < biayaProgram + cadanganKasMinimum) {
      return {
        tipe: "tahan",
        alasan: `Kas negara AI (${currentKas.toLocaleString("id-ID")} NEO) belum cukup untuk biaya Program Nuklir (${biayaProgram.toLocaleString("id-ID")} NEO + cadangan).`,
      };
    }

    // Probabilitas geopolitik: tidak semua negara AI langsung memulai riset nuklir serentak (15% per evaluasi)
    if (Math.random() > 0.15) {
      setCooldown(ctx, "ai_nuclear_evaluation", 14);
      return {
        tipe: "tahan",
        alasan: `Negara AI ${ctx.negaraNama} belum memprioritaskan alokasi doktrin nuklir saat ini.`,
      };
    }

    // Eksekusi aktivasi program nuklir
    ctx.country.anggaran = currentKas - biayaProgram;
    const durasiHari = getDurasiProgramNuklirDinamis(ctx.metadata); // Dinamis mengikuti standar modal user (1 hari jika default)
    const completionDate = tambahHari(ctx.date, durasiHari);

    const newTask: PendingNuclearTask = {
      type: "program_nuklir",
      quantity: 1,
      startDate: ctx.date,
      completionDate,
      daysRemaining: durasiHari,
    };
    ctx.country.ai_nuclear_queue = [newTask];

    // Sinkronkan ke ongoingConstructions jika ada sistem observer
    const ongoing = Array.isArray(ctx.country.ongoingConstructions)
      ? [...ctx.country.ongoingConstructions]
      : [];
    ongoing.push({
      id: Date.now() + Math.random(),
      buildingKey: "program_nuklir",
      startDate: ctx.date,
      endDate: completionDate,
    });
    ctx.country.ongoingConstructions = ongoing;

    setCooldown(ctx, "ai_nuclear_evaluation", 60);

    // Siarkan berita geopolitik: AI memulai pengembangan Program Nuklir
    terbitkanBeritaAI(
      buatBeritaProgramNuklirAI(
        ctx.negaraNama,
        "dimulai",
        ctx.date,
        completionDate,
        String(ctx.country.country_slug || "")
      )
    );

    return {
      tipe: "program_nuklir",
      biaya: biayaProgram,
      alasan: `Negara AI ${ctx.negaraNama} memulai riset Program Nuklir Strategis (biaya: ${biayaProgram.toLocaleString("id-ID")} NEO).`,
    };
  }

  // =========================================================================
  // TAHAP B: PENGEMBANGAN RUDAL ICBM (Program nuklir sudah aktif & syarat 1-3 terpenuhi)
  // Aturan: Jika negara AI sudah memiliki Program Nuklir, peluang membangun ICBM adalah 20%
  // =========================================================================
  const icbmBuildChance = Math.random();
  if (icbmBuildChance > 0.2) {
    // 80% kemungkinan AI menahan diri pada evaluasi ini, evaluasi ulang dalam 7 hari
    setCooldown(ctx, "ai_nuclear_evaluation", 7);
    return {
      tipe: "tahan",
      alasan: `Negara AI ${ctx.negaraNama} memutuskan belum mengalokasikan prioritas perakitan ICBM pada periode ini (probabilitas 20%).`,
    };
  }

  const biayaIcbmPerUnit = getBiayaIcbmDinamis(ctx.metadata);
  const uraniumCostPerUnit = 1;
  const stokUranium = Math.max(
    nilaiAngka(ctx.country.inventory_uranium),
    uraniumMines > 0 ? uraniumMines * 10 : 0
  );

  // Cek apakah stok uranium cukup untuk 1 unit rudal ICBM
  if (stokUranium < uraniumCostPerUnit) {
    setCooldown(ctx, "ai_nuclear_evaluation", 14);
    return {
      tipe: "tahan",
      alasan: `Stok uranium negara AI (${stokUranium}) belum mencukupi untuk memproduksi ICBM (butuh ${uraniumCostPerUnit}).`,
    };
  }

  // Cek kecukupan kas untuk 1 unit ICBM
  const cadanganKasMiliter = 2000;
  if (currentKas < biayaIcbmPerUnit + cadanganKasMiliter) {
    setCooldown(ctx, "ai_nuclear_evaluation", 14);
    return {
      tipe: "tahan",
      alasan: `Kas negara AI (${currentKas.toLocaleString("id-ID")} NEO) belum cukup untuk produksi ICBM (${biayaIcbmPerUnit.toLocaleString("id-ID")} NEO + cadangan).`,
    };
  }

  // Produksi 1 hingga 5 unit ICBM secara cerdas tergantung kelimpahan kas AI
  let kuantitas = 1;
  if (currentKas >= (biayaIcbmPerUnit * 5) + cadanganKasMiliter && stokUranium >= 5) {
    kuantitas = 5;
  } else if (currentKas >= (biayaIcbmPerUnit * 2) + cadanganKasMiliter && stokUranium >= 2) {
    kuantitas = 2;
  }

  const totalBiayaKas = biayaIcbmPerUnit * kuantitas;
  const totalUranium = uraniumCostPerUnit * kuantitas;
  const durasiPerUnit = getDurasiIcbmDinamis(ctx.metadata); // Dinamis mengikuti standar modal user (30 hari/unit)
  const totalDurasi = durasiPerUnit * kuantitas;
  const completionDate = tambahHari(ctx.date, totalDurasi);

  // Potong kas dan uranium
  ctx.country.anggaran = Math.max(0, currentKas - totalBiayaKas);
  if (ctx.country.inventory_uranium !== undefined) {
    ctx.country.inventory_uranium = Math.max(0, nilaiAngka(ctx.country.inventory_uranium) - totalUranium);
  }

  const newIcbmTask: PendingNuclearTask = {
    type: "icbm",
    quantity: kuantitas,
    startDate: ctx.date,
    completionDate,
    daysRemaining: totalDurasi,
  };
  ctx.country.ai_nuclear_queue = [newIcbmTask];

  // Catat task format standar untuk kompatibilitas UI
  ctx.country.icbmBuildTask = {
    quantity: kuantitas,
    startDate: ctx.date,
    endDate: completionDate,
  };

  setCooldown(ctx, "ai_nuclear_evaluation", 14);

  // Siarkan berita geopolitik: AI memulai perakitan Rudal ICBM
  terbitkanBeritaAI(
    buatBeritaIcbmAI(
      ctx.negaraNama,
      "dimulai",
      kuantitas,
      ctx.date,
      completionDate,
      String(ctx.country.country_slug || "")
    )
  );

  return {
    tipe: "bangun_icbm",
    jumlah: kuantitas,
    biaya: totalBiayaKas,
    alasan: `Negara AI ${ctx.negaraNama} memulai perakitan ${kuantitas} unit Rudal ICBM Strategis (biaya: ${totalBiayaKas.toLocaleString("id-ID")} NEO, durasi: ${totalDurasi} hari).`,
  };
}
