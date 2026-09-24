"use client";

import React, { useState, useEffect } from "react";
import { Zap, Utensils, GraduationCap, Bus, Store, ShieldAlert } from "lucide-react";
import { INITIAL_SUBSIDY_ITEMS, SubsidyItem } from "../../8_kebijakan_subsidi/logic/logikaSubsidi";

interface AlokasiSubsidiTabProps {
  countryDetail: any;
}

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
  const [subsidyItems, setSubsidyItems] = useState<SubsidyItem[]>(INITIAL_SUBSIDY_ITEMS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const slug =
      countryDetail?.slug ||
      countryDetail?.country_slug ||
      countryDetail?.name?.toLowerCase().replace(/\s+/g, '-') ||
      (countryDetail?.name_id ? String(countryDetail.name_id).toLowerCase().replace(/\s+/g, '-') : null) ||
      'indonesia';

    setIsLoading(true);

    fetch(`/api/alokasi-subsidi?slug=${slug}`)
      .then((res) => res.json())
      .then((dbData) => {
        if (dbData && typeof dbData === 'object' && !Array.isArray(dbData)) {
          setSubsidyItems(
            INITIAL_SUBSIDY_ITEMS.map((item) => {
              const dbVal = dbData[item.id] ?? dbData[item.id.toLowerCase()];
              let isSub = item.isSubsidized;
              if (dbVal !== undefined && dbVal !== null) {
                if (dbVal === 0 || dbVal === "0" || dbVal === false || dbVal === "false") {
                  isSub = false;
                } else if (dbVal === 1 || dbVal === "1" || dbVal === true || dbVal === "true") {
                  isSub = true;
                }
              }
              return { ...item, isSubsidized: isSub };
            })
          );
        } else if (countryDetail?.subsidy_states) {
          setSubsidyItems(
            INITIAL_SUBSIDY_ITEMS.map((item) => ({
              ...item,
              isSubsidized: (countryDetail.subsidy_states as Record<string, boolean>)[item.id] ?? item.isSubsidized,
            }))
          );
        } else {
          setSubsidyItems(INITIAL_SUBSIDY_ITEMS);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat status subsidi di AlokasiSubsidiTab:", err);
        setSubsidyItems(INITIAL_SUBSIDY_ITEMS);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-b border-[#00FFAA]/20 pb-3">
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
              className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-black shadow-md"
                  : "bg-[#0F2424] border-[#00FFAA]/20 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:text-[#00FFAA]"
              }`}
            >
              <span className="text-[11px] font-black uppercase tracking-wider truncate pr-1">
                {cat.label}
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                  isActive ? "bg-[#0A1A1A] text-[#00FFAA]" : "bg-[#0A1A1A] text-[#6B8A8A]"
                }`}
              >
                {countInCat}/{totalInCat}
              </span>
            </button>
          );
        })}
      </div>

      {/* Item List Container */}
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 p-6 rounded-xl space-y-4">
        <div className="flex justify-between items-center border-b border-[#00FFAA]/20 pb-3">
          <h4 className="text-[11px] text-[#00FFAA] font-black uppercase tracking-wider">
            ALOKASI SUBSIDI {activeCategory.toUpperCase()} ({activeCount}/{totalCategoryCount} AKTIF)
          </h4>
          {isLoading && (
            <span className="text-[10px] text-[#6B8A8A] font-semibold animate-pulse">
              Memuat data...
            </span>
          )}
        </div>

        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`flex justify-between items-center text-xs font-bold py-2 border-b border-[#00FFAA]/20 last:border-0 ${
                item.isSubsidized ? "text-rose-400" : "text-gray-500"
              }`}
            >
              <div className="flex flex-col">
                <span className={`font-semibold ${item.isSubsidized ? "text-[#E0E0E0]" : "text-gray-500 line-through"}`}>
                  {item.name}
                </span>
                <span className="text-[10px] text-[#6B8A8A] font-normal">
                  Status: {item.isSubsidized ? "Aktif (Tersubsidi)" : "Tidak Aktif (Direncanakan/Dinonaktifkan)"}
                </span>
              </div>
              <span className="font-black text-right shrink-0 pl-2">
                {item.isSubsidized ? `- ${item.budgetCost.toLocaleString("id-ID")}` : "0"}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#00FFAA]/30 mt-4">
          <div className="flex justify-between items-center text-sm font-black text-[#E0E0E0]">
            <span>Subtotal Subsidi {activeCategory}:</span>
            <span className="text-rose-400">- {subtotalCost.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* Total Pengeluaran Subsidi Card */}
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 p-6 rounded-xl space-y-2">
        <div className="pt-2">
          <div className="flex justify-between items-center text-sm font-black text-[#E0E0E0]">
            <span>Total Pengeluaran Subsidi Alokasi:</span>
            <span className="text-rose-400">- {totalOverallCost.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
