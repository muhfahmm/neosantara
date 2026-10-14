/**
 * udaraRecruitment.ts
 *
 * Logika perekrutan & produksi matra udara:
 * Pangkalan Udara ->
 * - Jet Tempur Siluman
 * - Jet Interceptor
 * - Pesawat Pengebom
 * - Helikopter Serang
 * - Pesawat Pengintai
 * - Drone UAV
 * - Drone Kamikaze
 * - Pesawat Angkut
 *
 * Aturan:
 * - Tidak boleh melebihi sisa kapasitas Pangkalan Udara.
 * - Komposisi seimbang: Drone & Helikopter lebih terjangkau, Jet Tempur berteknologi tinggi proporsional.
 * - Menjaga Netto APBN dan sisa kas aman.
 */

import { calculateNetBalanceWithEconomicEmbargo } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic";
import type { BrainContext } from "../core/brainContext";
import { nilaiAngka } from "../core/brainContext";
import type { MilitaryCapacityStatus } from "./militaryCapacity";
import type { RecruitmentAction } from "./daratRecruitment";

const BIAYA_UNIT_UDARA: Record<string, number> = {
  drone_intai_uav: 11250,
  drone_kamikaze: 15000,
  helikopter_serang: 41250,
  pesawat_pengintai: 71250,
  pesawat_angkut: 85000,
  jet_tempur_interceptor: 63750,
  jet_tempur_siluman: 112500,
  pesawat_pengebom: 187500,
};

export function prosesRekrutmenUdara(
  ctx: BrainContext,
  kapasitas: Record<string, MilitaryCapacityStatus>,
): RecruitmentAction | null {
  const pangkalanCap = kapasitas.pangkalan_udara;
  if (!pangkalanCap || pangkalanCap.remainingCapacity <= 0) return null;

  const netto = calculateNetBalanceWithEconomicEmbargo(ctx.country, ctx.negaraNama);
  if (netto < 0) return null;

  const kas = nilaiAngka(ctx.country.anggaran);
  if (kas < 200000) return null;

  // Daftar armada udara diurutkan dari prioritas seimbang
  const pilihanUdara = [
    "drone_intai_uav",
    "drone_kamikaze",
    "helikopter_serang",
    "jet_tempur_interceptor",
    "pesawat_pengintai",
    "pesawat_angkut",
    "jet_tempur_siluman",
    "pesawat_pengebom",
  ];

  // Cari unit dengan jumlah paling sedikit di inventaris negara
  pilihanUdara.sort((a, b) => nilaiAngka(ctx.country[a]) - nilaiAngka(ctx.country[b]));

  for (const targetKey of pilihanUdara) {
    const biaya = BIAYA_UNIT_UDARA[targetKey] || 50000;
    // Beli 1 unit (atau 2 untuk drone)
    const jumlahUnit = targetKey.startsWith("drone") ? Math.min(2, pangkalanCap.remainingCapacity) : 1;
    const totalBiaya = biaya * jumlahUnit;

    if (kas - totalBiaya >= 150000) {
      ctx.country.anggaran = kas - totalBiaya;

      return {
        unitKey: targetKey,
        category: "udara",
        jumlah: jumlahUnit,
        biayaTotal: totalBiaya,
        alasan: `Pengadaan armada udara ${targetKey} (+${jumlahUnit}). Sisa kapasitas pangkalan udara: ${pangkalanCap.remainingCapacity - jumlahUnit}.`,
      };
    }
  }

  return null;
}
