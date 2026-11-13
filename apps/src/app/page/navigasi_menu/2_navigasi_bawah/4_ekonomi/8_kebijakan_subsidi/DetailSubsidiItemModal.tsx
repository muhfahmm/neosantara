"use client";

import React from "react";
import { HandHelping, Info, ShieldAlert, TrendingUp, TrendingDown, DollarSign, Check } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
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
  if (!isOpen || !item) return null;

  return (
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[70]" frameClassName="subsidy-detail-modal-frame">
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-root-accent/20 bg-root-canvas px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
              <HandHelping className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
            </div>
            <div>
              <h2 className={`${rootModalTypography.title} !text-root-accent`}>
                Rincian Kebijakan Subsidi
              </h2>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        {/* Content Body */}
        <div className="subsidy-detail-modal-body flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-root-surface p-3 sm:p-4 custom-scrollbar">

          {/* Badge & Title */}
          <div>
            <span className={`subsidy-detail-category-badge ${rootModalTypography.label} mb-2 inline-block rounded-full border border-root-accent/30 bg-root-accent/10 px-2.5 py-0.5 !text-root-accent`}>
              SEKTOR {item.category}
            </span>
            <h3 className={`${rootModalTypography.sectionTitle} !text-root-text leading-tight`}>
              {item.name}
            </h3>
          </div>

          {/* Card Description */}
          <div className={`bg-root-surface border border-root-accent/20 p-3 ${rootBorderRadius.card} space-y-2`}>
            <div className={`${rootModalTypography.sectionTitle} flex items-center gap-2 !text-root-accent`}>
              <Info className="h-4 w-4 shrink-0" />
              <span>Deskripsi Kebijakan</span>
            </div>
            <p className={`${rootModalTypography.body} pl-6`}>
              {item.description}
            </p>
          </div>

          {/* Metric Stats Grid */}
          <div className="grid grid-cols-2 gap-2">

            {/* Biaya Anggaran */}
            <div className={`bg-root-surface p-2.5 ${rootBorderRadius.card} border border-root-accent/20`}>
              <div className={`${rootModalTypography.label} mb-1 flex items-center gap-1.5`}>
                <DollarSign className="h-3.5 w-3.5 text-root-accent" />
                <span>Beban Anggaran</span>
              </div>
              <span className="text-[length:var(--modal-font-value)] font-black text-root-accent">
                {formatCurrencyCompact(item.budgetCost)}
              </span>
            </div>

            {/* Approval Impact */}
            <div className={`bg-root-surface p-2.5 ${rootBorderRadius.card} border border-root-accent/20`}>
              <div className={`${rootModalTypography.label} mb-1 flex items-center gap-1.5`}>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>Bonus Kepuasan</span>
              </div>
              <span className="text-[length:var(--modal-font-value)] font-black text-emerald-400">
                +{item.approvalImpact}% Approval
              </span>
            </div>

            {/* Inflasi */}
            <div className={`bg-root-surface p-2.5 ${rootBorderRadius.card} border border-root-accent/20`}>
              <div className={`${rootModalTypography.label} mb-1 flex items-center gap-1.5`}>
                <TrendingDown className="h-3.5 w-3.5 text-blue-400" />
                <span>Reduksi Inflasi</span>
              </div>
              <span className="text-[length:var(--modal-font-value)] font-black text-blue-400">
                -{item.inflationReduction}% Inflasi
              </span>
            </div>

            {/* Risiko Demo */}
            <div className={`bg-root-surface p-2.5 ${rootBorderRadius.card} border border-root-accent/20`}>
              <div className={`${rootModalTypography.label} mb-1 flex items-center gap-1.5`}>
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                <span>Risiko Cabut</span>
              </div>
              <span className={`text-[length:var(--modal-font-value)] font-black ${item.demoRiskIfDisabled === 'Kritis' ? 'text-rose-500' :
                  item.demoRiskIfDisabled === 'Tinggi' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                {item.demoRiskIfDisabled}
              </span>
            </div>

          </div>

          {/* Status & Action Footer */}
          <div className={`bg-root-surface border border-root-accent/20 p-3 ${rootBorderRadius.card} flex items-center justify-between gap-3`}>
            <div>
              <p className={rootModalTypography.label}>Status Alokasi Saat Ini</p>
              <p className={`text-[length:var(--modal-font-value)] font-black uppercase mt-0.5 ${item.isSubsidized ? 'text-emerald-400' : 'text-root-subtle'}`}>
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
    </NotebookModalWrapper>
  );
}