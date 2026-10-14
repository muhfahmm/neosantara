/**
 * daratRecruitment.ts
 *
 * Logika perekrutan & produksi matra darat:
 * 1. Barak Militer -> Pasukan Infanteri
 * 2. Hangar Tank -> MBT (tank_tempur_utama), APC / IFV (apc_ifv)
 * 3. Gudang Senjata -> Artileri Berat, Peluncur Roket, Pertahanan Udara Mobile, Kendaraan Taktis
 *
 * Aturan:
 * - Hanya isi kategori yang sisa kapasitasnya > 0 (jangan overload).
 * - Jaga komposisi seimbang.
 * - Cek kas & tidak membuat Netto APBN negatif.
 */

import { calculateNetBalanceWithEconomicEmbargo } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic";
import type { BrainContext } from "../core/brainContext";
import { nilaiAngka } from "../core/brainContext";
import type { MilitaryCapacityStatus } from "./militaryCapacity";

export interface RecruitmentAction {
  unitKey: string;
  category: "darat" | "laut" | "udara";
  jumlah: number;
  biayaTotal: number;
  alasan: string;
}

const BIAYA_UNIT_DARAT: Record<string, number> = {
  pasukan_infanteri: 5000, // per 1000 atau per batch
  tank_tempur_utama: 15000,
  apc_ifv: 10000,
  artileri_berat: 48750,
  sistem_peluncur_roket: 71250,
  pertahanan_udara_mobile: 93750,
  kendaraan_taktis: 11250,
};

export function prosesRekrutmenDarat(
  ctx: BrainContext,
  kapasitas: Record<string, MilitaryCapacityStatus>,
): RecruitmentAction | null {
  const netto = calculateNetBalanceWithEconomicEmbargo(ctx.country, ctx.negaraNama);
  if (netto < 0) return null;

  const kas = nilaiAngka(ctx.country.anggaran);
  if (kas < 150000) return null; // Sisakan kas cadangan sipil

  // 1. Cek Pasukan Infanteri (Barak)
  const barakCap = kapasitas.barak;
  if (barakCap && barakCap.remainingCapacity > 0) {
    // Rekrut infanteri bertahap (misal 500 unit)
    const jumlahRekrut = Math.min(500, barakCap.remainingCapacity);
    const biaya = (BIAYA_UNIT_DARAT.pasukan_infanteri / 1000) * jumlahRekrut;

    if (kas - biaya >= 100000) {
      ctx.country.anggaran = kas - biaya;

      return {
        unitKey: "pasukan_infanteri",
        category: "darat",
        jumlah: jumlahRekrut,
        biayaTotal: biaya,
        alasan: `Perekrutan infanteri matra darat (+${jumlahRekrut} personel). Sisa kapasitas barak: ${barakCap.remainingCapacity - jumlahRekrut}.`,
      };
    }
  }

  // 2. Cek Hangar Tank (MBT vs APC proporsional 40:60)
  const hangarCap = kapasitas.hangar_tank;
  if (hangarCap && hangarCap.remainingCapacity > 0) {
    const mbtCount = nilaiAngka(ctx.country.tank_tempur_utama);
    const apcCount = nilaiAngka(ctx.country.apc_ifv);

    const targetKey = mbtCount <= apcCount ? "tank_tempur_utama" : "apc_ifv";
    const jumlahUnit = Math.min(5, hangarCap.remainingCapacity);
    const biaya = (BIAYA_UNIT_DARAT[targetKey] || 12000) * jumlahUnit;

    if (kas - biaya >= 100000) {
      ctx.country.anggaran = kas - biaya;

      return {
        unitKey: targetKey,
        category: "darat",
        jumlah: jumlahUnit,
        biayaTotal: biaya,
        alasan: `Produksi unit kendaraan lapis baja ${targetKey} (+${jumlahUnit}). Sisa kapasitas hangar: ${hangarCap.remainingCapacity - jumlahUnit}.`,
      };
    }
  }

  // 3. Cek Gudang Senjata (Artileri, Roket, Hanud, Kendaraan Taktis)
  const gudangCap = kapasitas.gudang_senjata;
  if (gudangCap && gudangCap.remainingCapacity > 0) {
    const unitPilihan = [
      "kendaraan_taktis",
      "artileri_berat",
      "pertahanan_udara_mobile",
      "sistem_peluncur_roket",
    ];

    // Cari unit dengan jumlah paling sedikit untuk menjaga keseimbangan komposisi
    unitPilihan.sort((a, b) => nilaiAngka(ctx.country[a]) - nilaiAngka(ctx.country[b]));
    const targetKey = unitPilihan[0];

    const jumlahUnit = Math.min(2, gudangCap.remainingCapacity);
    const biaya = (BIAYA_UNIT_DARAT[targetKey] || 30000) * jumlahUnit;

    if (kas - biaya >= 100000) {
      ctx.country.anggaran = kas - biaya;
      ctx.country[targetKey] = nilaiAngka(ctx.country[targetKey]) + jumlahUnit;
      if (ctx.country.armada?.darat) {
        ctx.country.armada.darat[targetKey] = (ctx.country.armada.darat[targetKey] || 0) + jumlahUnit;
      }

      return {
        unitKey: targetKey,
        category: "darat",
        jumlah: jumlahUnit,
        biayaTotal: biaya,
        alasan: `Produksi sistem persenjataan darat ${targetKey} (+${jumlahUnit}). Sisa kapasitas gudang: ${gudangCap.remainingCapacity - jumlahUnit}.`,
      };
    }
  }

  return null;
}
