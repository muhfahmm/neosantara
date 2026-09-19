"use client";

import React, { useState } from "react";
import { X, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  calculateTotalTaxIncome,
  calculateGoldIncome,
  calculateMinistryCost,
} from "@/app/logic/economic_logic/treasuryUpdater";
import { calculateGoldMiningDailyProduction, GOLD_MINING_PRODUCTION_PER_BUILDING } from "@/app/logic/economic_logic/goldIncome";
import { KEMENTERIAN, KEAMANAN, LAYANAN, Department } from "@/app/logic/economic_logic/departments";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  selectedCountry: any;
  onGotoPajak?: () => void;
  onGotoProduction?: (tab: string, key: string) => void;
}

interface FinancialItem {
  label: string;
  amount: number;
  displayAmount?: string;
  onClick?: () => void;
}

// --- PERBAIKAN: Pindahkan LEVEL_UP_COST ke sini agar bisa diakses oleh JSX ---
const LEVEL_UP_COST = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

// Helper untuk biaya harian per tab departemen
const calculateTabCostDaily = (countryDetail: any, departments: Department[]) => {
  let totalCost = 0;
  for (const dept of departments) {
    const level = countryDetail[`level_${dept.id}`] ?? 1;
    totalCost += LEVEL_UP_COST[level] ?? 100;
  }
  return totalCost;
};

// Helper untuk pendapatan pariwisata (jika diperlukan)
const calculateTourismIncome = (countryDetail: any) => {
  const hotels = Number(countryDetail?.hotel) || 0;
  const malls = Number(countryDetail?.mall) || 0;
  const tourismBuildings = hotels + malls;
  if (tourismBuildings > 0) return tourismBuildings * 25000;
  if (typeof countryDetail?.tourism_income === "number") return countryDetail.tourism_income;
  return 0;
};

