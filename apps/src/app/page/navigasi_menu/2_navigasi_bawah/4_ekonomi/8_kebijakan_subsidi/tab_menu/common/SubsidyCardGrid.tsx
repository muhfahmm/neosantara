// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\8_kebijakan_subsidi\tab_menu\common\SubsidyCardGrid.tsx
"use client";

import React from "react";
import { Info } from "lucide-react";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { SubsidyItem } from "../../../../../../../../../../json/5_database_kebijakan_subsidi/index";

interface Props {
  items: SubsidyItem[];
  toggleSubsidy: (id: string) => void;
  onOpenDetail?: (item: SubsidyItem) => void;
}

export default function SubsidyCardGrid({ items, toggleSubsidy, onOpenDetail }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 max-w-full">
      {items.map((item) => (
        <div
          key={item.id}
          className={`subsidy-item-card bg-root-canvas border ${rootBorderRadius.card} p-3.5 lg:p-4 2xl:p-5 flex flex-col transition-all ${item.isSubsidized
              ? "border-root-accent/40 shadow-lg"
              : "border-gray-800 opacity-75"
            }`}
        >
          <div>
            <div className="subsidy-item-header flex items-center justify-between gap-2.5 mb-2">
              <span className="subsidy-item-category text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-2 lg:px-2.5 py-0.5 rounded-full bg-root-accent/10 text-root-accent border border-root-accent/30">
                {item.category}
              </span>

              <div className="subsidy-item-actions flex items-center gap-2">
                {/* INFO BUTTON (i) */}
                {onOpenDetail && (
                  <button
                    type="button"
                    onClick={() => onOpenDetail(item)}
                    className="subsidy-item-info-button p-1 rounded-full border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all cursor-pointer flex items-center justify-center shadow-sm"
                    title="Lihat Rincian Kebijakan"
                    aria-label={`Lihat rincian subsidi ${item.name}`}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* TOGGLE SWITCH */}
                <button
                  type="button"
                  onClick={() => toggleSubsidy(item.id)}
                  aria-label={`${item.isSubsidized ? "Nonaktifkan" : "Aktifkan"} subsidi ${item.name}`}
                  aria-pressed={item.isSubsidized}
                  className={`subsidy-item-toggle relative inline-flex h-5 lg:h-6 w-9 lg:w-11 items-center rounded-full transition-colors cursor-pointer border ${item.isSubsidized
                      ? "bg-emerald-500 border-emerald-400"
                      : "bg-gray-700 border-gray-600"
                    }`}
                >
                  <span className="subsidy-item-toggle-knob inline-block h-3.5 lg:h-4 w-3.5 lg:w-4 rounded-full bg-white transition-transform" />
                </button>
              </div>
            </div>

            <h4 className="subsidy-item-title text-xs lg:text-sm font-black text-root-text uppercase tracking-wider">{item.name}</h4>
          </div>

        </div>
      ))}
    </div>
  );
}