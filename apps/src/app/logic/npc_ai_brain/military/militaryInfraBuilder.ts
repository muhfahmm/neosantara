/**
 * militaryInfraBuilder.ts
 *
 * Logika pembangunan infrastruktur militer:
 * - Barak Militer
 * - Gudang Senjata
 * - Hangar Tank
 * - Pangkalan Udara
 * - Pangkalan Laut
 *
 * Aturan:
 * 1. Dibangun jika sisa kapasitas < 10% (atau kapasitas penuh) sebelum merekrut/memproduksi unit.
 * 2. Cek uang (anggaran) & Netto APBN tidak boleh negatif.
 * 3. Cek ketersediaan material konstruksi militer (semen, bijih besi, kayu, batu bara).
 * 4. Mendukung waktu pembangunan (masuk ke antrian jika belum selesai).
 */

import { findBuildingMetadata, getMaterialStock, deductBuildingMaterials } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";
import { calculateNetBalanceWithEconomicEmbargo } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic";
import type { BrainContext } from "../core/brainContext";
import { nilaiAngka, sedangCooldown, setCooldown, tambahHari } from "../core/brainContext";
import type { MilitaryInfraKey } from "./militaryCapacity";
import {
  buatBeritaEkspansiMiliter,
  terbitkanBeritaAI,
} from "../core/aiNewsBridge";

