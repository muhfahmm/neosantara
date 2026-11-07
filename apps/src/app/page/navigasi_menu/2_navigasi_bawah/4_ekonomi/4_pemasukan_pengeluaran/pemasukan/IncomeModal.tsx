"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from "react";
import { X, BarChart3, ArrowUpRight } from "lucide-react";
import { calculateGoldIncome, calculateTotalTaxIncome } from "@/app/logic/economic_logic/treasuryUpdater";
import { calculateGoldMiningDailyProduction } from "@/app/logic/economic_logic/goldIncome";
import { getGoldStateProfitSharePercent } from "@/app/page/navigasi_menu/2_navigasi_bawah/4_ekonomi/7_sistem_ekonomi/logic/nationalizationLogic";

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
  const goldStateIncome = calculateGoldIncome(countryDetail);
  const goldStateSharePercent = getGoldStateProfitSharePercent(countryDetail);

  const incomeItems: IncomeItem[] = [
    { label: "Revenue Pajak", amount: taxRevenue },
    {
      label: goldBuildingCount > 0
        ? `Bagian Negara dari Tambang Emas (${goldDailyProduction.toLocaleString('id-ID', { maximumFractionDigits: 0 })} unit)`
        : "Bagian Negara dari Tambang Emas",
      amount: goldStateIncome,
      displayAmount: goldBuildingCount > 0
        ? `+ ${goldStateIncome.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`
        : undefined,
      subtitle:
        goldBuildingCount > 0
          ? `${goldDailyProduction.toLocaleString('id-ID', { maximumFractionDigits: 0 })} unit × ${goldStateSharePercent}% bagian negara = ${goldStateIncome.toLocaleString('id-ID', { maximumFractionDigits: 0 })} NEO/hari`
          : undefined
    }
  ];

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const anggaran = countryDetail?.anggaran || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="modal-responsive-shell bg-root-surface border border-root-accent/30 rounded-2xl overflow-hidden relative font-sans pointer-events-auto flex flex-col">
        <div className="px-6 py-4 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas relative z-10 flex-shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-root-surface rounded-xl border border-root-accent/30">
                <BarChart3 className="h-6 w-6 text-root-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-root-accent tracking-tight leading-none uppercase">Neraca Pemasukkan & Pengeluaran</h2>
              </div>
            </div>
          </div>
          <SharedModalCloseButton onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5" appearance="custom">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </SharedModalCloseButton>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-root-surface relative z-10 custom-scrollbar">
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-root-canvas border border-root-accent/30 p-6 rounded-xl space-y-4">
              <h4 className="text-xs text-root-accent font-black uppercase tracking-wider mb-4">APBN Estimasi Harian</h4>
              
              <div className="space-y-3">
                {incomeItems.map((item, index) => (
                  <div key={index} className="border-b border-root-accent/10 last:border-0 pb-2">
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-400 py-2">
                      <span className="font-semibold text-root-text">{item.label}</span>
                      <span>{item.displayAmount ?? `+ ${item.amount.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`}</span>
                    </div>
                    {item.subtitle && (
                      <div className="text-[10px] text-root-subtle pl-1 pb-2">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-root-accent/20 mt-4">
                <div className="flex justify-between items-center text-sm font-black text-root-accent">
                  <span>Total Pemasukkan Harian:</span>
                  <span className="text-emerald-400">+ {totalIncome.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-black text-root-accent pt-2 px-1">
              <span className="text-root-subtle">Total Saldo Kas Negara:</span>
              <span className="text-root-accent">{anggaran.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}