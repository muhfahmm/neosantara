"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import NotebookModalWrapper, { MENU_INFO_MODAL_VISIBILITY_EVENT } from "../../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { getMonarchyMilitaryStrengthMultiplier } from "@/app/page/bonus_logic/ideologi_bonus_logic/monarki";
import { getAuthoritarianMilitaryStrengthMultiplier } from "@/app/page/bonus_logic/ideologi_bonus_logic/otoritarianisme";
import { isMobilePhone, useViewportMode } from "@/app/hooks/useViewportMode";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface InfoArmadaAktifModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: { key: string; label: string } | null | undefined;
  selectedCategory: string | undefined;
  groupMeta: Record<string, any>;
  formatNumber: (value: unknown) => string;
  unitBreakdown: any[];
  isCapacityFull?: boolean;
  capacityDisplay?: string;
  onNavigateToInfra?: (infraKey: string) => void;
  capacityInfo?: { used: number; totalCapacity: number; infraName: string; isFull: boolean } | null;
  countryIdeology?: unknown;
}

export default function InfoArmadaAktifModal({
  isOpen,
  onClose,
  selectedItem,
  selectedCategory,
  groupMeta,
  formatNumber,
  unitBreakdown,
  isCapacityFull = false,
  capacityDisplay = "",
  onNavigateToInfra,
  capacityInfo = null,
  countryIdeology,
}: InfoArmadaAktifModalProps) {
  const viewportMode = useViewportMode();
  const useRootPortal = isMobilePhone(viewportMode);

  useEffect(() => {
    if (!isOpen || !selectedItem || !useRootPortal) return;
    window.dispatchEvent(new CustomEvent(MENU_INFO_MODAL_VISIBILITY_EVENT, {
      detail: { isOpen: true },
    }));
    return () => {
      window.dispatchEvent(new CustomEvent(MENU_INFO_MODAL_VISIBILITY_EVENT, {
        detail: { isOpen: false },
      }));
    };
  }, [isOpen, selectedItem, useRootPortal]);

  if (!isOpen || !selectedItem) return null;

  const selectedDataKey = selectedItem.key === "barak"
    ? "pasukan_infanteri"
    : selectedItem.key;
  const currentUnit = unitBreakdown.find(e => e.dataKey === selectedDataKey);
  const currentQuantity = currentUnit?.quantity ?? 0;
  const hasMilitaryBonus =
    getMonarchyMilitaryStrengthMultiplier(countryIdeology) *
    getAuthoritarianMilitaryStrengthMultiplier(countryIdeology) > 1;

  if (typeof document === "undefined") return null;

  const modal = (
    <NotebookModalWrapper
      onClose={onClose}
      zIndexClass={useRootPortal ? "z-[200]" : undefined}
      hideWhenInfoModalOpen={!useRootPortal}
    >
      <div className="root-modal-util-b74379da23 defense-unit-info-modal">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

        <RootInfoModalHeader
          title={selectedItem.label}
          titleId="defense-unit-info-title"
          onClose={onClose}
          size="standard"
        />

        {/* Body */}
        <div className={`defense-unit-info-content min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 bg-root-surface relative z-10 space-y-4 custom-scrollbar ${rootModalTypography.body}`}>
          <div className="defense-unit-info-metrics grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`defense-unit-info-card bg-root-canvas p-4 border border-root-accent/20 ${rootBorderRadius.card}`}>
              <p className="defense-unit-info-label text-sm font-bold text-root-subtle mb-1">Jumlah Unit Saat Ini</p>
              <p className="defense-unit-info-value text-xl font-black text-root-text">
                {formatNumber(currentQuantity)} {selectedItem.key === "barak" ? "pasukan" : "unit"}
              </p>
            </div>

            {capacityInfo && (
              <div className={`defense-unit-info-card bg-root-canvas p-4 border border-root-accent/20 ${rootBorderRadius.card}`}>
                <p className="defense-unit-info-label text-[12px] font-bold text-root-subtle mb-1">Kapasitas {capacityInfo.infraName}</p>
                <p className={`defense-unit-info-value text-xl font-black ${capacityInfo.isFull ? "text-rose-400" : "text-root-accent"}`}>
                  {formatNumber(capacityInfo.used)} / {formatNumber(capacityInfo.totalCapacity)}
                </p>
                <p className="text-[10px] text-root-subtle mt-1">
                  (Total seluruh armada terpakai dalam {capacityInfo.infraName})
                </p>
              </div>
            )}
          </div>

          <div className="defense-unit-info-power-grid grid grid-cols-2 gap-4">
            <div className={`defense-unit-info-card bg-root-canvas p-4 border border-root-accent/20 ${rootBorderRadius.card}`}>
              <p className="defense-unit-info-label text-[12px] font-bold text-root-subtle mb-1">Kekuatan</p>
              <p className="defense-unit-info-value flex items-center gap-2 text-lg font-black text-root-accent">
                {currentUnit && currentUnit.totalPower > currentUnit.baseTotalPower && (
                  <span className="text-sm text-rose-400 line-through">
                    {formatNumber(currentUnit.baseTotalPower)}
                  </span>
                )}
                {formatNumber(currentUnit?.totalPower ?? 0)}
              </p>
            </div>
            <div className={`defense-unit-info-card bg-root-canvas p-4 border border-root-accent/20 ${rootBorderRadius.card}`}>
              <p className="defense-unit-info-label text-[12px] font-bold text-root-subtle mb-1">Total HP</p>
              <p className="defense-unit-info-value flex items-center gap-2 text-lg font-black text-rose-400">
                {currentUnit && currentUnit.totalHealth > currentUnit.baseTotalHealth && (
                  <span className="text-sm text-rose-300/60 line-through">
                    {formatNumber(currentUnit.baseTotalHealth)}
                  </span>
                )}
                {formatNumber(currentUnit?.totalHealth ?? 0)}
              </p>
            </div>
          </div>
          {/* PERINGATAN KAPASITAS PENUH */}
          {isCapacityFull && (
            <div className={`defense-unit-info-warning border border-rose-500/40 bg-rose-950/40 p-5 space-y-3 mt-4 ${rootBorderRadius.card}`}>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full animate-pulse bg-rose-500"></div>
                <p className="text-sm font-black text-rose-400 uppercase tracking-wider">Kapasitas Penuh</p>
              </div>
              <div className="text-xs text-rose-200 space-y-1">
                <p>
                  Kapasitas penampungan militer saat ini sudah penuh <span className="font-black text-white">({capacityDisplay})</span>.
                  Anda harus membangun infrastruktur militer baru untuk menambah armada lebih banyak.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </NotebookModalWrapper>
  );

  return useRootPortal ? createPortal(modal, document.body) : modal;
}