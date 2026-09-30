// apps/src/app/logic/economic_logic/goldIncome.ts

import ekstraksiMetadata from "@/../../json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/2_metadata_ekstraksi.json";

// ============================================
// AMBIL DATA EMAS SAJA DARI JSON METADATA
// ============================================
interface GoldMetadata {
  key: string;
  dataKey: string;
  label: string;
  deskripsi: string;
  produksi: number;
  satuan: string;
  waktu_pembangunan: number;
  biaya_pembangunan: number;
  lowongan_kerja?: number;
  konsumsi_listrik: number;
}

const goldMetadata: GoldMetadata = (ekstraksiMetadata as Record<string, GoldMetadata>)["emas"];

// ============================================
// GOLD MINING ECONOMIC CONFIG
// Rate produksi diambil langsung dari JSON, jadi kalau nanti
// nilai "produksi" di JSON diubah, otomatis ikut berubah di sini.
// ============================================
export const GOLD_MINING_PRODUCTION_PER_BUILDING = goldMetadata?.produksi ?? 600;

// Harga jual per unit TIDAK ada di JSON (JSON cuma data produksi/biaya bangun),
// jadi tetap dikonfigurasi manual di sini untuk keperluan balance ekonomi.
// Harga jual per unit dan asumsi hari sebulan dihapus —
// semua perhitungan harus mengacu pada produksi (dari JSON).

// ============================================
// GOLD MINING CALCULATIONS
// ============================================

/**
 * Menghitung total produksi emas HARIAN berdasarkan jumlah bangunan tambang.
 * Formula: jumlah bangunan × produksi per bangunan (dari JSON)
 * Contoh: 400 bangunan × 600 (dari JSON) = 240.000
 */
export const calculateGoldMiningDailyProduction = (countryDetail: any) => {
  const buildingCount = Number(countryDetail?.emas) || 0;
  return buildingCount * GOLD_MINING_PRODUCTION_PER_BUILDING;
};

/**
 * Menghitung total pendapatan emas BULANAN (dalam NEO).
 * Formula: produksi harian × harga per unit × jumlah hari dalam sebulan
 */
// Monthly income calculation removed — prefer explicit conversion
// elsewhere if NEO conversion is required.
