/**
 * sectorBuilder.ts
 * Mesin pembangunan bersama untuk semua folder sektor.
 * Aturan inti: bahan disesuaikan dengan stok yang tersedia; TIDAK membangun bila bahan/anggaran tidak cukup.
 */
import {
  calculateMaxBuildQuantity,
  deductBuildingMaterials,
  findBuildingMetadata,
  getMaterialStock,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";
import { isBuildingAvailable } from "@/app/logic/fisheries_production_logic/countryLandscapeLogic";
import type { BrainContext } from "./brainContext";
import { nilaiAngka, tambahHari } from "./brainContext";

export interface RequirementsModule {
  findRequirements?: (
    buildingKey: string,
  ) => { requirements: { resourceKey: string; label?: string; amount?: number }[] } | undefined;
}

export interface HasilBangun {
  buildingKey: string;
  diminta: number;
  dibangun: number;
  /** resourceKey bahan yang kurang (atau "anggaran") */
  bahanKurang: string[];
  alasan: string;
}

export interface SektorBangunan {
  id: string;
  label: string;
  kategori: "produksi" | "layanan" | "lainnya";
  keys: string[];
  bangun: (ctx: BrainContext, buildingKey: string, jumlah: number) => HasilBangun;
}

export function biayaBangunan(ctx: BrainContext, buildingKey: string): number {
  const meta = findBuildingMetadata(ctx.metadata, buildingKey);
  return nilaiAngka(meta?.biaya_pembangunan);
}

export function bangunBangunan(
  ctx: BrainContext,
  buildingKey: string,
  jumlahDiminta: number,
  reqModule: RequirementsModule,
): HasilBangun {
  const hasil: HasilBangun = {
    buildingKey,
    diminta: Math.max(0, Math.floor(jumlahDiminta)),
    dibangun: 0,
    bahanKurang: [],
    alasan: "",
  };
  if (hasil.diminta <= 0) {
    hasil.alasan = "jumlah diminta 0";
    return hasil;
  }

  const meta = findBuildingMetadata(ctx.metadata, buildingKey);
  if (!meta) {
    hasil.alasan = `metadata ${buildingKey} tidak ditemukan`;
    return hasil;
  }

  const pendingQueue = Array.isArray(ctx.country.ai_civilian_construction_queue)
    ? ctx.country.ai_civilian_construction_queue as Array<{
        id: string;
        buildingKey: string;
        sektorId: string;
        jumlah: number;
        startDate: string;
        completionDate: string;
        daysRemaining: number;
      }>
    : [];
  if (pendingQueue.some((item) => item.buildingKey === buildingKey)) {
    hasil.alasan = `pembangunan ${buildingKey} sedang berlangsung`;
    return hasil;
  }

  try {
    if (!isBuildingAvailable(buildingKey, ctx.negaraNama, null)) {
      hasil.alasan = `${buildingKey} tidak tersedia di negara ini (flag sumber daya/laut)`;
      return hasil;
    }
  } catch {
    /* abaikan: anggap tersedia */
  }

  const biaya = biayaBangunan(ctx, buildingKey);
  const requirements = reqModule.findRequirements?.(buildingKey)?.requirements ?? [];
  const anggaran = nilaiAngka(ctx.country.anggaran);

  const stok: Record<string, number> = {};
  for (const req of requirements) {
    stok[req.resourceKey] = getMaterialStock(ctx.country, req.resourceKey);
  }

  // Jumlah maksimum yang BISA dibangun dengan stok & anggaran sekarang.
  const maksimum = calculateMaxBuildQuantity(biaya, anggaran, requirements, stok);
  const jumlah = Math.min(hasil.diminta, maksimum);

  if (jumlah <= 0) {
    for (const req of requirements) {
      if (stok[req.resourceKey] < nilaiAngka(req.amount)) hasil.bahanKurang.push(req.resourceKey);
    }
    if (biaya > 0 && anggaran < biaya) hasil.bahanKurang.push("anggaran");
    hasil.alasan = `bahan/anggaran tidak cukup untuk ${buildingKey}: ${hasil.bahanKurang.join(", ") || "tidak diketahui"}`;
    return hasil;
  }

  // Terapkan biaya sekarang; bangunan baru aktif setelah durasi konstruksi selesai.
  const setelahMaterial = deductBuildingMaterials(ctx.country, requirements, jumlah);
  ctx.country = setelahMaterial;
  ctx.country.anggaran = anggaran - biaya * jumlah;
  const waktuHari = Math.max(1, Math.round(nilaiAngka(meta.waktu_pembangunan, 3)));
  const queue = [...pendingQueue];
  queue.push({
    id: `${buildingKey}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    buildingKey,
    sektorId: "sektor_ai",
    jumlah,
    startDate: ctx.date,
    completionDate: tambahHari(ctx.date, waktuHari),
    daysRemaining: waktuHari,
  });
  ctx.country.ai_civilian_construction_queue = queue;

  hasil.dibangun = jumlah;
  hasil.alasan =
    jumlah < hasil.diminta
      ? `pembangunan ${jumlah} dari ${hasil.diminta} unit dimulai (disesuaikan dengan stok bahan/anggaran)`
      : `pembangunan ${jumlah} unit dimulai`;
  return hasil;
}

/** Pabrik sektor: tiap folder sektor memanggil ini dengan modul requirements miliknya. */
export function buatSektor(
  id: string,
  label: string,
  kategori: SektorBangunan["kategori"],
  keys: string[],
  reqModule: RequirementsModule,
): SektorBangunan {
  return {
    id,
    label,
    kategori,
    keys,
    bangun: (ctx, buildingKey, jumlah) => {
      if (!keys.includes(buildingKey)) {
        return {
          buildingKey,
          diminta: jumlah,
          dibangun: 0,
          bahanKurang: [],
          alasan: `${buildingKey} bukan bagian sektor ${label}`,
        };
      }
      return bangunBangunan(ctx, buildingKey, jumlah, reqModule);
    },
  };
}
