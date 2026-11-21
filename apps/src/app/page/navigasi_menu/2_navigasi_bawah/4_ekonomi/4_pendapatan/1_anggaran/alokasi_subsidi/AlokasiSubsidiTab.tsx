"use client";

import React, { useState, useEffect } from "react";
import { Zap, Utensils, GraduationCap, Bus, Store, ShieldAlert } from "lucide-react";
import { INITIAL_SUBSIDY_ITEMS, SubsidyItem, clampSubsidyCost } from "../../../../../../../../../../json/5_database_kebijakan_subsidi/index";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface AlokasiSubsidiTabProps {
  countryDetail: any;
}

const resolveSubsidyItemsForCountry = (countryDetail: any): SubsidyItem[] => {
  if (countryDetail?.subsidy_states) {
    return INITIAL_SUBSIDY_ITEMS.map((item) => ({
      ...item,
      budgetCost: clampSubsidyCost(item.budgetCost),
      isSubsidized: (countryDetail.subsidy_states as Record<string, boolean>)[item.id] ?? item.isSubsidized,
    }));
  }

  return INITIAL_SUBSIDY_ITEMS.map((item) => ({
    ...item,
    budgetCost: clampSubsidyCost(item.budgetCost),
  }));
};

const CATEGORIES = [
  { id: "Energi", label: "ENERGI", icon: Zap },
  { id: "Pangan", label: "PANGAN", icon: Utensils },
  { id: "Pendidikan & Kesehatan", label: "PENDIDIKAN & KESEHATAN", icon: GraduationCap },
  { id: "Transportasi & Perumahan", label: "TRANSPORTASI & PERUMAHAN", icon: Bus },
  { id: "UMKM & Ekonomi", label: "UMKM & EKONOMI", icon: Store },
  { id: "Perlindungan Sosial", label: "PERLINDUNGAN SOSIAL", icon: ShieldAlert },
];

