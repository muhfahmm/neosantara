/**
 * lautRecruitment.ts
 *
 * Logika perekrutan & produksi matra laut:
 * Pangkalan Laut ->
 * - Kapal Induk
 * - Kapal Induk Nuklir
 * - Kapal Destroyer
 * - Kapal Korvet
 * - Kapal Selam Nuklir
 * - Kapal Selam Reguler (kapal_selam_regular)
 * - Kapal Ranjau
 * - Kapal Logistik
 *
 * Aturan:
 * - Tidak boleh overload pangkalan laut.
 * - Prioritaskan kapal patroli / korvet / logistik sebelum kapal induk / destroyer berat.
 * - Membutuhkan kas yang cukup dan Netto APBN positif.
 */

import { calculateNetBalanceWithEconomicEmbargo } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic";
import type { BrainContext } from "../core/brainContext";
import { nilaiAngka } from "../core/brainContext";
import type { MilitaryCapacityStatus } from "./militaryCapacity";
import type { RecruitmentAction } from "./daratRecruitment";

const BIAYA_UNIT_LAUT: Record<string, number> = {
  kapal_korvet: 135000,
  kapal_logistik: 95000,
  kapal_ranjau: 110000,
  kapal_selam_regular: 187500,
  kapal_destroyer: 337500,
  kapal_selam_nuklir: 562500,
  kapal_induk: 1125000,
  kapal_induk_nuklir: 1875000,
};

export function prosesRekrutmenLaut(
  ctx: BrainContext,
  kapasitas: Record<string, MilitaryCapacityStatus>,
): RecruitmentAction | null {
  const pangkalanCap = kapasitas.pangkalan_laut;
  if (!pangkalanCap || pangkalanCap.remainingCapacity <= 0) return null;

  // Cek apakah negara memiliki akses laut (flag sumber daya laut atau pangkalan laut sudah ada)
  if (pangkalanCap.count <= 0) return null;

  const netto = calculateNetBalanceWithEconomicEmbargo(ctx.country, ctx.negaraNama);
  if (netto < 0) return null;

  const kas = nilaiAngka(ctx.country.anggaran);
  if (kas < 300000) return null; // Sisakan dana cadangan lebih tinggi untuk kapal perang

  // Pilihan kapal dari yang esensial ke kapal induk
  const pilihanLaut = [
    "kapal_korvet",
    "kapal_logistik",
    "kapal_ranjau",
    "kapal_selam_regular",
    "kapal_destroyer",
    "kapal_selam_nuklir",
    "kapal_induk",
  ];

  // Urutkan berdasarkan kepemilikan paling sedikit
  pilihanLaut.sort((a, b) => nilaiAngka(ctx.country[a]) - nilaiAngka(ctx.country[b]));

  for (const targetKey of pilihanLaut) {
    const biaya = BIAYA_UNIT_LAUT[targetKey] || 150000;
    if (kas - biaya >= 200000) {
      ctx.country.anggaran = kas - biaya;

      return {
        unitKey: targetKey,
        category: "laut",
        jumlah: 1,
        biayaTotal: biaya,
        alasan: `Pengadaan armada laut ${targetKey} (+1 unit). Sisa kapasitas dermaga pangkalan laut: ${pangkalanCap.remainingCapacity - 1}.`,
      };
    }
  }

  return null;
}
