"use client"
import React from "react";
import { BarChart3, ArrowUpRight } from "lucide-react";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { calculateGoldIncome, calculateTotalTaxIncome } from "@/app/logic/economic_logic/treasuryUpdater";
import { calculateGoldMiningDailyProduction } from "@/app/logic/economic_logic/goldIncome";
import { getGoldStateProfitSharePercent } from "@/app/page/navigasi_menu/2_navigasi_bawah/4_ekonomi/7_sistem_ekonomi/logic/nationalizationLogic";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

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
  const { language, t } = useLanguage();
  if (!isOpen) return null;
  const formatNumber = (value: number) => value.toLocaleString(language, { maximumFractionDigits: 0 });

  // Hitung pendapatan harian
  const taxRevenue = calculateTotalTaxIncome(countryDetail);
  const tourismIncome = calculateTourismIncome(countryDetail);
  const goldBuildingCount = Number(countryDetail?.emas) || 0;
  const goldDailyProduction = calculateGoldMiningDailyProduction(countryDetail);
  const goldStateIncome = calculateGoldIncome(countryDetail);
  const goldStateSharePercent = getGoldStateProfitSharePercent(countryDetail);

  const incomeItems: IncomeItem[] = [
    { label: t("navigation_economy_income.income.tax"), amount: taxRevenue },
    {
      label: goldBuildingCount > 0
        ? t("navigation_economy_income.income.goldShareUnits", { count: formatNumber(goldDailyProduction) })
        : t("navigation_economy_income.income.goldShare"),
      amount: goldStateIncome,
      displayAmount: goldBuildingCount > 0
        ? `+ ${formatNumber(goldStateIncome)}`
        : undefined,
      subtitle:
        goldBuildingCount > 0
          ? t("navigation_economy_income.income.goldShareFormula", {
              count: formatNumber(goldDailyProduction),
              percent: goldStateSharePercent,
              amount: formatNumber(goldStateIncome)
            })
          : undefined
    }
  ];

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const anggaran = countryDetail?.anggaran || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="modal-responsive-shell bg-root-surface border border-root-accent/30 rounded-2xl overflow-hidden relative font-sans pointer-events-auto flex flex-col">
        <RootInfoModalHeader
          title={t("navigation_economy_income.title")}
          onClose={onClose}
          size="standard"
          icon={<BarChart3 aria-hidden="true" className="text-root-accent" />}
        />

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto bg-root-surface p-4 custom-scrollbar sm:p-6">
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-root-canvas border border-root-accent/30 p-6 rounded-xl space-y-4">
              <h4 className="text-xs text-root-accent font-black uppercase tracking-wider mb-4">{t("navigation_economy_income.income.dailyEstimate")}</h4>
              
              <div className="space-y-3">
                {incomeItems.map((item, index) => (
                  <div key={index} className="border-b border-root-accent/10 last:border-0 pb-2">
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-400 py-2">
                      <span className="font-semibold text-root-text">{item.label}</span>
                      <span>{item.displayAmount ?? `+ ${formatNumber(item.amount)}`}</span>
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
                  <span>{t("navigation_economy_income.income.dailyTotal")}</span>
                  <span className="text-emerald-400">+ {formatNumber(totalIncome)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-black text-root-accent pt-2 px-1">
              <span className="text-root-subtle">{t("navigation_economy_income.cashBalance")}</span>
              <span className="text-root-accent">{formatNumber(anggaran)} NEO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}