// --- KOMPONEN UTAMA ---
export default function PemasukkanPengeluaranModal({ isOpen, onClose, countryDetail, selectedCountry, onGotoPajak, onGotoProduction }: ModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"summary" | "income" | "outcome">("summary");
  const [outcomeSubTab, setOutcomeSubTab] = useState<"kementerian" | "keamanan" | "layanan">("kementerian");

  const taxRevenue = calculateTotalTaxIncome(countryDetail);
  const goldIncome = calculateGoldIncome(countryDetail);
  const ministryCostPerDay = calculateMinistryCost(countryDetail);
  const tourismIncome = calculateTourismIncome(countryDetail);

  const goldBuildingCount = Number(countryDetail?.emas) || 0;
  const goldUnits = calculateGoldMiningDailyProduction(countryDetail);

  const incomeItems: FinancialItem[] = [
    { label: "Revenue Pajak", amount: taxRevenue, onClick: () => onGotoPajak?.() },
    {
      label: goldBuildingCount > 0
        ? `Produksi Tambang Emas (${goldIncome.toLocaleString('id-ID')})`
        : "Produksi Tambang Emas",
      amount: goldIncome,
      displayAmount: goldBuildingCount > 0 ? `+ ${goldUnits.toLocaleString('id-ID')} unit` : undefined,
      onClick: () => onGotoProduction?.("mineral", "emas"),
    }
  ];

  const outcomeItems: FinancialItem[] = [
    { label: "Biaya Operasional Dewan Kabinet", amount: ministryCostPerDay }
  ];

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalOutcome = outcomeItems.reduce((sum, item) => sum + item.amount, 0);
  const netBalance = totalIncome - totalOutcome;
  const anggaran = countryDetail?.anggaran || 0;

  const getOutcomeTabDepartments = () => {
    switch (outcomeSubTab) {
      case "kementerian": return KEMENTERIAN;
      case "keamanan": return KEAMANAN;
      case "layanan": return LAYANAN;
      default: return KEMENTERIAN;
    }
  };

  const currentOutcomeTabDepts = getOutcomeTabDepartments();
  const outcomeTabCostDaily = calculateTabCostDaily(countryDetail, currentOutcomeTabDepts);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />
        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#5c3c10]/10 rounded-xl border border-[#5c3c10]/20">
                <BarChart3 className="h-6 w-6 text-[#5c3c10]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Neraca Pemasukkan & Pengeluaran</h2>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation (Hanya 3 Tab) */}
        <div className="px-8 pt-6 relative z-10">
          <div className="flex gap-3 border-b-2 border-[#C4B49C]/30 pb-1">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "summary"
                  ? "bg-[#5c3c10] text-[#FAF6EE] shadow-lg shadow-[#5c3c10]/20"
                  : "text-[#8b7e66] hover:text-[#5c3c10] hover:bg-[#5c3c10]/5"
              }`}
            >
              Ringkasan APBN
            </button>
            <button
              onClick={() => setActiveTab("income")}
              className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "income"
                  ? "bg-[#5c3c10] text-[#FAF6EE] shadow-lg shadow-[#5c3c10]/20"
                  : "text-[#8b7e66] hover:text-[#5c3c10] hover:bg-[#5c3c10]/5"
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Pemasukkan
            </button>
            <button
              onClick={() => setActiveTab("outcome")}
              className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "outcome"
                  ? "bg-[#5c3c10] text-[#FAF6EE] shadow-lg shadow-[#5c3c10]/20"
                  : "text-[#8b7e66] hover:text-[#5c3c10] hover:bg-[#5c3c10]/5"
              }`}
            >
              <ArrowDownRight className="h-3.5 w-3.5" />
              Pengeluaran
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar">
          <div className="space-y-6 max-w-3xl mx-auto">
            
            {/* Summary Tab */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                <div className="bg-[#e4dac3]/20 border border-[#C4B49C]/30 p-6 rounded-xl space-y-4">
                  <h4 className="text-[10px] text-[#5c3c10] font-black uppercase tracking-wider mb-4">APBN Estimasi Bulanan</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-700 py-2 border-b border-[#C4B49C]/20">
                      <span className="flex items-center gap-2">
                        <ArrowUpRight className="h-3 w-3" /> Pemasukkan
                      </span>
                      <span>+ {totalIncome.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-rose-700 py-2 border-b border-[#C4B49C]/20">
                      <span className="flex items-center gap-2">
                        <ArrowDownRight className="h-3 w-3" /> Pengeluaran
                      </span>
                      <span>- {totalOutcome.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-[#C4B49C]/30">
                    <div className="flex justify-between items-center text-sm font-black text-[#5c3c10]">
                      <span>Netto Saldo (Pemasukkan - Pengeluaran):</span>
                      <span className={`${netBalance >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {netBalance >= 0 ? "+ " : "- "}{Math.abs(netBalance).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-black text-[#5c3c10] pt-2 px-1">
                  <span>Total Saldo Kas Negara:</span>
                  <span>{anggaran.toLocaleString("id-ID")} EM</span>
                </div>
              </div>
            )}

            {/* Income Tab */}
            {activeTab === "income" && (
              <div className="space-y-4">
                <div className="bg-[#e4dac3]/20 border border-[#C4B49C]/30 p-6 rounded-xl space-y-4">
                  <h4 className="text-[10px] text-[#5c3c10] font-black uppercase tracking-wider mb-4">APBN Estimasi Bulanan</h4>
                  <div className="space-y-3">
                    {incomeItems.map((item, index) => (
                      <div key={index} className="border-b border-[#C4B49C]/20 last:border-0 pb-2">
                        <div
                          onClick={item.onClick}
                          className={`flex justify-between items-center text-xs font-bold text-emerald-700 py-2 transition-colors rounded px-1 ${item.onClick ? 'cursor-pointer hover:bg-[#e4dac3]/20' : ''}`}
                        >
                          <span className="font-semibold">{item.label}</span>
                          <span>{item.displayAmount ?? `+ ${item.amount.toLocaleString("id-ID")}`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t-2 border-[#C4B49C]/30 mt-4">
                    <div className="flex justify-between items-center text-sm font-black text-[#5c3c10]">
                      <span>Total Pemasukkan:</span>
                      <span className="text-emerald-700">+ {totalIncome.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-black text-[#5c3c10] pt-2 px-1">
                  <span>Total Saldo Kas Negara:</span>
                  <span>{anggaran.toLocaleString("id-ID")} EM</span>
                </div>
              </div>
            )}

            {/* Outcome Tab */}
            {activeTab === "outcome" && (
              <div className="space-y-4">
                <div className="flex gap-2 border-b-2 border-[#C4B49C]/30 pb-2">
                  <button
                    onClick={() => setOutcomeSubTab("kementerian")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      outcomeSubTab === "kementerian" ? "bg-[#5c3c10] text-[#FAF6EE]" : "text-[#8b7e66] hover:text-[#5c3c10]"
                    }`}
                  >
                    Kementerian (15)
                  </button>
                  <button
                    onClick={() => setOutcomeSubTab("keamanan")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      outcomeSubTab === "keamanan" ? "bg-[#5c3c10] text-[#FAF6EE]" : "text-[#8b7e66] hover:text-[#5c3c10]"
                    }`}
                  >
                    Keamanan (5)
                  </button>
                  <button
                    onClick={() => setOutcomeSubTab("layanan")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      outcomeSubTab === "layanan" ? "bg-[#5c3c10] text-[#FAF6EE]" : "text-[#8b7e66] hover:text-[#5c3c10]"
                    }`}
                  >
                    Layanan (2)
                  </button>
                </div>

                <div className="bg-[#e4dac3]/20 border border-[#C4B49C]/30 p-6 rounded-xl space-y-4">
                  <h4 className="text-[10px] text-[#5c3c10] font-black uppercase tracking-wider mb-4">
                    {outcomeSubTab === "kementerian" ? "Kementerian" : outcomeSubTab === "keamanan" ? "Keamanan" : "Layanan"}
                  </h4>
                  <div className="space-y-3">
                    {currentOutcomeTabDepts.map((dept, index) => {
                      const level = countryDetail[`level_${dept.id}`] ?? 1;
                      const dailyCost = LEVEL_UP_COST[level] ?? 100; // ERROR INI SEKARANG SUDAH TERDEFINISI
                      const Icon = dept.icon;
                      return (
                        <div key={index} className="flex justify-between items-center text-xs font-bold text-rose-700 py-2 border-b border-[#C4B49C]/20 last:border-0">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-[#8b7e66]" />
                            <span className="font-semibold text-[#5c3c10]">{dept.name}</span>
                            <span className="text-[10px] text-[#8b7e66]">(Level {level})</span>
                          </div>
                          <span>- {dailyCost.toLocaleString("id-ID")}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-4 border-t-2 border-[#C4B49C]/30 mt-4">
                    <div className="flex justify-between items-center text-sm font-black text-[#5c3c10]">
                      <span>Subtotal {outcomeSubTab === "kementerian" ? "Kementerian" : outcomeSubTab === "keamanan" ? "Keamanan" : "Layanan"}:</span>
                      <span className="text-rose-700">- {outcomeTabCostDaily.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#e4dac3]/20 border border-[#C4B49C]/30 p-6 rounded-xl space-y-2">
                  <div className="pt-4 border-t-2 border-[#C4B49C]/30">
                    <div className="flex justify-between items-center text-sm font-black text-[#5c3c10]">
                      <span>Total Pengeluaran Dewan Kabinet:</span>
                      <span className="text-rose-700">- {totalOutcome.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-black text-[#5c3c10] pt-2 px-1">
                  <span>Total Saldo Kas Negara:</span>
                  <span>{anggaran.toLocaleString("id-ID")} EM</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}