/**
 * militaryOrchestrator.ts
 *
 * BAGIAN 4: AI MEMBANGUN MILITER SECARA CERDAS
 *
 * Aturan Alur:
 * 1. Jangan membangun atau merekrut militer bila ada alert KRITIS di Pangan, Listrik, atau Layanan Publik.
 *    (Selesaikan dulu urusan sipil).
 * 2. Hitung sisa kapasitas tiap kategori: kapasitas - jumlah terpakai.
 * 3. Bila kapasitas hampir penuh (sisa < 10% atau 0):
 *    -> Bangun bangunan militer yang sesuai (Barak, Gudang Senjata, Hangar Tank, Pangkalan Udara, Pangkalan Laut) dulu.
 * 4. Bila kapasitas masih aman:
 *    -> Tambah unit (Darat, Laut, Udara) secara proporsional seimbang tanpa melebihi kapasitas (overload).
 * 5. Anggaran militer tidak boleh membuat Netto APBN negatif.
 *
 * Menghasilkan satu daftar keputusan: { bangun bangunan militer | tambah unit | tahan }.
 */

import type { BrainContext } from "../core/brainContext";
import { nilaiAngka, setCooldown, sedangCooldown, tambahHari } from "../core/brainContext";
import { findBuildingMetadata } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";
import {
  getSemuaKapasitasMiliter,
  MILITARY_INFRA_KEYS,
} from "./militaryCapacity";
import {
  updateMilitaryInfraQueue,
  cobaBangunInfraMiliter,
} from "./militaryInfraBuilder";
import { prosesRekrutmenDarat, type RecruitmentAction } from "./daratRecruitment";
import { prosesRekrutmenLaut } from "./lautRecruitment";
import { prosesRekrutmenUdara } from "./udaraRecruitment";
import { buatBeritaRekrutmenMiliter, terbitkanBeritaAI } from "../core/aiNewsBridge";

interface PendingMilitaryUnit {
  id: string;
  unitKey: string;
  category: "darat" | "laut" | "udara";
  jumlah: number;
  startDate: string;
  completionDate: string;
  daysRemaining: number;
}

function updateMilitaryUnitQueue(ctx: BrainContext): void {
  const queue: PendingMilitaryUnit[] = Array.isArray(ctx.country.ai_military_unit_queue)
    ? [...ctx.country.ai_military_unit_queue]
    : [];
  const remaining: PendingMilitaryUnit[] = [];

  for (const item of queue) {
    item.daysRemaining = Math.max(0, item.daysRemaining - 1);
    if (item.daysRemaining > 0) {
      remaining.push(item);
      continue;
    }

    const activeCount = Math.max(
      nilaiAngka(ctx.country[item.unitKey]),
      nilaiAngka(ctx.country.armada?.[item.category]?.[item.unitKey]),
    );
    const updatedCount = activeCount + item.jumlah;
    ctx.country[item.unitKey] = updatedCount;
    ctx.country.armada = {
      ...(ctx.country.armada || {}),
      [item.category]: {
        ...(ctx.country.armada?.[item.category] || {}),
        [item.unitKey]: updatedCount,
      },
    };
  }
  ctx.country.ai_military_unit_queue = remaining;
}

function getUnitCount(ctx: BrainContext, unitKey: string, category: "darat" | "laut" | "udara"): number {
  return Math.max(
    nilaiAngka(ctx.country[unitKey]),
    nilaiAngka(ctx.country.armada?.[category]?.[unitKey]),
  );
}

export interface MilitaryDecision {
  tipe: "bangun_infra" | "tambah_unit" | "tahan";
  targetKey?: string;
  jumlah?: number;
  alasan: string;
  kapasitasSummary?: Record<string, { total: number; used: number; sisa: number }>;
}

