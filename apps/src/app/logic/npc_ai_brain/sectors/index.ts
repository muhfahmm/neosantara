/**
 * Registri semua sektor pembangunan + helper pencarian & pasokan bahan.
 */
import type { BrainContext } from "../core/brainContext";
import { nilaiAngka } from "../core/brainContext";
import type { HasilBangun, SektorBangunan } from "../core/sectorBuilder";

import { SEKTOR_KELISTRIKAN } from "./produksi/kelistrikan/kelistrikanSektor";
import { SEKTOR_MINERAL_ENERGI } from "./produksi/mineral_energi/mineralEnergiSektor";
import { SEKTOR_MANUFAKTUR } from "./produksi/manufaktur/manufakturSektor";
import { SEKTOR_PETERNAKAN } from "./produksi/peternakan/peternakanSektor";
import { SEKTOR_AGRIKULTUR } from "./produksi/agrikultur/agrikulturSektor";
import { SEKTOR_PERIKANAN } from "./produksi/perikanan/perikananSektor";
import { SEKTOR_OLAHAN_PANGAN } from "./produksi/olahan_pangan/olahanPanganSektor";
import { SEKTOR_INFRASTRUKTUR } from "./layanan/infrastruktur/infrastrukturSektor";
import { SEKTOR_PENDIDIKAN } from "./layanan/pendidikan/pendidikanSektor";
import { SEKTOR_KESEHATAN } from "./layanan/kesehatan/kesehatanSektor";
import { SEKTOR_PENEGAKAN_HUKUM } from "./layanan/penegakan_hukum/penegakanHukumSektor";
import { SEKTOR_OLAHRAGA_HIBURAN } from "./layanan/olahraga_hiburan/olahragaHiburanSektor";
import { SEKTOR_KOMERSIAL } from "./layanan/komersial/komersialSektor";
import { SEKTOR_PERUMAHAN } from "./lainnya/perumahan/perumahanSektor";

export {
  SEKTOR_KELISTRIKAN,
  SEKTOR_MINERAL_ENERGI,
  SEKTOR_MANUFAKTUR,
  SEKTOR_PETERNAKAN,
  SEKTOR_AGRIKULTUR,
  SEKTOR_PERIKANAN,
  SEKTOR_OLAHAN_PANGAN,
  SEKTOR_INFRASTRUKTUR,
  SEKTOR_PENDIDIKAN,
  SEKTOR_KESEHATAN,
  SEKTOR_PENEGAKAN_HUKUM,
  SEKTOR_OLAHRAGA_HIBURAN,
  SEKTOR_KOMERSIAL,
  SEKTOR_PERUMAHAN,
};

export const SEMUA_SEKTOR: SektorBangunan[] = [
  SEKTOR_KELISTRIKAN,
  SEKTOR_MINERAL_ENERGI,
  SEKTOR_MANUFAKTUR,
  SEKTOR_PETERNAKAN,
  SEKTOR_AGRIKULTUR,
  SEKTOR_PERIKANAN,
  SEKTOR_OLAHAN_PANGAN,
  SEKTOR_INFRASTRUKTUR,
  SEKTOR_PENDIDIKAN,
  SEKTOR_KESEHATAN,
  SEKTOR_PENEGAKAN_HUKUM,
  SEKTOR_OLAHRAGA_HIBURAN,
  SEKTOR_KOMERSIAL,
  SEKTOR_PERUMAHAN,
];

export const SEMUA_KEY_BANGUNAN: string[] = Array.from(new Set(SEMUA_SEKTOR.flatMap((s) => s.keys)));

export function cariSektorByKey(buildingKey: string): SektorBangunan | undefined {
  return SEMUA_SEKTOR.find((s) => s.keys.includes(buildingKey));
}

/** Bangun lewat sektor pemilik key bangunan. */
export function bangunLewatSektor(ctx: BrainContext, buildingKey: string, jumlah: number): HasilBangun {
  const sektor = cariSektorByKey(buildingKey);
  if (!sektor) {
    return { buildingKey, diminta: jumlah, dibangun: 0, bahanKurang: [], alasan: `sektor untuk ${buildingKey} tidak ditemukan` };
  }
  return sektor.bangun(ctx, buildingKey, jumlah);
}

/**
 * Bila pembangunan terhenti karena bahan kurang dan bahan itu diproduksi sektor Manufaktur
 * atau Mineral & Energi, bangun satu pemasok (maks 10% jumlah yang ada, minimal 1) — sebatas
 * stok & anggaran yang tersedia. Mengembalikan ringkasan atau null.
 */
export function pasokBahanKurang(ctx: BrainContext, bahanKurang: string[]): string | null {
  for (const bahan of bahanKurang) {
    if (bahan === "anggaran") continue;
    const sektor = cariSektorByKey(bahan);
    if (!sektor || (sektor.id !== "manufaktur" && sektor.id !== "mineral_energi")) continue;
    const jumlah = Math.max(1, Math.ceil(nilaiAngka(ctx.country[bahan]) * 0.1));
    const hasil = sektor.bangun(ctx, bahan, jumlah);
    if (hasil.dibangun > 0) return `memperluas pemasok bahan ${bahan} (+${hasil.dibangun})`;
  }
  return null;
}
