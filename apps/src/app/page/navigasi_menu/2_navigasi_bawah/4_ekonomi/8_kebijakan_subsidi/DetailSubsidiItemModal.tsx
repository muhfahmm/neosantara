"use client";

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from "react";
import { X, HandHelping, Info, ShieldAlert, TrendingUp, TrendingDown, DollarSign, Check } from "lucide-react";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { useViewportMode } from "@/app/hooks/useViewportMode";
import { SubsidyItem, formatCurrencyCompact } from "../../../../../../../../json/5_database_kebijakan_subsidi/index";

interface DetailSubsidiItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SubsidyItem | null;
  toggleSubsidy?: (id: string) => void;
}

export default function DetailSubsidiItemModal({
  isOpen,
  onClose,
  item,
  toggleSubsidy,
}: DetailSubsidiItemModalProps) {
  const viewportMode = useViewportMode();
  if (!isOpen || !item) return null;

  return (
    <div
      data-viewport-mode={viewportMode === "desktop" ? undefined : viewportMode}
      className="responsive-modal-frame subsidy-detail-modal-frame fixed inset-0 z-[70] flex items-center justify-center bg-transparent pointer-events-none"
    >
      <div className={`subsidy-detail-modal-shell modal-responsive-shell bg-root-surface border border-root-accent/30 ${rootBorderRadius.frame} overflow-hidden flex flex-col relative font-sans pointer-events-auto shadow-2xl`}>

        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
              <HandHelping className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-root-accent tracking-tight leading-none uppercase">
                Rincian Kebijakan Subsidi
              </h2>
            </div>
          </div>
          <SharedModalCloseButton
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
           appearance="custom">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </SharedModalCloseButton>
        </div>

        {/* Content Body */}
        <div className="subsidy-detail-modal-body flex flex-1 min-h-0 flex-col overflow-y-auto p-3 sm:p-4 bg-root-canvas/90 relative z-10 custom-scrollbar gap-3">

          {/* Badge & Title */}
          <div>
            <span className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-root-accent/10 text-root-accent border border-root-accent/30 mb-2">
              SEKTOR {item.category}
            </span>
            <h3 className="text-base sm:text-xl font-black text-root-text uppercase tracking-wider leading-tight">
              {item.name}
            </h3>
          </div>

          {/* Card Description */}
          <div className={`bg-root-surface border border-root-accent/20 p-3 ${rootBorderRadius.card} space-y-2`}>
            <div className="flex items-center gap-2 text-root-accent font-bold text-xs uppercase tracking-wider">
              <Info className="h-4 w-4 shrink-0" />
              <span>Deskripsi Kebijakan</span>
            </div>
            <p className="text-xs text-root-text font-medium leading-relaxed pl-6">
              {item.description}
            </p>
          </div>

          {/* Metric Stats Grid */}
          <div className="grid grid-cols-2 gap-2">

            {/* Biaya Anggaran */}
            <div className={`bg-root-surface p-2.5 ${rootBorderRadius.card} border border-root-accent/20`}>
              <div className="flex items-center gap-1.5 text-root-subtle text-[10px] font-bold uppercase tracking-wider mb-1">
                <DollarSign className="h-3.5 w-3.5 text-root-accent" />
                <span>Beban Anggaran</span>
              </div>
              <span className="text-base font-black text-root-accent">
                {formatCurrencyCompact(item.budgetCost)}
              </span>
            </div>

            {/* Approval Impact */}
            <div className={`bg-root-surface p-2.5 ${rootBorderRadius.card} border border-root-accent/20`}>
              <div className="flex items-center gap-1.5 text-root-subtle text-[10px] font-bold uppercase tracking-wider mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>Bonus Kepuasan</span>
              </div>
              <span className="text-base font-black text-emerald-400">
                +{item.approvalImpact}% Approval
              </span>
            </div>

            {/* Inflasi */}
            <div className={`bg-root-surface p-2.5 ${rootBorderRadius.card} border border-root-accent/20`}>
              <div className="flex items-center gap-1.5 text-root-subtle text-[10px] font-bold uppercase tracking-wider mb-1">
                <TrendingDown className="h-3.5 w-3.5 text-blue-400" />
                <span>Reduksi Inflasi</span>
              </div>
              <span className="text-base font-black text-blue-400">
                -{item.inflationReduction}% Inflasi
              </span>
            </div>

            {/* Risiko Demo */}
            <div className={`bg-root-surface p-2.5 ${rootBorderRadius.card} border border-root-accent/20`}>
              <div className="flex items-center gap-1.5 text-root-subtle text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                <span>Risiko Cabut</span>
              </div>
              <span className={`text-base font-black ${item.demoRiskIfDisabled === 'Kritis' ? 'text-rose-500' :
                  item.demoRiskIfDisabled === 'Tinggi' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                {item.demoRiskIfDisabled}
              </span>
            </div>

          </div>

          {/* Status & Action Footer */}
          <div className={`bg-root-surface border border-root-accent/20 p-3 ${rootBorderRadius.card} flex items-center justify-between gap-3`}>
            <div>
              <p className="text-[10px] font-bold text-root-subtle uppercase tracking-wider">Status Alokasi Saat Ini</p>
              <p className={`text-sm font-black uppercase mt-0.5 ${item.isSubsidized ? 'text-emerald-400' : 'text-root-subtle'}`}>
                {item.isSubsidized ? '✓ Subsidi Aktif' : '✗ Non-Aktif'}
              </p>
            </div>

            {toggleSubsidy && (
              <button
                onClick={() => toggleSubsidy(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${item.isSubsidized
                    ? "bg-root-modal-negative-bg text-root-modal-negative border border-root-modal-negative/40 hover:border-root-modal-negative"
                    : "bg-root-modal-positive-bg text-root-modal-positive border border-root-modal-positive-border hover:border-root-modal-positive"
                  }`}
              >
                {item.isSubsidized ? (
                  <>Cabut Subsidi</>
                ) : (
                  <><Check className="h-3.5 w-3.5" /> Aktifkan Subsidi</>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}