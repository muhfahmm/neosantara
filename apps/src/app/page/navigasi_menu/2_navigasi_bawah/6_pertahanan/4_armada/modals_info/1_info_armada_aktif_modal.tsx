"use client";
import React from "react";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { getMonarchyMilitaryStrengthMultiplier } from "@/app/page/bonus_logic/ideologi_bonus_logic/monarki";
import { getAuthoritarianMilitaryStrengthMultiplier } from "@/app/page/bonus_logic/ideologi_bonus_logic/otoritarianisme";

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
  if (!isOpen || !selectedItem) return null;

  const selectedDataKey = selectedItem.key === "barak"
    ? "pasukan_infanteri"
    : selectedItem.key;
  const currentUnit = unitBreakdown.find(e => e.dataKey === selectedDataKey);
  const currentQuantity = currentUnit?.quantity ?? 0;
  const hasMilitaryBonus =
    getMonarchyMilitaryStrengthMultiplier(countryIdeology) *
    getAuthoritarianMilitaryStrengthMultiplier(countryIdeology) > 1;

  return (
    <NotebookModalWrapper onClose={onClose} compact>
      <div className="flex flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* Header */}
        <div className="px-4 sm:px-5 py-3 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
          <h3 className="font-black text-root-accent uppercase tracking-wider text-xl">{selectedItem?.label}</h3>
          <RootModalCloseButton onClick={onClose} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-5 bg-root-surface relative z-10 space-y-4 text-xs font-semibold text-root-text custom-scrollbar">
          <div className="bg-root-canvas p-4 rounded-xl border border-root-accent/20">
            <p className="text-sm font-bold text-root-subtle mb-1">Kategori Matra</p>
            <p className="text-xl font-black text-root-text">
              {selectedCategory ? groupMeta[selectedCategory].title : '-'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-root-canvas p-4 rounded-xl border border-root-accent/20">
              <p className="text-sm font-bold text-root-subtle mb-1">Jumlah Unit Saat Ini</p>
              <p className="text-xl font-black text-root-text">
                {formatNumber(currentQuantity)} {selectedItem.key === "barak" ? "pasukan" : "unit"}
              </p>
            </div>

            {capacityInfo && (
              <div className="bg-root-canvas p-4 rounded-xl border border-root-accent/20">
                <p className="text-[12px] font-bold text-root-subtle mb-1">Kapasitas {capacityInfo.infraName}</p>
                <p className={`text-xl font-black ${capacityInfo.isFull ? "text-rose-400" : "text-root-accent"}`}>
                  {formatNumber(capacityInfo.used)} / {formatNumber(capacityInfo.totalCapacity)}
                </p>
                <p className="text-[10px] text-root-subtle mt-1">
                  (Total seluruh armada terpakai dalam {capacityInfo.infraName})
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-root-canvas p-4 rounded-xl border border-root-accent/20">
              <p className="text-[12px] font-bold text-root-subtle mb-1">Kekuatan</p>
              <p className="flex items-center gap-2 text-lg font-black text-root-accent">
                {currentUnit && currentUnit.totalPower > currentUnit.baseTotalPower && (
                  <span className="text-sm text-rose-400 line-through">
                    {formatNumber(currentUnit.baseTotalPower)}
                  </span>
                )}
                {formatNumber(currentUnit?.totalPower ?? 0)}
              </p>
            </div>
            <div className="bg-root-canvas p-4 rounded-xl border border-root-accent/20">
              <p className="text-[12px] font-bold text-root-subtle mb-1">Total HP</p>
              <p className="flex items-center gap-2 text-lg font-black text-rose-400">
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
            <div className="border border-rose-500/40 bg-rose-950/40 rounded-xl p-5 space-y-3 mt-4">
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
}