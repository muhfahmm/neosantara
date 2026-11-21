"use client"
import React, { useState } from "react";
import { BarChart3, ArrowDownRight } from "lucide-react";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { ALL_DEPARTMENTS, getDailyMinistryCost } from "@/app/logic/economic_logic/departments";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface OutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
}

interface OutcomeItem {
  label: string;
  amount: number;
  color: string;
  description?: string;
}


const calculateTotalMinistryCost = (countryDetail: any) => {
  let totalCost = 0;
  
  for (const dept of ALL_DEPARTMENTS) {
    const level = countryDetail[`level_${dept.id}`] ?? 1;
    const dailyCost = getDailyMinistryCost(level);
    totalCost += dailyCost;
  }
  
  return totalCost;
};

const getMinistryIncomeByName = (name: string, countryDetail: any) => {
  const dept = ALL_DEPARTMENTS.find(d => d.id === name);
  if (!dept) return 0;
  const level = countryDetail[`level_${name}`] ?? 1;
  return getDailyMinistryCost(level);
};

export default function OutcomeModal({ isOpen, onClose, countryDetail, setCountryDetail }: OutcomeModalProps) {
  const { language, t } = useLanguage();
  const formatNumber = (value: number) => value.toLocaleString(language, { maximumFractionDigits: 0 });

  // Calculate ministry daily cost (per hari) dari SEMUA 22 department
  const ministryDailyCost = calculateTotalMinistryCost(countryDetail);
  
  // Konversi ke bulanan (30 hari) - INI adalah total pengeluaran Dewan Kabinet
  const ministryCostPerMonth = ministryDailyCost * 30;

  // Initialize budget sliders - ambil dari countryDetail atau gunakan ministryCostPerMonth sebagai default
  const [budgets, setBudgets] = useState({
    military: countryDetail?.military_budget ?? ministryCostPerMonth,
    subsidy: countryDetail?.subsidy_budget ?? ministryCostPerMonth,
    education: countryDetail?.education_budget ?? ministryCostPerMonth,
    health: countryDetail?.health_budget ?? ministryCostPerMonth,
    infrastructure: countryDetail?.infrastructure_budget ?? ministryCostPerMonth,
    asn_salary: countryDetail?.asn_salary_budget ?? ministryCostPerMonth,
    debt_interest: countryDetail?.debt_interest_budget || 0
  });
  if (!isOpen) return null;

  const handleBudgetChange = (key: string, value: number) => {
    const newBudgets = { ...budgets, [key]: value };
    setBudgets(newBudgets);

    // Update countryDetail with new budgets
    setCountryDetail({
      ...countryDetail,
      military_budget: newBudgets.military,
      subsidy_budget: newBudgets.subsidy,
      education_budget: newBudgets.education,
      health_budget: newBudgets.health,
      infrastructure_budget: newBudgets.infrastructure,
      asn_salary_budget: newBudgets.asn_salary,
      debt_interest_budget: newBudgets.debt_interest
    });
  };

  // Build outcome items dynamically
  const outcomeItems: OutcomeItem[] = [
    { label: t("navigation_economy_income.outcome.modal.military"), amount: budgets.military, color: "text-red-700", description: t("navigation_economy_income.outcome.modal.effects.military") },
    { label: t("navigation_economy_income.outcome.modal.subsidy"), amount: budgets.subsidy, color: "text-orange-700", description: t("navigation_economy_income.outcome.modal.effects.subsidy") },
    { label: t("navigation_economy_income.outcome.modal.education"), amount: budgets.education, color: "text-amber-700", description: t("navigation_economy_income.outcome.modal.effects.education") },
    { label: t("navigation_economy_income.outcome.modal.health"), amount: budgets.health, color: "text-yellow-700", description: t("navigation_economy_income.outcome.modal.effects.health") },
    { label: t("navigation_economy_income.outcome.modal.infrastructure"), amount: budgets.infrastructure, color: "text-lime-700", description: t("navigation_economy_income.outcome.modal.effects.infrastructure") },
    { label: t("navigation_economy_income.outcome.modal.civilService"), amount: budgets.asn_salary, color: "text-green-700", description: t("navigation_economy_income.outcome.modal.effects.civilService") },
    { label: t("navigation_economy_income.outcome.modal.cabinet"), amount: ministryCostPerMonth, color: "text-blue-700", description: t("navigation_economy_income.outcome.modal.effects.cabinet") }
  ];

  if (budgets.debt_interest > 0) {
    outcomeItems.push({
      label: t("navigation_economy_income.outcome.modal.debt"),
      amount: budgets.debt_interest,
      color: "text-rose-900",
      description: t("navigation_economy_income.outcome.modal.effects.debt")
    });
  }

  const totalOutcome = outcomeItems.reduce((sum, item) => sum + item.amount, 0);
  const anggaran = countryDetail?.anggaran || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="modal-responsive-shell bg-root-surface border border-root-accent/30 rounded-2xl overflow-hidden relative font-sans pointer-events-auto flex flex-col">
        <RootInfoModalHeader
          title={t("navigation_economy_income.outcome.modal.title")}
          onClose={onClose}
          size="standard"
          icon={<BarChart3 aria-hidden="true" className="text-root-accent" />}
        />

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto bg-root-surface p-4 custom-scrollbar sm:p-6">
          <div className="space-y-6 max-w-4xl">
            <p className="text-xs text-root-subtle font-semibold leading-relaxed">
              {t("navigation_economy_income.outcome.modal.description")}
            </p>

            {/* Budget Sliders */}
            <div className="space-y-6">
              {/* Pemeliharaan Militer */}
              <div className="bg-root-canvas border border-root-accent/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-root-accent uppercase">{t("navigation_economy_income.outcome.modal.military")}</h4>
                    <p className="text-[10px] text-root-subtle mt-1">{t("navigation_economy_income.outcome.modal.effects.military")}</p>
                  </div>
                  <span className="text-sm font-black text-rose-400">- {formatNumber(budgets.military)} NEO</span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="20000000"
                  value={budgets.military}
                  onChange={(e) => handleBudgetChange("military", parseInt(e.target.value))}
                  className="w-full accent-root-accent cursor-pointer"
                />
                <p className="text-[10px] text-root-subtle">1M - 20M NEO</p>
              </div>

              {/* Beban Subsidi Publik */}
              <div className="bg-root-canvas border border-root-accent/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-root-accent uppercase">{t("navigation_economy_income.outcome.modal.subsidy")}</h4>
                    <p className="text-[10px] text-root-subtle mt-1">{t("navigation_economy_income.outcome.modal.effects.subsidy")}</p>
                  </div>
                  <span className="text-sm font-black text-amber-400">- {formatNumber(budgets.subsidy)} NEO</span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="25000000"
                  value={budgets.subsidy}
                  onChange={(e) => handleBudgetChange("subsidy", parseInt(e.target.value))}
                  className="w-full accent-root-accent cursor-pointer"
                />
                <p className="text-[10px] text-root-subtle">1M - 25M NEO</p>
              </div>

              {/* Anggaran Pendidikan */}
              <div className="bg-root-canvas border border-root-accent/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-root-accent uppercase">{t("navigation_economy_income.outcome.modal.education")}</h4>
                    <p className="text-[10px] text-root-subtle mt-1">{t("navigation_economy_income.outcome.modal.effects.education")}</p>
                  </div>
                  <span className="text-sm font-black text-amber-300">- {formatNumber(budgets.education)} NEO</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15000000"
                  value={budgets.education}
                  onChange={(e) => handleBudgetChange("education", parseInt(e.target.value))}
                  className="w-full accent-root-accent cursor-pointer"
                />
                <p className="text-[10px] text-root-subtle">0 - 15M NEO</p>
              </div>

              {/* Anggaran Kesehatan */}
              <div className="bg-root-canvas border border-root-accent/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-root-accent uppercase">{t("navigation_economy_income.outcome.modal.health")}</h4>
                    <p className="text-[10px] text-root-subtle mt-1">{t("navigation_economy_income.outcome.modal.effects.health")}</p>
                  </div>
                  <span className="text-sm font-black text-yellow-400">- {formatNumber(budgets.health)} NEO</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12000000"
                  value={budgets.health}
                  onChange={(e) => handleBudgetChange("health", parseInt(e.target.value))}
                  className="w-full accent-root-accent cursor-pointer"
                />
                <p className="text-[10px] text-root-subtle">0 - 12M NEO</p>
              </div>

              {/* Anggaran Infrastruktur */}
              <div className="bg-root-canvas border border-root-accent/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-root-accent uppercase">{t("navigation_economy_income.outcome.modal.infrastructure")}</h4>
                    <p className="text-[10px] text-root-subtle mt-1">{t("navigation_economy_income.outcome.modal.effects.infrastructure")}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-400">- {formatNumber(budgets.infrastructure)} NEO</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20000000"
                  value={budgets.infrastructure}
                  onChange={(e) => handleBudgetChange("infrastructure", parseInt(e.target.value))}
                  className="w-full accent-root-accent cursor-pointer"
                />
                <p className="text-[10px] text-root-subtle">0 - 20M NEO</p>
              </div>

              {/* Gaji ASN/Birokrasi */}
              <div className="bg-root-canvas border border-root-accent/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-root-accent uppercase">{t("navigation_economy_income.outcome.modal.civilService")}</h4>
                    <p className="text-[10px] text-root-subtle mt-1">{t("navigation_economy_income.outcome.modal.effects.civilService")}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-400">- {formatNumber(budgets.asn_salary)} NEO</span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="10000000"
                  value={budgets.asn_salary}
                  onChange={(e) => handleBudgetChange("asn_salary", parseInt(e.target.value))}
                  className="w-full accent-root-accent cursor-pointer"
                />
                <p className="text-[10px] text-root-subtle">1M - 10M NEO</p>
              </div>

              {/* Biaya Operasional Dewan Kabinet - Read Only */}
              <div className="bg-root-canvas border border-root-accent/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-root-accent uppercase">{t("navigation_economy_income.outcome.modal.cabinet")}</h4>
                    <p className="text-[10px] text-root-subtle mt-1">{t("navigation_economy_income.outcome.modal.effects.cabinet")}</p>
                  </div>
                  <span className="text-sm font-black text-root-accent">- {formatNumber(ministryCostPerMonth)} NEO</span>
                </div>
                <p className="text-[10px] text-root-subtle italic">{t("navigation_economy_income.outcome.modal.autoCalculation")}</p>
                <div className="bg-root-surface border border-root-accent/20 rounded p-2">
                  <p className="text-[10px] text-root-text font-semibold">
                    {t("navigation_economy_income.outcome.modal.breakdown")}: {formatNumber(ministryCostPerMonth)} = {formatNumber(ministryCostPerMonth / 30)} × 30
                  </p>
                </div>
              </div>

              {/* Cicilan Utang - Only if debt exists */}
              {budgets.debt_interest > 0 && (
                <div className="bg-root-canvas border border-root-accent/30 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-black text-root-accent uppercase">{t("navigation_economy_income.outcome.modal.debt")}</h4>
                      <p className="text-[10px] text-root-subtle mt-1">{t("navigation_economy_income.outcome.modal.effects.debt")}</p>
                    </div>
                    <span className="text-sm font-black text-rose-400">- {formatNumber(budgets.debt_interest)} NEO</span>
                  </div>
                  <p className="text-[10px] text-root-subtle italic">{t("navigation_economy_income.outcome.modal.automaticDebt")}</p>
                </div>
              )}
            </div>

            {/* Total Summary */}
            <div className="bg-root-canvas border border-root-accent/30 p-6 rounded-xl space-y-4 mt-8">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-root-accent uppercase tracking-widest">{t("navigation_economy_income.outcome.modal.total")}</span>
                <span className="text-2xl font-black text-rose-400">- {formatNumber(totalOutcome)} NEO</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-root-accent/20">
                <span className="text-xs font-bold text-root-subtle uppercase">{t("navigation_economy_income.cashBalance")}</span>
                <span className="text-lg font-black text-root-accent">{formatNumber(anggaran)} NEO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}