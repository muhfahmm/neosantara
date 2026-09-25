// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\8_kebijakan_subsidi\tab_menu\common\SubsidyCardGrid.tsx
"use client";

import React from "react";
import { SubsidyItem, formatCurrencyCompact } from "../../logic/logikaSubsidi";

interface Props {
  items: SubsidyItem[];
  toggleSubsidy: (id: string) => void;
}

export default function SubsidyCardGrid({ items, toggleSubsidy }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 max-w-full">
      {items.map((item) => (
        <div
          key={item.id}
          className={`bg-[#0A1A1A] border rounded-2xl p-3.5 lg:p-4 2xl:p-5 flex flex-col justify-between transition-all ${
            item.isSubsidized
              ? "border-[#00FFAA]/40 shadow-lg"
              : "border-gray-800 opacity-75"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2.5 mb-2">
              <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-2 lg:px-2.5 py-0.5 rounded-full bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/30">
                {item.category}
              </span>

              {/* TOGGLE SWITCH */}
              <button
                onClick={() => toggleSubsidy(item.id)}
                className={`relative inline-flex h-5 lg:h-6 w-9 lg:w-11 items-center rounded-full transition-colors cursor-pointer border ${
                  item.isSubsidized
                    ? "bg-emerald-500 border-emerald-400"
                    : "bg-gray-700 border-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-3.5 lg:h-4 w-3.5 lg:w-4 transform rounded-full bg-white transition-transform ${
                    item.isSubsidized ? "translate-x-4 lg:translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <h4 className="text-xs lg:text-sm font-black text-[#E0E0E0] uppercase tracking-wider">{item.name}</h4>
            <p className="text-[10px] lg:text-xs text-[#6B8A8A] mt-1 leading-relaxed">{item.description}</p>
          </div>

          {/* STATS FOOTER FOR ITEM */}
          <div className="mt-3 lg:mt-4 pt-2.5 lg:pt-3 border-t border-[#00FFAA]/15 grid grid-cols-3 gap-1.5 lg:gap-2 text-center text-[9px] lg:text-[10px]">
            <div className="bg-[#0F2424] p-1.5 lg:p-2 rounded-lg border border-[#00FFAA]/10">
              <span className="block text-[#6B8A8A] font-bold uppercase">Biaya APBN</span>
              <span className="font-black text-[#00FFAA] mt-0.5 block">{formatCurrencyCompact(item.budgetCost)}</span>
            </div>

            <div className="bg-[#0F2424] p-1.5 lg:p-2 rounded-lg border border-[#00FFAA]/10">
              <span className="block text-[#6B8A8A] font-bold uppercase">Approval</span>
              <span className="font-black text-emerald-400 mt-0.5 block">+{item.approvalImpact}%</span>
            </div>

            <div className="bg-[#0F2424] p-1.5 lg:p-2 rounded-lg border border-[#00FFAA]/10">
              <span className="block text-[#6B8A8A] font-bold uppercase">Risiko Cabut</span>
              <span className={`font-black mt-0.5 block ${
                item.demoRiskIfDisabled === 'Kritis' ? 'text-rose-500' :
                item.demoRiskIfDisabled === 'Tinggi' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {item.demoRiskIfDisabled}
              </span>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}

