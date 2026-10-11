import { getCabinetMinistryBonusPercent } from "./ministryBonusUtils";
import { getProgramPermukimanDiplomatikBonusPercent } from "../penelitian_bonus_logic/3_riset_diplomasi_intelijen/20_Program Permukiman Terpadu";

export function getKementerianPerumahanCapacityBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  return getCabinetMinistryBonusPercent(countryDetail, "perumahan");
}

export function applyKementerianPerumahanCapacityBonus(
  baseCapacity: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const bonusPercent = getKementerianPerumahanCapacityBonusPercent(countryDetail);
  return baseCapacity * (1 + bonusPercent / 100);
}

/**
 * Total persentase bonus kapasitas perumahan/permukiman dari seluruh sumber bonus
 * (Kementerian Perumahan + Riset Penelitian Program Permukiman Terpadu).
 */
export function getTotalHousingCapacityBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  const kementerianBonus = getKementerianPerumahanCapacityBonusPercent(countryDetail);
  const risetBonus = getProgramPermukimanDiplomatikBonusPercent(countryDetail);
  return kementerianBonus + risetBonus;
}

/**
 * Mengaplikasikan seluruh bonus kapasitas perumahan per 1 bangunan / total.
 * Jika terdapat bonus > 0%, dipastikan bertambah minimal +1 jiwa per unit agar kapasitas
 * unit kecil (seperti rumah subsidi 5 jiwa dengan bonus misal +9%) tetap meningkat (5 -> 6 jiwa).
 */
export function applyTotalHousingCapacityBonus(
  baseCapacity: number,
  countryDetail: Record<string, unknown> | null | undefined
): number {
  if (!Number.isFinite(baseCapacity) || baseCapacity <= 0) return baseCapacity;
  const totalPercent = getTotalHousingCapacityBonusPercent(countryDetail);
  if (totalPercent <= 0) return baseCapacity;
  const added = Math.max(1, Math.round((baseCapacity * totalPercent) / 100));
  return baseCapacity + added;
}

