/**
 * demographicControllerAI.ts
 *
 * Pengendali Demografi Cerdas & Ringan untuk Negara AI (NPC).
 *
 * TUJUAN:
 * Mengendalikan populasi negara AI agar:
 * 1. Netto harian TIDAK BOLEH MINUS (Target aman minimal: +1 s/d +500 jiwa/hari).
 * 2. Mengatur strategi secara otomatis & mandiri di latar belakang lewat 4 sistem:
 *    - Pajak: Relaksasi beban tarif jika pertumbuhan tertekan.
 *    - Harga Pokok: Intervensi batas atas harga sembako untuk menjaga daya beli & fertilitas.
 *    - Sistem Ekonomi & Kebijakan: Penyesuaian spektrum menuju kestabilan sosial/pasar.
 *    - Kebijakan Subsidi: Mengaktifkan subsidi strategis (pangan/kesehatan/keluarga).
 *
 * EFISIENSI CPU:
 * - Algoritma matematis O(1) deterministik, tanpa perulangan/pencarian berat.
 * - Berjalan terintegrasi dalam tick harian yang sudah ada, 0 overhead thread/timer terpisah.
 */

import { INITIAL_SUBSIDY_ITEMS } from "../../../../../../json/5_database_kebijakan_subsidi/index";

export interface DemographicAdjustmentResult {
  triggered: boolean;
  strategy: "STIMULUS_DARURAT" | "STIMULUS_SEDANG" | "NORMALISASI_OPTIMAL" | "STABIL";
  initialNet: number;
  expectedNet: number;
  actions: string[];
}

/**
 * Nilai batas aman pertumbuhan harian yang diinginkan user:
 * Tidak boleh minus, dijaga pada rentang minimal +1 hingga +500 jiwa/hari.
 */
export const MIN_SAFE_GROWTH = 1;
export const TARGET_MODERATE_GROWTH = 500;

export function evaluateAndControlDemographics(
  country: Record<string, any>,
  currentNetDailyChange: number,
  populasi: number,
): DemographicAdjustmentResult {
  const actions: string[] = [];

  // Jika netto harian sudah aman positif (>= 1 dan stabil), AI tetap waspada namun tidak perlu intervensi ekstrem
  if (currentNetDailyChange >= MIN_SAFE_GROWTH && currentNetDailyChange <= TARGET_MODERATE_GROWTH * 2) {
    return {
      triggered: false,
      strategy: "STABIL",
      initialNet: currentNetDailyChange,
      expectedNet: currentNetDailyChange,
      actions: [],
    };
  }

  // Tentukan derajat keparahan (Darurat jika netto <= 0 / minus, atau Sedang jika mendekati 0)
  const isEmergency = currentNetDailyChange < MIN_SAFE_GROWTH;
  const strategy = isEmergency ? "STIMULUS_DARURAT" : "NORMALISASI_OPTIMAL";

  // =========================================================================
  // 1. SISTEM SUBSIDI: Aktifkan subsidi penopang fertilitas & kehidupan
  // =========================================================================
  const subsidyStates = { ...(country.subsidy_states || {}) } as Record<string, boolean>;
  let subsidyModified = false;

  // Aktifkan subsidi utama untuk menaikkan skor subsidi ke atas 75%
  const prioritySubsidies = [
    "subsidi_beras",
    "subsidi_kesehatan",
    "subsidi_bbm",
    "subsidi_listrik",
    "subsidi_pendidikan",
    "subsidi_pupuk",
  ];
  for (const subId of prioritySubsidies) {
    if (!subsidyStates[subId]) {
      subsidyStates[subId] = true;
      subsidyModified = true;
      actions.push(`Aktifkan ${subId.replace(/_/g, " ")}`);
    }
  }

  // Aktifkan program insentif keluarga / anak
  if (country.program_insentif_anak !== true) {
    country.program_insentif_anak = true;
    actions.push("Aktifkan Program Insentif Anak & Keluarga");
  }

  if (subsidyModified) {
    country.subsidy_states = subsidyStates;
  }

  // =========================================================================
  // 2. SISTEM HARGA POKOK: Tekan harga komoditas pangan mendekati batas minimum
  // =========================================================================
  if (country.harga && typeof country.harga === "object") {
    const hargaObj = { ...country.harga };
    let hargaModified = false;

    for (const [key, val] of Object.entries(hargaObj)) {
      if (key.startsWith("harga_") && typeof val === "number") {
        // Targetkan harga sembako murah (Rp10.000 - Rp20.000) agar skor kepuasan harga > 80
        if (val > 20000) {
          const newPrice = Math.max(10000, Math.round(val * 0.75)); // Pangkas 25% langsung saat krisis
          if (newPrice < val) {
            hargaObj[key] = newPrice;
            hargaModified = true;
          }
        }
      }
    }

    if (hargaModified) {
      country.harga = hargaObj;
      actions.push("Operasi pasar: stabilisasi harga pangan murah");
    }
  }

  // =========================================================================
  // 3. SISTEM PAJAK: Pangkas pajak langsung ke batas minimum (5-8%)
  // =========================================================================
  const taxKeys = ["ppn", "corporate", "income_tax", "cigarette_tax", "environment_tax"];
  let taxModified = false;

  for (const tKey of taxKeys) {
    const curVal = Number(country[tKey] ?? 15);
    if (curVal > 8) {
      const newVal = 5; // Pangkas langsung ke tarif ramah rakyat
      country[tKey] = newVal;
      if (country.pajak && country.pajak[tKey]) {
        country.pajak[tKey].tarif = newVal;
      }
      taxModified = true;
    }
  }

  if (taxModified) {
    actions.push("Pangkas tarif pajak nasional ke batas stimulus ekonomi");
  }

  // =========================================================================
  // 4. SISTEM EKONOMI: Geser ke ekonomi campuran pro-kesejahteraan (spektrum 55-65)
  // =========================================================================
  country.sistem_ekonomi_val = 55; // Titik optimum untuk pertumbuhan populasi seimbang
  country.policy_price_control = "A"; // Pengendalian harga aktif
  country.policy_labor_regulation = "A"; // Perlindungan tenaga kerja
  country.policy_strategic_ownership = "A"; // BUMN strategis melindungi logistik pangan

  actions.push("Reformasi sistem ekonomi ke spektrum campuran protektif");

  return {
    triggered: actions.length > 0,
    strategy,
    initialNet: currentNetDailyChange,
    expectedNet: Math.max(MIN_SAFE_GROWTH, currentNetDailyChange + 100),
    actions,
  };
}
