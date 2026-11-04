"use client";

import React, { useState, useEffect } from "react";
import { Zap, Utensils, GraduationCap, Bus, Store, ShieldAlert } from "lucide-react";
import { INITIAL_SUBSIDY_ITEMS, SubsidyItem, clampSubsidyCost } from "../../../../../../../../../json/5_database_kebijakan_subsidi/index";

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
                {cat.label}
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
            ALOKASI SUBSIDI {activeCategory.toUpperCase()} ({activeCount}/{totalCategoryCount} AKTIF)
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
                  {item.name}
                </span>
                <span className="text-[10px] text-root-subtle font-normal">
                  Status: {item.isSubsidized ? "Aktif (Tersubsidi)" : "Tidak Aktif (Direncanakan/Dinonaktifkan)"}
                </span>
              </div>
              <span className="font-black text-right shrink-0 pl-2">
                {item.isSubsidized ? `- ${item.budgetCost.toLocaleString("id-ID", { maximumFractionDigits: 0 })}` : "0"}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-root-accent/30 mt-4">
          <div className="flex justify-between items-center text-sm font-black text-root-text">
            <span>Subtotal Subsidi {activeCategory}:</span>
            <span className="text-rose-400">- {subtotalCost.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Total Pengeluaran Subsidi Card */}
      <div className="bg-root-surface border border-root-accent/30 p-6 rounded-xl space-y-2">
        <div className="pt-2">
          <div className="flex justify-between items-center text-sm font-black text-root-text">
            <span>Total Pengeluaran Subsidi Alokasi:</span>
            <span className="text-rose-400">- {totalOverallCost.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}