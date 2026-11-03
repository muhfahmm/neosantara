"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BarChart3, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import RootModalTabs from "@/app/page/root_modals_design_menu/RootModalTabs";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import {
  calculateTotalTaxIncome,
  calculateGoldIncome,
  calculateMinistryCost,
  getDepartmentLevel,
  getBaseTourismIncome,
  getTourismTotalIncome,
  getCommercialTotalIncome,
  calculateActiveSubsidyCost,
} from "@/app/logic/economic_logic/treasuryUpdater";
import { calculateGoldMiningDailyProduction } from "@/app/logic/economic_logic/goldIncome";
import { CABINET_DEPARTMENT_IMAGES, KEMENTERIAN, KEAMANAN, LAYANAN, Department, getDailyMinistryCost } from "@/app/logic/economic_logic/departments";
import AlokasiSubsidiTab from "./alokasi_subsidi/AlokasiSubsidiTab";
import { ORTHODOX_PERSONAL_INCOME_TAX_REVENUE_BONUS } from "@/app/page/bonus_logic/agama_bonus_logic/kristen";
import { BUDDHA_ENVIRONMENTAL_TAX_REVENUE_BONUS } from "@/app/page/bonus_logic/agama_bonus_logic/buddha";
import {
  DEMOCRACY_TAX_REVENUE_BONUS,
} from "@/app/page/bonus_logic/ideologi_bonus_logic/demokrasi";
import { CAPITALISM_TAX_REVENUE_BONUS } from "@/app/page/bonus_logic/ideologi_bonus_logic/kapitalisme";
import { LIBERALISM_TAX_REVENUE_BONUS } from "@/app/page/bonus_logic/ideologi_bonus_logic/liberalisme";
import { CONSERVATISM_TAX_REVENUE_BONUS } from "@/app/page/bonus_logic/ideologi_bonus_logic/konservatisme";
import {
  isMemberOfEU,
  isMemberOfBRICS,
  isMemberOfG20,
  getKementerianPariwisataIncomeBonusPercent,
} from "@/app/page/bonus_logic";
import { getGoldStateProfitSharePercent } from "../7_sistem_ekonomi/logic/nationalizationLogic";

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
  baseAmount?: number;
  displayAmount?: string;
  badge?: string;
  onClick?: () => void;
}