export default function AlokasiSubsidiTab({ countryDetail }: AlokasiSubsidiTabProps) {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("Energi");
  const [subsidyItems, setSubsidyItems] = useState<SubsidyItem[]>(() => resolveSubsidyItemsForCountry(countryDetail));

  useEffect(() => {
    setSubsidyItems(resolveSubsidyItemsForCountry(countryDetail));
  }, [countryDetail?.slug, countryDetail?.country_slug, countryDetail?.name, countryDetail?.name_id, countryDetail?.subsidy_states]);

  const filteredItems = subsidyItems.filter((i) => i.category === activeCategory);
  const subtotalCost = filteredItems
    .filter((i) => i.isSubsidized)
    .reduce((sum, i) => sum + i.budgetCost, 0);

  const totalOverallCost = subsidyItems
    .filter((i) => i.isSubsidized)
    .reduce((sum, i) => sum + i.budgetCost, 0);

  const activeCount = filteredItems.filter((i) => i.isSubsidized).length;
  const totalCategoryCount = filteredItems.length;
  const categoryLabels: Record<string, string> = {
    Energi: t("navigation_economy_income.subsidies.categories.energy"),
    Pangan: t("navigation_economy_income.subsidies.categories.food"),
    "Pendidikan & Kesehatan": t("navigation_economy_income.subsidies.categories.educationHealth"),
    "Transportasi & Perumahan": t("navigation_economy_income.subsidies.categories.transportHousing"),
    "UMKM & Ekonomi": t("navigation_economy_income.subsidies.categories.smallBusiness"),
    "Perlindungan Sosial": t("navigation_economy_income.subsidies.categories.socialProtection"),
  };
  const subsidyNames: Record<string, string> = {
    sub_bbm: t("navigation_economy_income.subsidies.items.fuel"),
    sub_listrik: t("navigation_economy_income.subsidies.items.electricity"),
    sub_lpg: t("navigation_economy_income.subsidies.items.cookingGas"),
    sub_pdam: t("navigation_economy_income.subsidies.items.water"),
    sub_pupuk: t("navigation_economy_income.subsidies.items.fertilizer"),
    sub_sembako: t("navigation_economy_income.subsidies.items.staplePrice"),
    sub_bantuan_pangan: t("navigation_economy_income.subsidies.items.emergencyFood"),
    sub_pendidikan: t("navigation_economy_income.subsidies.items.education"),
    sub_bpjs: t("navigation_economy_income.subsidies.items.healthcare"),
    sub_vaksin: t("navigation_economy_income.subsidies.items.vaccination"),
    sub_transport_publik: t("navigation_economy_income.subsidies.items.publicTransport"),
    sub_perumahan: t("navigation_economy_income.subsidies.items.housing"),
    sub_ev: t("navigation_economy_income.subsidies.items.greenTransport"),
    sub_kur: t("navigation_economy_income.subsidies.items.microcredit"),
    sub_pajak_umkm: t("navigation_economy_income.subsidies.items.microTax"),
    sub_blt: t("navigation_economy_income.subsidies.items.cashAid"),
    sub_pensiun: t("navigation_economy_income.subsidies.items.pension"),
    sub_bencana: t("navigation_economy_income.subsidies.items.disaster"),
  };
  const formatNumber = (value: number) => value.toLocaleString(language, { maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      {/* Category Sub-Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-b border-root-accent/20 pb-3">
        {CATEGORIES.map((cat) => {
          const countInCat = subsidyItems.filter(
            (i) => i.category === cat.id && i.isSubsidized
          ).length;
          const totalInCat = subsidyItems.filter((i) => i.category === cat.id).length;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${isActive
                  ? "bg-root-accent border-root-accent text-root-canvas font-black shadow-md"
                  : "bg-root-surface border-root-accent/20 text-root-text hover:border-root-accent/50 hover:text-root-accent"
                }`}
            >
              <span className="text-[11px] font-black uppercase tracking-wider truncate pr-1">
                {categoryLabels[cat.id]}
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${isActive ? "bg-root-canvas text-root-accent" : "bg-root-canvas text-root-subtle"
                  }`}
              >
                {countInCat}/{totalInCat}
              </span>
            </button>
          );
        })}
      </div>

      {/* Item List Container */}
      <div className="bg-root-surface border border-root-accent/30 p-6 rounded-xl space-y-4">
        <div className="flex justify-between items-center border-b border-root-accent/20 pb-3">
          <h4 className="text-[11px] text-root-accent font-black uppercase tracking-wider">
            {t("navigation_economy_income.subsidies.allocation", {
              category: categoryLabels[activeCategory],
              active: activeCount,
              total: totalCategoryCount,
            })}
          </h4>
        </div>

        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`flex justify-between items-center text-xs font-bold py-2 border-b border-root-accent/20 last:border-0 ${item.isSubsidized ? "text-rose-400" : "text-gray-500"
                }`}
            >
              <div className="flex flex-col">
                <span className={`font-semibold ${item.isSubsidized ? "text-root-text" : "text-gray-500 line-through"}`}>
                  {subsidyNames[item.id] ?? item.name}
                </span>
                <span className="text-[10px] text-root-subtle font-normal">
                  {t("navigation_economy_income.subsidies.status")}: {item.isSubsidized ? t("navigation_economy_income.subsidies.active") : t("navigation_economy_income.subsidies.inactive")}
                </span>
              </div>
              <span className="font-black text-right shrink-0 pl-2">
                {item.isSubsidized ? `- ${formatNumber(item.budgetCost)}` : "0"}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-root-accent/30 mt-4">
          <div className="flex justify-between items-center text-sm font-black text-root-text">
            <span>{t("navigation_economy_income.subsidies.subtotal", { category: categoryLabels[activeCategory] })}</span>
            <span className="text-rose-400">- {formatNumber(subtotalCost)}</span>
          </div>
        </div>
      </div>

      {/* Total Pengeluaran Subsidi Card */}
      <div className="bg-root-surface border border-root-accent/30 p-6 rounded-xl space-y-2">
        <div className="pt-2">
          <div className="flex justify-between items-center text-sm font-black text-root-text">
            <span>{t("navigation_economy_income.subsidies.total")}</span>
            <span className="text-rose-400">- {formatNumber(totalOverallCost)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}