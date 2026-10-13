// apps/src/app/logic/economic_logic/goldIncome.ts

import { getBuildingMetadata } from "@/lib/buildingMetadataRegistry";

const getGoldMiningProductionPerBuilding = (): number => {
  const goldMetadata = getBuildingMetadata()["emas"];
  const production = Number(goldMetadata?.produksi);
  return Number.isFinite(production) && production > 0 ? production : 600;
};

// Harga jual per unit tidak ada di metadata (metadata hanya memuat produksi/biaya bangun),
// jadi tetap dikonfigurasi manual di sini untuk keperluan balance ekonomi.
// Harga jual per unit dan asumsi hari sebulan dihapus —
// semua perhitungan harus mengacu pada produksi (dari database).

// ============================================
// GOLD MINING CALCULATIONS
// ============================================

/**
 * Menghitung total produksi emas HARIAN berdasarkan jumlah bangunan tambang.
 * Formula: jumlah bangunan × produksi per bangunan (dari database)
 * Contoh: 400 bangunan × 600 (dari database) = 240.000
 */
export const calculateGoldMiningDailyProduction = (countryDetail: Record<string, unknown> | null | undefined) => {
  const buildingCount = Number(countryDetail?.emas) || 0;
  return buildingCount * getGoldMiningProductionPerBuilding();
};

/**
 * Menghitung total pendapatan emas BULANAN (dalam NEO).
 * Formula: produksi harian × harga per unit × jumlah hari dalam sebulan
 */
// Monthly income calculation removed — prefer explicit conversion
// elsewhere if NEO conversion is required.