// Helper untuk biaya harian per tab departemen
const calculateTabCostDaily = (countryDetail: any, departments: Department[]) => {
  let totalCost = 0;
  for (const dept of departments) {
    const level = getDepartmentLevel(countryDetail, dept);
    totalCost += getDailyMinistryCost(level);
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
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "income" | "outcome">("summary");
  const [outcomeMainTab, setOutcomeMainTab] = useState<"kabinet" | "subsidi" | "total">("kabinet");
  const [kabinetSubTab, setKabinetSubTab] = useState<"kementerian" | "keamanan" | "layanan">("kementerian");

  if (!isOpen) return null;

  const taxRevenue = calculateTotalTaxIncome(countryDetail);
  const goldIncome = calculateGoldIncome(countryDetail);
  const baseTourismIncome = getBaseTourismIncome(countryDetail);
  const tourismIncome = getTourismTotalIncome(countryDetail);
  const commercialIncome = getCommercialTotalIncome(countryDetail);
  const ministryCostPerDay = calculateMinistryCost(countryDetail);
  const totalSubsidyCost = calculateActiveSubsidyCost(countryDetail);

  const pariwisataBonusPercent = getKementerianPariwisataIncomeBonusPercent(countryDetail);

  const goldBuildingCount = Number(countryDetail?.emas) || 0;
  const goldUnits = calculateGoldMiningDailyProduction(countryDetail);
  const goldStateSharePercent = getGoldStateProfitSharePercent(countryDetail);
  const mallCount = Number(countryDetail?.mall ?? countryDetail?.pusat_belanja ?? countryDetail?.pusat_perbelanjaan ?? 0);
  const hotelCount = Number(countryDetail?.hotel ?? 0);
  const grosirCount = Number(countryDetail?.pusat_grosir_tekstil ?? countryDetail?.pusat_grosir ?? 0);
  const commercialCount = mallCount + hotelCount + grosirCount;
  const tourismCount = Number(countryDetail?.total_tempat_wisata ?? (Array.isArray(countryDetail?.tempat_wisata) ? countryDetail.tempat_wisata.length : 0));

  const ideology = String(countryDetail?.ideology || "").trim().toLowerCase();
  const ideologyTaxBadge = ideology === "demokrasi"
    ? `Bonus Demokrasi: penerimaan seluruh pajak +${DEMOCRACY_TAX_REVENUE_BONUS * 100}%`
    : ideology === "kapitalisme"
      ? `Bonus Kapitalisme: penerimaan seluruh pajak +${CAPITALISM_TAX_REVENUE_BONUS * 100}%`
      : ideology === "liberalisme"
        ? `Bonus Liberalisme: penerimaan seluruh pajak +${LIBERALISM_TAX_REVENUE_BONUS * 100}%`
        : ideology === "konservatisme"
          ? `Bonus Konservatisme: penerimaan seluruh pajak +${CONSERVATISM_TAX_REVENUE_BONUS * 100}%`
          : undefined;
  const religionTaxBadge = String(countryDetail?.religion || "").trim().toLowerCase() === "kristen ortodoks"
    ? `Bonus Kristen Ortodoks: Penerimaan pajak pribadi +${ORTHODOX_PERSONAL_INCOME_TAX_REVENUE_BONUS * 100}%`
    : String(countryDetail?.religion || "").trim().toLowerCase() === "buddha"
      ? `Bonus Buddha: Penerimaan pajak lingkungan +${BUDDHA_ENVIRONMENTAL_TAX_REVENUE_BONUS * 100}%`
      : undefined;

  const countryName = String(countryDetail?.country || countryDetail?.nama || "").trim();
  const euTaxBadge = isMemberOfEU(countryName) ? "Bonus EU: Penerimaan Pajak +10%" : undefined;
  const bricsTaxBadge = isMemberOfBRICS(countryName) ? "Bonus BRICS: Penerimaan Pajak +10%" : undefined;
  const g20TaxBadge = isMemberOfG20(countryName) ? "Bonus G20: Penerimaan Pajak +20%" : undefined;

  const incomeItems: FinancialItem[] = [
    {
      label: "Revenue Pajak Nasional",
      amount: taxRevenue,
      badge: [ideologyTaxBadge, religionTaxBadge, euTaxBadge, bricsTaxBadge, g20TaxBadge].filter(Boolean).join(" | ") || undefined,
      onClick: () => onGotoPajak?.()
    },
    {
      label: `Sektor Komersial (${commercialCount} Gedung)`,
      amount: commercialIncome,
      badge: commercialCount > 0 ? `Mall: ${mallCount}, Hotel: ${hotelCount}, Grosir: ${grosirCount}` : undefined,
    },
    {
      label: `Sektor Wisata & Pariwisata (${tourismCount} Destinasi)`,
      amount: tourismIncome,
      baseAmount: baseTourismIncome,
      badge: [
        tourismCount > 0 ? `${tourismCount} Destinasi Wisata Terdaftar` : undefined,
        pariwisataBonusPercent > 0 ? `+Kem. Pariwisata (${pariwisataBonusPercent.toFixed(1)}%)` : undefined
      ].filter(Boolean).join(" | ") || undefined,
    },
    {
      label: goldBuildingCount > 0
        ? `Bagian Negara Tambang Emas (${goldUnits.toLocaleString('id-ID', { maximumFractionDigits: 0 })} unit)`
        : "Bagian Negara Tambang Emas",
      amount: goldIncome,
      displayAmount: goldBuildingCount > 0 ? `+ ${goldIncome.toLocaleString('id-ID', { maximumFractionDigits: 0 })} NEO` : undefined,
      badge: goldBuildingCount > 0 ? `Bagian negara ${goldStateSharePercent}%` : undefined,
      onClick: () => onGotoProduction?.("mineral", "emas"),
    }
  ];

  const outcomeItems: FinancialItem[] = [
    { label: "Biaya Operasional Dewan Kabinet", amount: ministryCostPerDay },
    { label: "Alokasi Kebijakan Subsidi", amount: totalSubsidyCost }
  ];

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalOutcome = outcomeItems.reduce((sum, item) => sum + item.amount, 0);
  const netBalance = totalIncome - totalOutcome;
  const anggaran = countryDetail?.anggaran || 0;

  const getOutcomeTabDepartments = () => {
    switch (kabinetSubTab) {
      case "kementerian": return KEMENTERIAN;
      case "keamanan": return KEAMANAN;
      case "layanan": return LAYANAN;
      default: return KEMENTERIAN;
    }
  };

  const currentOutcomeTabDepts = getOutcomeTabDepartments();
  const outcomeTabCostDaily = calculateTabCostDaily(countryDetail, currentOutcomeTabDepts);

  return (
    <>
    {!isInfoOpen && <NotebookModalWrapper onClose={onClose}>
      <div className="flex flex-col h-full overflow-hidden">

        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div className="min-w-0">
              <h2 className={rootModalTypography.title}>Neraca Pemasukkan & Pengeluaran</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsInfoOpen(true)} title="Informasi neraca pemasukan dan pengeluaran" aria-label="Informasi neraca pemasukan dan pengeluaran" className="flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#00FFAA]/50 bg-[#0A1A1A] p-1 text-[#00FFAA] transition-all hover:bg-[#00FFAA] hover:text-[#0A1A1A]">
              <Info className="h-3.5 w-3.5" />
            </button>
            <RootModalCloseButton onClick={onClose} />
          </div>
        </div>

        {/* Tab Navigation (Hanya 3 Tab) */}
        <div className="px-4 lg:px-6 2xl:px-8 pt-3.5 lg:pt-4.5 2xl:pt-6 relative z-10 bg-[#0A1A1A]">
          <RootModalTabs
            items={[
              { label: "Ringkasan PDB", isActive: activeTab === "summary", onClick: () => setActiveTab("summary") },
              { label: "Pemasukkan", isActive: activeTab === "income", onClick: () => setActiveTab("income"), icon: <ArrowUpRight className="h-3.5 w-3.5" /> },
              { label: "Pengeluaran", isActive: activeTab === "outcome", onClick: () => setActiveTab("outcome"), icon: <ArrowDownRight className="h-3.5 w-3.5" /> },
            ]}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#0A1A1A]/80 relative z-10 neon-scrollbar">
          <div className="space-y-6 max-w-3xl mx-auto">

            {/* Summary Tab */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                <div className={`space-y-4 border border-[#00FFAA]/30 bg-[#0F2424] p-6 ${rootBorderRadius.card}`}>
                  <h4 className="text-[10px] text-[#00FFAA] font-black uppercase tracking-wider mb-2">
                    Rincian Aliran Saldo & PDB Negara
                  </h4>
                  <div className="space-y-4">
                    {/* Section Pemasukkan */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-black text-emerald-400 pb-1 border-b border-[#00FFAA]/20">
                        <span className="flex items-center gap-2">
                          <ArrowUpRight className="h-4 w-4" /> Rincian Pemasukkan (Pendapatan Negara)
                        </span>
                        <span>+ {totalIncome.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="pl-4 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-[#E0E0E0]">
                          <span className="font-semibold">• Revenue Pajak Nasional:</span>
                          <span className="font-bold text-emerald-400">+ {taxRevenue.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#E0E0E0]">
                          <span className="font-semibold">• Sektor Komersial ({commercialCount} Gedung):</span>
                          <span className="font-bold text-emerald-400">+ {commercialIncome.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#E0E0E0]">
                          <span className="font-semibold">• Sektor Wisata & Pariwisata ({tourismCount} Destinasi):</span>
                          <span className="font-bold text-emerald-400">
                            {baseTourismIncome > 0 && tourismIncome > baseTourismIncome && (
                              <span className="mr-1.5 text-rose-400 line-through">
                                + {baseTourismIncome.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                              </span>
                            )}
                            + {tourismIncome.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[#E0E0E0]">
                          <span className="font-semibold">• Produksi Tambang Emas ({goldBuildingCount} Unit):</span>
                          <span className="font-bold text-emerald-400">+ {goldIncome.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section Pengeluaran */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs font-black text-rose-400 pb-1 border-b border-[#00FFAA]/20">
                        <span className="flex items-center gap-2">
                          <ArrowDownRight className="h-4 w-4" /> Rincian Pengeluaran (Beban Negara)
                        </span>
                        <span>- {totalOutcome.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="pl-4 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-[#E0E0E0]">
                          <span className="font-semibold">• Biaya Operasional Dewan Kabinet (22 Departemen):</span>
                          <span className="font-bold text-rose-400">- {ministryCostPerDay.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#E0E0E0]">
                          <span className="font-semibold">• Alokasi Kebijakan Subsidi (6 Pos Kebutuhan):</span>
                          <span className="font-bold text-rose-400">- {totalSubsidyCost.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#00FFAA]/30">
                    <div className="flex justify-between items-center text-sm font-black text-[#E0E0E0]">
                      <span>Netto Saldo Harian (Pemasukkan - Pengeluaran):</span>
                      <span className={`${netBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {netBalance >= 0 ? "+ " : "- "}{Math.abs(netBalance).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-black text-[#E0E0E0] pt-2 px-1">
                  <span className="text-[#6B8A8A]">Total Saldo Kas Negara:</span>
                  <span className="text-[#00FFAA]">{anggaran.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
                </div>
              </div>
            )}

            {/* Income Tab */}
            {activeTab === "income" && (
              <div className="space-y-4">
                <div className={`space-y-4 border border-[#00FFAA]/30 bg-[#0F2424] p-6 ${rootBorderRadius.card}`}>
                  <div className="space-y-3">
                    {incomeItems.map((item, index) => (
                      <div key={index} className="border-b border-[#00FFAA]/20 last:border-0 pb-2">
                        <div
                          onClick={item.onClick}
                          className={`flex justify-between items-center text-xs font-bold text-emerald-400 py-2 transition-colors rounded px-1 ${item.onClick ? 'cursor-pointer hover:bg-[#00FFAA]/10' : ''}`}
                        >
                          <span className="flex items-center gap-2 font-semibold text-[#E0E0E0]">
                            {item.label}
                            {item.badge && (
                              <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-emerald-400">
                                {item.badge}
                              </span>
                            )}
                          </span>
                          <span>
                            {item.baseAmount !== undefined && item.baseAmount > 0 && item.amount > item.baseAmount && (
                              <span className="mr-1.5 text-rose-400 line-through">
                                + {item.baseAmount.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                              </span>
                            )}
                            {item.displayAmount ?? `+ ${item.amount.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-[#00FFAA]/30 mt-4">
                    <div className="flex justify-between items-center text-sm font-black text-[#E0E0E0]">
                      <span>Total Pemasukkan:</span>
                      <span className="text-emerald-400">+ {totalIncome.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-black text-[#E0E0E0] pt-2 px-1">
                  <span className="text-[#6B8A8A]">Total Saldo Kas Negara:</span>
                  <span className="text-[#00FFAA]">{anggaran.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
                </div>
              </div>
            )}

            {/* Outcome Tab */}
            {activeTab === "outcome" && (
              <div className="space-y-5">
                {/* Top Level Tabs: Kabinet (22), Alokasi Subsidi (6), Total Pengeluaran */}
                <RootModalTabs
                  items={[
                    { label: "Kabinet (22)", isActive: outcomeMainTab === "kabinet", onClick: () => setOutcomeMainTab("kabinet") },
                    { label: "Alokasi Subsidi (6)", isActive: outcomeMainTab === "subsidi", onClick: () => setOutcomeMainTab("subsidi") },
                    { label: "Total Pengeluaran", isActive: outcomeMainTab === "total", onClick: () => setOutcomeMainTab("total") },
                  ]}
                />

                {outcomeMainTab === "subsidi" ? (
                  <AlokasiSubsidiTab countryDetail={countryDetail} />
                ) : outcomeMainTab === "total" ? (
                  <div className="space-y-4">
                    <div className={`space-y-4 border border-[#00FFAA]/30 bg-[#0F2424] p-6 ${rootBorderRadius.card}`}>
                      <h4 className="text-[10px] text-[#00FFAA] font-black uppercase tracking-wider mb-4">
                        Ringkasan Total Pengeluaran Negara
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-rose-400 py-2 border-b border-[#00FFAA]/20">
                          <span className="font-semibold text-[#E0E0E0]">1. Biaya Operasional Kabinet (22)</span>
                          <span>- {ministryCostPerDay.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="pl-4 space-y-1 text-[11px] text-[#6B8A8A]">
                          <div className="flex justify-between">
                            <span>• Subtotal Kementerian (15):</span>
                            <span>- {calculateTabCostDaily(countryDetail, KEMENTERIAN).toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Subtotal Keamanan (5):</span>
                            <span>- {calculateTabCostDaily(countryDetail, KEAMANAN).toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Subtotal Layanan (2):</span>
                            <span>- {calculateTabCostDaily(countryDetail, LAYANAN).toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold text-rose-400 py-2 border-b border-[#00FFAA]/20 pt-3">
                          <span className="font-semibold text-[#E0E0E0]">2. Alokasi Kebijakan Subsidi (6)</span>
                          <span>- {totalSubsidyCost.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#00FFAA]/30 mt-4">
                        <div className="flex justify-between items-center text-sm font-black text-[#E0E0E0]">
                          <span>Grand Total Pengeluaran (Kabinet + Subsidi):</span>
                          <span className="text-rose-400">- {totalOutcome.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Sub-tabs under Kabinet: Kementerian (15), Keamanan (5), Layanan (2) */}
                    <div className="flex gap-2 border-b border-[#00FFAA]/10 pb-2">
                      <button
                        onClick={() => setKabinetSubTab("kementerian")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${kabinetSubTab === "kementerian"
                            ? "bg-[#00FFAA] text-[#0A1A1A]"
                            : "bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#E0E0E0] border border-[#00FFAA]/20"
                          }`}
                      >
                        Kementerian (15)
                      </button>
                      <button
                        onClick={() => setKabinetSubTab("keamanan")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${kabinetSubTab === "keamanan"
                            ? "bg-[#00FFAA] text-[#0A1A1A]"
                            : "bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#E0E0E0] border border-[#00FFAA]/20"
                          }`}
                      >
                        Keamanan (5)
                      </button>
                      <button
                        onClick={() => setKabinetSubTab("layanan")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${kabinetSubTab === "layanan"
                            ? "bg-[#00FFAA] text-[#0A1A1A]"
                            : "bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#E0E0E0] border border-[#00FFAA]/20"
                          }`}
                      >
                        Layanan (2)
                      </button>
                    </div>

                    <div className={`space-y-4 border border-[#00FFAA]/30 bg-[#0F2424] p-6 ${rootBorderRadius.card}`}>
                      <h4 className="text-[10px] text-[#00FFAA] font-black uppercase tracking-wider mb-4">
                        {kabinetSubTab === "kementerian" ? "Kementerian" : kabinetSubTab === "keamanan" ? "Keamanan" : "Layanan"}
                      </h4>
                      <div className="space-y-3">
                        {currentOutcomeTabDepts.map((dept, index) => {
                          const level = getDepartmentLevel(countryDetail, dept);
                          const dailyCost = getDailyMinistryCost(level);
                          const Icon = dept.icon;
                          const cabinetImage = CABINET_DEPARTMENT_IMAGES[dept.id];
                          return (
                            <div key={index} className="flex justify-between items-center text-xs font-bold text-rose-400 py-2 border-b border-[#00FFAA]/20 last:border-0">
                              <div className="flex min-w-0 items-center gap-2">
                                {cabinetImage ? (
                                  <Image
                                    src={`/images/game/interface/sub-tabs/kementerian/dewan-kabinet/${cabinetImage}.svg`}
                                    alt=""
                                    aria-hidden="true"
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 shrink-0 object-contain"
                                  />
                                ) : (
                                  <Icon className="h-4 w-4 shrink-0 text-[#6B8A8A]" />
                                )}
                                <span className="font-semibold text-[#E0E0E0]">{dept.name}</span>
                                <span className="text-[10px] text-[#6B8A8A]">(Level {level})</span>
                              </div>
                              <span>- {dailyCost.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="pt-4 border-t border-[#00FFAA]/30 mt-4">
                        <div className="flex justify-between items-center text-sm font-black text-[#E0E0E0]">
                          <span>Subtotal {kabinetSubTab === "kementerian" ? "Kementerian" : kabinetSubTab === "keamanan" ? "Keamanan" : "Layanan"}:</span>
                          <span className="text-rose-400">- {outcomeTabCostDaily.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`space-y-2 border border-[#00FFAA]/30 bg-[#0F2424] p-6 ${rootBorderRadius.card}`}>
                      <div className="pt-2">
                        <div className="flex justify-between items-center text-sm font-black text-[#E0E0E0]">
                          <span>Total Pengeluaran Dewan Kabinet:</span>
                          <span className="text-rose-400">- {ministryCostPerDay.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs font-black text-[#E0E0E0] pt-2 px-1">
                  <span className="text-[#6B8A8A]">Total Saldo Kas Negara:</span>
                  <span className="text-[#00FFAA]">{anggaran.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </NotebookModalWrapper>}
    <MenuInfoModal
      isOpen={isInfoOpen}
      onClose={() => setIsInfoOpen(false)}
      title="Informasi Neraca Pemasukan & Pengeluaran"
      description="Tinjau sumber pemasukan negara dan rincian pengeluaran, termasuk dampaknya pada saldo dan PDB. Gunakan tab Ringkasan PDB, Pemasukan, dan Pengeluaran untuk melihat setiap bagian anggaran."
    />
    </>
  );
}