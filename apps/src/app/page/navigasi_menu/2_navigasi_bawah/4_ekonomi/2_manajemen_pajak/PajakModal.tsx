"use client";
import React, { useEffect, useState } from "react";
import { X, FileText } from "lucide-react";
import {
  TAX_CONFIGS,
  calculateIncomeAtRate,
} from "@/app/logic/economic_logic/2_tax_logic/taxLogic";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
}

/**
 * Mengambil nilai pajak dari objek detail berdasarkan jalur path.
 * Jika nilai tidak ditemukan atau bukan angka, mengembalikan fallback (default 0).
 */
const getTaxValue = (detail: any, path: string[], fallback: number = 0): number => {
  let current: any = detail;
  for (const key of path) {
    if (current == null || typeof current !== "object") return fallback;
    current = current[key];
  }
  return typeof current === "number" ? current : fallback;
};

export default function PajakModal({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
}: ModalProps) {
  if (!isOpen) return null;

  // Inisialisasi nilai awal dengan fallback 0, dipaksa menjadi number
  const initialRates = {
    income_tax: Number(
      getTaxValue(countryDetail, ["income_tax"]) ??
        getTaxValue(countryDetail, ["pajak", "penghasilan", "tarif"]) ??
        0
    ),
    corporate_tax: Number(
      getTaxValue(countryDetail, ["corporate"]) ??
        getTaxValue(countryDetail, ["pajak", "korporasi", "tarif"]) ??
        0
    ),
    vat: Number(
      getTaxValue(countryDetail, ["ppn"]) ??
        getTaxValue(countryDetail, ["pajak", "ppn", "tarif"]) ??
        0
    ),
    cigarette_tax: Number(
      getTaxValue(countryDetail, ["cigarette_tax"]) ??
        getTaxValue(countryDetail, ["pajak", "bea_cukai", "tarif"]) ??
        0
    ),
    environment_tax: Number(
      getTaxValue(countryDetail, ["environment_tax"]) ??
        getTaxValue(countryDetail, ["pajak", "lingkungan", "tarif"]) ??
        0
    ),
  };

  const [tempRates, setTempRates] = useState<Record<string, number>>(initialRates);

  useEffect(() => {
    setTempRates(initialRates);
  }, [
    countryDetail?.id,
    countryDetail?.name,
    countryDetail?.income_tax,
    countryDetail?.corporate,
    countryDetail?.ppn,
    countryDetail?.cigarette_tax,
    countryDetail?.environment_tax,
    countryDetail?.pajak?.penghasilan?.tarif,
    countryDetail?.pajak?.korporasi?.tarif,
    countryDetail?.pajak?.ppn?.tarif,
    countryDetail?.pajak?.bea_cukai?.tarif,
    countryDetail?.pajak?.lingkungan?.tarif,
  ]);

  // ---- FUNGSI MENGHITUNG INDEKS KEPUASAN ----
  const calculateSatisfaction = (rates: typeof tempRates) => {
    const { vat, corporate_tax, income_tax, cigarette_tax, environment_tax } = rates;
    const avgRate = (vat + corporate_tax + income_tax + cigarette_tax + environment_tax) / 5;
    const total = calculateIncomeAtRate(vat, 1000) +
                  calculateIncomeAtRate(corporate_tax, 1000) +
                  calculateIncomeAtRate(income_tax, 1000) +
                  calculateIncomeAtRate(cigarette_tax, 1000) +
                  calculateIncomeAtRate(environment_tax, 1000);
    const maxIncome = 5 * 1000; // 5000 EM
    // Kepuasan = 100 - rata-rata tarif + (pendapatan / maxPendapatan * 20)
    let satisfaction = 100 - avgRate + (total / maxIncome) * 20;
    // Clamp antara 1 dan 100
    return Math.min(100, Math.max(1, Math.round(satisfaction)));
  };

  const satisfaction = calculateSatisfaction(tempRates);

  // --- Initialize satisfaction.tax hanya saat modal pertama kali buka & countryDetail berubah ---
  useEffect(() => {
    if (!isOpen || !countryDetail) return;
    
    // IMPORTANT: Hanya update satisfaction jika belum ada atau modal baru pertama kali buka
    if (countryDetail.satisfaction?.tax !== undefined) return; // Jangan update lagi jika sudah ada
    
    const initialSatisfaction = calculateSatisfaction(initialRates);
    setCountryDetail({
      ...countryDetail,
      satisfaction: {
        ...(countryDetail?.satisfaction || {}),
        tax: initialSatisfaction,
      },
    });
  }, [isOpen, countryDetail?.id]); // Only depend on isOpen & countryDetail ID, not initialRates!

  const handleTaxChange = (taxId: string, nextVal: number) => {
    const updatedRates = {
      ...tempRates,
      [taxId]: nextVal,
    };
    setTempRates(updatedRates);

    // Update countryDetail dengan nilai baru dan indeks kepuasan
    const newSatisfaction = calculateSatisfaction(updatedRates);
    setCountryDetail({
      ...countryDetail,
      income_tax:
        taxId === "income_tax"
          ? nextVal
          : getTaxValue(countryDetail, ["income_tax"], countryDetail?.income_tax ?? 0),
      corporate:
        taxId === "corporate_tax"
          ? nextVal
          : getTaxValue(countryDetail, ["corporate"], countryDetail?.corporate ?? 0),
      ppn:
        taxId === "vat"
          ? nextVal
          : getTaxValue(countryDetail, ["ppn"], countryDetail?.ppn ?? 0),
      cigarette_tax:
        taxId === "cigarette_tax"
          ? nextVal
          : getTaxValue(countryDetail, ["cigarette_tax"], countryDetail?.cigarette_tax ?? 0),
      environment_tax:
        taxId === "environment_tax"
          ? nextVal
          : getTaxValue(countryDetail, ["environment_tax"], countryDetail?.environment_tax ?? 0),
      pajak: {
        ...(countryDetail?.pajak || {}),
        penghasilan:
          taxId === "income_tax"
            ? { ...(countryDetail?.pajak?.penghasilan || {}), tarif: nextVal }
            : countryDetail?.pajak?.penghasilan,
        korporasi:
          taxId === "corporate_tax"
            ? { ...(countryDetail?.pajak?.korporasi || {}), tarif: nextVal }
            : countryDetail?.pajak?.korporasi,
        ppn:
          taxId === "vat"
            ? { ...(countryDetail?.pajak?.ppn || {}), tarif: nextVal }
            : countryDetail?.pajak?.ppn,
        bea_cukai:
          taxId === "cigarette_tax"
            ? { ...(countryDetail?.pajak?.bea_cukai || {}), tarif: nextVal }
            : countryDetail?.pajak?.bea_cukai,
        lingkungan:
          taxId === "environment_tax"
            ? { ...(countryDetail?.pajak?.lingkungan || {}), tarif: nextVal }
            : countryDetail?.pajak?.lingkungan,
      },
      // Simpan indeks kepuasan ke dalam countryDetail (gunakan key 'satisfaction' dengan subkey 'tax')
      satisfaction: {
        ...(countryDetail?.satisfaction || {}),
        tax: newSatisfaction,
      },
    });
  };

  // Hitung total pendapatan dari semua pajak (untuk ditampilkan)
  const totalIncome =
    calculateIncomeAtRate(tempRates.vat, 1000) +
    calculateIncomeAtRate(tempRates.corporate_tax, 1000) +
    calculateIncomeAtRate(tempRates.income_tax, 1000) +
    calculateIncomeAtRate(tempRates.cigarette_tax, 1000) +
    calculateIncomeAtRate(tempRates.environment_tax, 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
        <div className="px-8 py-6 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                <FileText className="h-6 w-6 text-[#00FFAA]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#00FFAA] tracking-tight leading-none uppercase">
                  Kebijakan Perpajakan Fiskal
                </h2>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5"
            >
              <span className="text-xs font-semibold uppercase tracking-widest pl-1">
                Tutup
              </span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <p className="text-xs text-[#6B8A8A] font-semibold leading-relaxed mb-6">
            Sesuaikan tarif pajak nasional untuk membiayai belanja militer dan
            infrastruktur publik. Hati-hati, pajak tinggi memicu protes rakyat!
          </p>

          <div className="space-y-5">
            {/* 1. PPN - Pajak Pertambahan Nilai */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#00FFAA] uppercase">
                <span>Pajak Pertambahan Nilai (PPN)</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#E0E0E0]">{tempRates.vat}%</span>
                  <span className="text-emerald-400 font-black">
                    ({calculateIncomeAtRate(tempRates.vat, 1000).toLocaleString(
                      "id-ID"
                    )}{" "}
                    EM)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.vat}
                onChange={(e) =>
                  handleTaxChange("vat", parseInt(e.target.value))
                }
                className="w-full accent-[#00FFAA] cursor-pointer"
              />
              <p className="text-[10px] text-[#6B8A8A]">
                0% = 0 EM, 100% = 1.000 EM income
              </p>
            </div>

            {/* 2. Korporasi - Pajak Korporasi */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#00FFAA] uppercase">
                <span>Pajak Korporasi</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#E0E0E0]">{tempRates.corporate_tax}%</span>
                  <span className="text-emerald-400 font-black">
                    ({calculateIncomeAtRate(tempRates.corporate_tax, 1000).toLocaleString(
                      "id-ID"
                    )}{" "}
                    EM)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.corporate_tax}
                onChange={(e) =>
                  handleTaxChange("corporate_tax", parseInt(e.target.value))
                }
                className="w-full accent-[#00FFAA] cursor-pointer"
              />
              <p className="text-[10px] text-[#6B8A8A]">
                0% = 0 EM, 100% = 1.000 EM income
              </p>
            </div>

            {/* 3. Penghasilan - Pajak Penghasilan Pribadi */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#00FFAA] uppercase">
                <span>Pajak Penghasilan Pribadi</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#E0E0E0]">{tempRates.income_tax}%</span>
                  <span className="text-emerald-400 font-black">
                    ({calculateIncomeAtRate(tempRates.income_tax, 1000).toLocaleString(
                      "id-ID"
                    )}{" "}
                    EM)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.income_tax}
                onChange={(e) =>
                  handleTaxChange("income_tax", parseInt(e.target.value))
                }
                className="w-full accent-[#00FFAA] cursor-pointer"
              />
              <p className="text-[10px] text-[#6B8A8A]">
                0% = 0 EM, 100% = 1.000 EM income
              </p>
            </div>

            {/* 4. Cukai - Cukai */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#00FFAA] uppercase">
                <span>Cukai</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#E0E0E0]">{tempRates.cigarette_tax}%</span>
                  <span className="text-emerald-400 font-black">
                    ({calculateIncomeAtRate(tempRates.cigarette_tax, 1000).toLocaleString(
                      "id-ID"
                    )}{" "}
                    EM)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.cigarette_tax}
                onChange={(e) =>
                  handleTaxChange("cigarette_tax", parseInt(e.target.value))
                }
                className="w-full accent-[#00FFAA] cursor-pointer"
              />
              <p className="text-[10px] text-[#6B8A8A]">
                0% = 0 EM, 100% = 1.000 EM income
              </p>
            </div>

            {/* 5. Lingkungan - Pajak Lingkungan */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#00FFAA] uppercase">
                <span>Pajak Lingkungan</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#E0E0E0]">{tempRates.environment_tax}%</span>
                  <span className="text-emerald-400 font-black">
                    ({calculateIncomeAtRate(tempRates.environment_tax, 1000).toLocaleString(
                      "id-ID"
                    )}{" "}
                    EM)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.environment_tax}
                onChange={(e) =>
                  handleTaxChange("environment_tax", parseInt(e.target.value))
                }
                className="w-full accent-[#00FFAA] cursor-pointer"
              />
              <p className="text-[10px] text-[#6B8A8A]">
                0% = 0 EM, 100% = 1.000 EM income
              </p>
            </div>
          </div>

          {/* Total Income Summary */}
          <div className="mt-8 p-5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424]">
            <div className="flex justify-between items-center">
              <span className="text-sm font-black text-[#00FFAA] uppercase tracking-widest">
                Total Pendapatan Pajak
              </span>
              <span className="text-2xl font-black text-emerald-400">
                {totalIncome.toLocaleString("id-ID")} EM
              </span>
            </div>
            <p className="text-[10px] text-[#6B8A8A] font-semibold mt-2">
              Pendapatan bulanan dari semua pajak nasional
            </p>
          </div>

          {/* ---- INDEKS KEPUASAN RAKYAT ---- */}
          <div className="mt-6 p-5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424]">
            <div className="flex justify-between items-center">
              <span className="text-sm font-black text-[#00FFAA] uppercase tracking-widest">
                Indeks Kepuasan Rakyat (Pajak)
              </span>
              <span className="text-3xl font-black text-amber-400">
                {satisfaction} / 100
              </span>
            </div>
            <div className="w-full h-3 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-200"
                style={{ width: `${satisfaction}%` }}
              />
            </div>
            <p className="text-[10px] text-amber-400 font-semibold mt-3">
              {satisfaction >= 80
                ? "✅ Rakyat puas dengan beban pajak dan manfaat yang dirasakan."
                : satisfaction >= 50
                ? "⚠️ Beban pajak cukup berat, perlu perbaikan layanan publik."
                : "🔴 Pajak terlalu tinggi atau pendapatan negara kurang dirasakan manfaatnya."}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-[#E0E0E0]/80 font-semibold">
              <div>Rata-rata tarif: <span className="font-bold text-[#00FFAA]">{(tempRates.vat + tempRates.corporate_tax + tempRates.income_tax + tempRates.cigarette_tax + tempRates.environment_tax) / 5}%</span></div>
              <div>Total pendapatan: <span className="font-bold text-[#00FFAA]">{totalIncome.toLocaleString("id-ID")} EM</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}