import { REQUIREMENTS as BARAK_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/construction_support/1_barak_militer/requirements";
import { REQUIREMENTS as HANGAR_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/construction_support/2_hangar_tank/requirements";
import { REQUIREMENTS as GUDANG_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/construction_support/3_gudang_senjata/requirements";
import { REQUIREMENTS as LAUT_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/construction_support/4_pangkalan_laut/requirements";
import { REQUIREMENTS as UDARA_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/construction_support/5_pangkalan_udara/requirements";

export interface PendingMilitaryInfra {
  id: string;
  infraKey: MilitaryInfraKey;
  jumlah: number;
  startDate: string;
  completionDate: string;
  daysRemaining: number;
}

const MILITARY_INFRA_REQUIREMENTS: Record<MilitaryInfraKey, { resourceKey: string; amount: number }[]> = {
  barak: BARAK_REQS.find((r) => r.buildingKey === "barak")?.requirements || [],
  hangar_tank: HANGAR_REQS.find((r) => r.buildingKey === "hangar_tank")?.requirements || [],
  gudang_senjata: GUDANG_REQS.find((r) => r.buildingKey === "gudang_senjata")?.requirements || [],
  pangkalan_laut: LAUT_REQS.find((r) => r.buildingKey === "pangkalan_laut")?.requirements || [],
  pangkalan_udara: UDARA_REQS.find((r) => r.buildingKey === "pangkalan_udara")?.requirements || [],
};

const BIAYA_INFRA_MILITER: Record<MilitaryInfraKey, number> = {
  barak: 25000,
  gudang_senjata: 35000,
  hangar_tank: 40000,
  pangkalan_udara: 60000,
  pangkalan_laut: 75000,
};

const WAKTU_BANGUN_INFRA_MILITER: Record<MilitaryInfraKey, number> = {
  barak: 5,
  gudang_senjata: 6,
  hangar_tank: 7,
  pangkalan_udara: 10,
  pangkalan_laut: 12,
};

/**
 * Update antrian pembangunan infrastruktur militer tiap tick.
 */
export function updateMilitaryInfraQueue(ctx: BrainContext): void {
  const queue: PendingMilitaryInfra[] = Array.isArray(ctx.country.ai_military_infra_queue)
    ? [...ctx.country.ai_military_infra_queue]
    : [];

  if (queue.length === 0) return;

  const remaining: PendingMilitaryInfra[] = [];

  for (const item of queue) {
    item.daysRemaining = Math.max(0, item.daysRemaining - 1);
    if (item.daysRemaining <= 0) {
      const prev = nilaiAngka(ctx.country[item.infraKey]);
      ctx.country[item.infraKey] = prev + item.jumlah;
      if (prev <= 0) ctx.country[`build_date_${item.infraKey}`] = item.completionDate;
    } else {
      remaining.push(item);
    }
  }

  ctx.country.ai_military_infra_queue = remaining;
}

export function getPendingMilitaryInfraCount(ctx: BrainContext, infraKey: MilitaryInfraKey): number {
  const queue: PendingMilitaryInfra[] = Array.isArray(ctx.country.ai_military_infra_queue)
    ? ctx.country.ai_military_infra_queue
    : [];
  return queue
    .filter((q) => q.infraKey === infraKey)
    .reduce((sum, q) => sum + q.jumlah, 0);
}

/**
 * Cek syarat dan bangun infrastruktur militer.
 */
export function cobaBangunInfraMiliter(
  ctx: BrainContext,
  infraKey: MilitaryInfraKey,
  jumlah: number = 1,
): { sukses: boolean; alasan: string } {
  if (sedangCooldown(ctx, `infra_militer_${infraKey}`)) {
    return { sukses: false, alasan: `Infrastruktur ${infraKey} sedang cooldown.` };
  }

  // Jika sudah ada yang sedang dibangun dalam antrian, tunggu selesai
  if (getPendingMilitaryInfraCount(ctx, infraKey) > 0) {
    return { sukses: false, alasan: `${infraKey} sedang dalam proses pembangunan.` };
  }

  // Cek Kas & Netto APBN
  const biayaTotal = (BIAYA_INFRA_MILITER[infraKey] || 50000) * jumlah;
  const kas = nilaiAngka(ctx.country.anggaran);
  if (kas - biayaTotal < 100000) {
    return { sukses: false, alasan: `Kas tidak mencukupi untuk ekspansi ${infraKey} (biaya: ${biayaTotal}).` };
  }

  const netto = calculateNetBalanceWithEconomicEmbargo(ctx.country, ctx.negaraNama);
  if (netto < 0) {
    return { sukses: false, alasan: `Netto APBN defisit (${netto}), menahan ekspansi militer.` };
  }

  // Cek Material
  const reqs = MILITARY_INFRA_REQUIREMENTS[infraKey] || [];
  for (const r of reqs) {
    const butuh = r.amount * jumlah;
    const stok = getMaterialStock(ctx.country, r.resourceKey);
    if (stok < butuh) {
      return { sukses: false, alasan: `Material ${r.resourceKey} kurang untuk ${infraKey} (butuh: ${butuh}, ada: ${stok}).` };
    }
  }

  // Potong kas & kurangi stok
  ctx.country.anggaran = kas - biayaTotal;
  if (reqs.length > 0) {
    ctx.country = deductBuildingMaterials(ctx.country, reqs, jumlah);
  }

  // Masukkan antrian
  const queue: PendingMilitaryInfra[] = Array.isArray(ctx.country.ai_military_infra_queue)
    ? [...ctx.country.ai_military_infra_queue]
    : [];

  const infraMetadata = findBuildingMetadata(ctx.metadata, infraKey);
  const metadataWaktu = Number(
    infraMetadata?.waktu_pembangunan ?? infraMetadata?.waktu_pembangunan_armada_aktif,
  );
  const waktuHari = Math.max(1, Math.round(metadataWaktu || WAKTU_BANGUN_INFRA_MILITER[infraKey] || 7));
  const countFrom = nilaiAngka(ctx.country[infraKey]) + getPendingMilitaryInfraCount(ctx, infraKey);
  queue.push({
    id: `${infraKey}_${Date.now()}`,
    infraKey,
    jumlah,
    startDate: ctx.date,
    completionDate: tambahHari(ctx.date, waktuHari),
    daysRemaining: waktuHari,
  });

  ctx.country.ai_military_infra_queue = queue;
  setCooldown(ctx, `infra_militer_${infraKey}`, 30);
  setCooldown(ctx, "pembangunan_militer_negara", 30);

  // Terbitkan ke Berita & Update Geopolitik
  const berita = buatBeritaEkspansiMiliter(
    ctx.negaraNama,
    infraKey,
    jumlah,
    ctx.date,
    countFrom,
    tambahHari(ctx.date, waktuHari),
    String(ctx.country.country_slug || ""),
  );
  terbitkanBeritaAI(berita);

  return { sukses: true, alasan: `Berhasil memulai konstruksi ${jumlah} unit ${infraKey} (selesai dalam ${waktuHari} hari).` };
}
