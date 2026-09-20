"use client"
import React from "react";
import { X, BarChart3, ArrowUpRight } from "lucide-react";
import { calculateIncomeAtRate } from "@/app/logic/economic_logic/2_tax_logic/taxLogic";
import { calculateGoldMiningDailyProduction } from "@/app/logic/economic_logic/goldIncome";

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  selectedCountry: any;
}

interface IncomeItem {
  label: string;
  amount: number;
  subtitle?: string;
  displayAmount?: string;
}

// Helper function to calculate total tax income (daily)
// Default values HARUS SAMA dengan PajakModal.tsx untuk konsistensi data
const getTaxValue = (detail: any, fallback: number, path: string[]) => {
  let current: any = detail;
  for (const key of path) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[key];
  }
  return typeof current === "number" ? current : undefined;
};

const calculateTotalTaxIncome = (countryDetail: any) => {
  const income_tax = getTaxValue(countryDetail, 15, ["income_tax"]) ?? getTaxValue(countryDetail, 15, ["pajak", "penghasilan", "tarif"]) ?? 0;
  const corporate_tax = getTaxValue(countryDetail, 22, ["corporate"]) ?? getTaxValue(countryDetail, 22, ["pajak", "korporasi", "tarif"]) ?? 0;
  const vat = getTaxValue(countryDetail, 10, ["ppn"]) ?? getTaxValue(countryDetail, 10, ["pajak", "ppn", "tarif"]) ?? 0;
  const cigarette_tax = getTaxValue(countryDetail, 15, ["cigarette_tax"]) ?? getTaxValue(countryDetail, 15, ["pajak", "bea_cukai", "tarif"]) ?? 0;
  const environment_tax = getTaxValue(countryDetail, 5, ["environment_tax"]) ?? getTaxValue(countryDetail, 5, ["pajak", "lingkungan", "tarif"]) ?? 0;

  return (
    calculateIncomeAtRate(income_tax, 1000) +
    calculateIncomeAtRate(corporate_tax, 1000) +
    calculateIncomeAtRate(vat, 1000) +
    calculateIncomeAtRate(cigarette_tax, 1000) +
    calculateIncomeAtRate(environment_tax, 1000)
  );
};

// Helper function to calculate tourism income (fallback tanpa getTourismAttractions)
const calculateTourismIncome = (countryDetail: any) => {
  const hotels = Number(countryDetail?.hotel) || 0;
  const malls = Number(countryDetail?.mall) || 0;
  const tourismBuildings = hotels + malls;

  if (tourismBuildings > 0) {
    return tourismBuildings * 25000; // pendapatan harian per bangunan
  }

  if (typeof countryDetail?.tourism_income === "number") {
    return countryDetail.tourism_income;
  }

  return 0;
};

export default function IncomeModal({ isOpen, onClose, countryDetail }: IncomeModalProps) {
  if (!isOpen) return null;

  // Hitung pendapatan harian
  const taxRevenue = calculateTotalTaxIncome(countryDetail);
  const tourismIncome = calculateTourismIncome(countryDetail);
  const goldBuildingCount = Number(countryDetail?.emas) || 0;
  const goldDailyProduction = calculateGoldMiningDailyProduction(countryDetail);

  const incomeItems: IncomeItem[] = [
    { label: "Revenue Pajak", amount: taxRevenue },
    {
      label: goldBuildingCount > 0
        ? `Produksi Tambang Emas (${goldDailyProduction.toLocaleString('id-ID')})`
        : "Produksi Tambang Emas",
      amount: goldDailyProduction,
      displayAmount: goldBuildingCount > 0
        ? `+ ${goldDailyProduction.toLocaleString('id-ID')}`
        : undefined,
      subtitle:
        goldBuildingCount > 0
          ? `600 × ${goldBuildingCount.toLocaleString('id-ID')} bangunan = ${goldDailyProduction.toLocaleString('id-ID')}`
          : undefined
    }
  ];

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const anggaran = countryDetail?.anggaran || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] overflow-hidden relative font-sans pointer-events-auto flex flex-col">
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 flex-shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                <BarChart3 className="h-6 w-6 text-[#00FFAA]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Neraca Pemasukkan & Pengeluaran</h2>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#0F2424] relative z-10 custom-scrollbar">
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 p-6 rounded-xl space-y-4">
              <h4 className="text-xs text-[#00FFAA] font-black uppercase tracking-wider mb-4">APBN Estimasi Harian</h4>
              
              <div className="space-y-3">
                {incomeItems.map((item, index) => (
                  <div key={index} className="border-b border-[#00FFAA]/10 last:border-0 pb-2">
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-400 py-2">
                      <span className="font-semibold text-[#E0E0E0]">{item.label}</span>
                      <span>{item.displayAmount ?? `+ ${item.amount.toLocaleString("id-ID")}`}</span>
                    </div>
                    {item.subtitle && (
                      <div className="text-[10px] text-[#6B8A8A] pl-1 pb-2">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#00FFAA]/20 mt-4">
                <div className="flex justify-between items-center text-sm font-black text-[#00FFAA]">
                  <span>Total Pemasukkan Harian:</span>
                  <span className="text-emerald-400">+ {totalIncome.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-black text-[#00FFAA] pt-2 px-1">
              <span className="text-[#6B8A8A]">Total Saldo Kas Negara:</span>
              <span className="text-[#00FFAA]">{anggaran.toLocaleString("id-ID")} EM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