export function jalankanKeputusanMiliter(ctx: BrainContext): MilitaryDecision {
  // 1. Update antrian pembangunan infrastruktur militer yang sedang berlangsung
  updateMilitaryInfraQueue(ctx);
  updateMilitaryUnitQueue(ctx);

  // 2. Cek Cooldown bulanan (30 hari) militer per negara
  if (sedangCooldown(ctx, "pembangunan_militer_negara")) {
    return {
      tipe: "tahan",
      alasan: "Negara AI sedang dalam jeda bulanan antar ekspansi militer.",
    };
  }

  const pendingUnitQueue: PendingMilitaryUnit[] = Array.isArray(ctx.country.ai_military_unit_queue)
    ? ctx.country.ai_military_unit_queue
    : [];
  if (pendingUnitQueue.length > 0) {
    return {
      tipe: "tahan",
      alasan: "Pembuatan unit militer sebelumnya masih berlangsung.",
    };
  }

  // 3. Cek Alert KRITIS di urusan sipil: Pangan, Listrik, atau Layanan Publik
  const alerts = ctx.state.alerts || [];
  const adaKritisSipil = alerts.some(
    (a) =>
      a.tingkat === "KRITIS" &&
      a.status !== "selesai" &&
      (a.indikator === "pangan" || a.indikator === "listrik" || a.indikator === "layananPublik"),
  );

  if (adaKritisSipil) {
    return {
      tipe: "tahan",
      alasan: "AI menahan pengeluaran militer karena ada krisis sipil (Pangan / Listrik / Layanan Publik). Prioritaskan sipil.",
    };
  }

  // 3. Hitung status kapasitas kelima infrastruktur militer
  const kapasitas = getSemuaKapasitasMiliter(ctx.country);

  const kapasitasSummary: Record<string, { total: number; used: number; sisa: number }> = {};
  for (const [key, cap] of Object.entries(kapasitas)) {
    kapasitasSummary[key] = {
      total: cap.totalCapacity,
      used: cap.used,
      sisa: cap.remainingCapacity,
    };
  }

  // 4. Periksa apakah ada infrastruktur yang sisa kapasitasnya < 10% (atau 0) dan perlu diperluas dulu
  for (const infraKey of MILITARY_INFRA_KEYS) {
    const cap = kapasitas[infraKey];
    if (cap && (cap.persentaseSisa < 10 || cap.remainingCapacity <= 0 || cap.totalCapacity === 0)) {
      const cobaBangun = cobaBangunInfraMiliter(ctx, infraKey, 1);
      if (cobaBangun.sukses) {
        return {
          tipe: "bangun_infra",
          targetKey: infraKey,
          jumlah: 1,
          alasan: `Kapasitas ${cap.label} hampir penuh atau sisa < 10% (${cap.remainingCapacity}/${cap.totalCapacity}). Membangun 1 unit ${cap.label} terlebih dahulu.`,
          kapasitasSummary,
        };
      }
    }
  }

  // 5. Jika kapasitas masih aman (> 10%), tambah unit secara proporsional & seimbang (Darat -> Udara -> Laut)
  // Rotasi matra bergilir berdasarkan hari untuk menjaga keseimbangan
  const hariSekarang = new Date(ctx.date || "2026-01-01").getDate() % 3;

  let unitAction: RecruitmentAction | null = null;

  if (hariSekarang === 0) {
    unitAction = prosesRekrutmenDarat(ctx, kapasitas) || prosesRekrutmenUdara(ctx, kapasitas) || prosesRekrutmenLaut(ctx, kapasitas);
  } else if (hariSekarang === 1) {
    unitAction = prosesRekrutmenUdara(ctx, kapasitas) || prosesRekrutmenDarat(ctx, kapasitas) || prosesRekrutmenLaut(ctx, kapasitas);
  } else {
    unitAction = prosesRekrutmenLaut(ctx, kapasitas) || prosesRekrutmenUdara(ctx, kapasitas) || prosesRekrutmenDarat(ctx, kapasitas);
  }

  if (unitAction) {
    const currentCount = getUnitCount(ctx, unitAction.unitKey, unitAction.category);
    const unitMeta = findBuildingMetadata(ctx.metadata, unitAction.unitKey);
    const daysPerUnit = Math.max(
      1,
      Number(unitMeta?.waktu_pembangunan_armada_aktif) ||
        Number(unitMeta?.waktu_pembangunan) ||
        7,
    );
    const waktuHari = unitAction.unitKey === "pasukan_infanteri"
      ? Math.ceil(unitAction.jumlah / 10000) * daysPerUnit
      : Math.ceil(unitAction.jumlah * daysPerUnit);
    const completionDate = tambahHari(ctx.date, waktuHari);
    const unitQueue: PendingMilitaryUnit[] = Array.isArray(ctx.country.ai_military_unit_queue)
      ? [...ctx.country.ai_military_unit_queue]
      : [];
    unitQueue.push({
      id: `${unitAction.unitKey}_${Date.now()}`,
      unitKey: unitAction.unitKey,
      category: unitAction.category,
      jumlah: unitAction.jumlah,
      startDate: ctx.date,
      completionDate,
      daysRemaining: waktuHari,
    });
    ctx.country.ai_military_unit_queue = unitQueue;

    terbitkanBeritaAI(
      buatBeritaRekrutmenMiliter(
        ctx.negaraNama,
        unitAction.unitKey,
        unitAction.jumlah,
        unitAction.category,
        ctx.date,
        currentCount,
        completionDate,
        String(ctx.country.country_slug || ""),
      ),
    );

    // Pasang cooldown militer 30 hari (1 bulan) per negara agar tidak spam rekrutmen tiap hari
    setCooldown(ctx, "pembangunan_militer_negara", 30);

    return {
      tipe: "tambah_unit",
      targetKey: unitAction.unitKey,
      jumlah: unitAction.jumlah,
      alasan: unitAction.alasan,
      kapasitasSummary,
    };
  }

  return {
    tipe: "tahan",
    alasan: "Kapasitas militer stabil, kas negara dan pertahanan dalam kondisi seimbang.",
    kapasitasSummary,
  };
}
