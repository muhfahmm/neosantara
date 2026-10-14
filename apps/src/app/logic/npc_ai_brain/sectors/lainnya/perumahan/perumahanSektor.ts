import * as subsidi from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/3_hunian/construction_support/1_perumahan_subsidi/requirements";
import * as apartemen from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/3_hunian/construction_support/2_apartement/requirements";
import * as mansion from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/3_hunian/construction_support/3_mansion/requirements";
import { bangunBangunan, type HasilBangun, type SektorBangunan } from "../../../core/sectorBuilder";
import type { BrainContext } from "../../../core/brainContext";

/** Kapasitas bawaan (jiwa/unit) — sama dengan skor Hunian di kepuasanCalculator. */
export const KAPASITAS_HUNIAN_DEFAULT: Record<string, number> = {
  rumah_subsidi: 5,
  apartemen: 6000,
  mansion: 10,
};

const MODUL_PER_KEY: Record<string, any> = {
  rumah_subsidi: subsidi,
  apartemen,
  mansion,
};

/** Perumahan memakai tiga modul requirements berbeda, jadi tidak lewat buatSektor. */
export const SEKTOR_PERUMAHAN: SektorBangunan = {
  id: "perumahan",
  label: "Perumahan",
  kategori: "lainnya",
  keys: ["rumah_subsidi", "apartemen", "mansion"],
  bangun: (ctx: BrainContext, buildingKey: string, jumlah: number): HasilBangun => {
    const modul = MODUL_PER_KEY[buildingKey];
    if (!modul) {
      return { buildingKey, diminta: jumlah, dibangun: 0, bahanKurang: [], alasan: `${buildingKey} bukan hunian` };
    }
    return bangunBangunan(ctx, buildingKey, jumlah, modul);
  },
};
