/**
 * militaryCapacity.ts
 *
 * Mengelola kalkulasi kapasitas infrastruktur militer negara AI:
 * - Barak Militer -> Infanteri
 * - Gudang Senjata -> Artileri Berat, Peluncur Roket, Pertahanan Udara, Kendaraan Taktis
 * - Hangar Tank -> MBT, APC/IFV
 * - Pangkalan Udara -> Jet Siluman, Interceptor, Pengebom, Helikopter Serang, Pengintai, Drone UAV, Drone Kamikaze, Angkut
 * - Pangkalan Laut -> Kapal Induk, Kapal Induk Nuklir, Destroyer, Korvet, Selam Nuklir, Selam Reguler, Ranjau, Logistik
 */

import { getInfraCapacityDetails } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/infraCapacityHelper";

export type MilitaryInfraKey =
  | "barak"
  | "gudang_senjata"
  | "hangar_tank"
  | "pangkalan_udara"
  | "pangkalan_laut";

export interface MilitaryCapacityStatus {
  infraKey: MilitaryInfraKey;
  label: string;
  count: number;
  capacityPerUnit: number;
  totalCapacity: number;
  used: number;
  remainingCapacity: number;
  isFull: boolean;
  persentaseSisa: number; // 0 - 100%
  supportedUnits: string[];
}

export const MILITARY_INFRA_KEYS: MilitaryInfraKey[] = [
  "barak",
  "gudang_senjata",
  "hangar_tank",
  "pangkalan_udara",
  "pangkalan_laut",
];

export const MILITARY_INFRA_LABELS: Record<MilitaryInfraKey, string> = {
  barak: "Barak Militer",
  gudang_senjata: "Gudang Senjata",
  hangar_tank: "Hangar Tank",
  pangkalan_udara: "Pangkalan Udara",
  pangkalan_laut: "Pangkalan Laut",
};

/**
 * Menghitung status kapasitas lengkap untuk semua 5 infrastruktur militer.
 */
export function getSemuaKapasitasMiliter(
  countryDetail: Record<string, any>,
): Record<MilitaryInfraKey, MilitaryCapacityStatus> {
  const result: Partial<Record<MilitaryInfraKey, MilitaryCapacityStatus>> = {};

  for (const infraKey of MILITARY_INFRA_KEYS) {
    const detail = getInfraCapacityDetails(infraKey, countryDetail);
    const count = detail?.infraCount || 0;
    const totalCapacity = detail?.totalCapacity || 0;
    const used = detail?.used || 0;
    const remainingCapacity = Math.max(0, totalCapacity - used);
    const persentaseSisa = totalCapacity > 0 ? (remainingCapacity / totalCapacity) * 100 : 0;

    result[infraKey] = {
      infraKey,
      label: MILITARY_INFRA_LABELS[infraKey],
      count,
      capacityPerUnit: detail?.capacityPerUnit || 0,
      totalCapacity,
      used,
      remainingCapacity,
      isFull: detail?.isFull ?? (count > 0 && used >= totalCapacity),
      persentaseSisa,
      supportedUnits: detail?.supportedUnits || [],
    };
  }

  return result as Record<MilitaryInfraKey, MilitaryCapacityStatus>;
}
