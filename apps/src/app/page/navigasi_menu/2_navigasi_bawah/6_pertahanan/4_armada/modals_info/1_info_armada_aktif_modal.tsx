"use client";
import React from "react";
import { X } from "lucide-react";
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

  const currentUnit = unitBreakdown.find(e => e.dataKey === selectedItem?.key);
  const currentQuantity = currentUnit?.quantity ?? 0;
  const hasMilitaryBonus =
    getMonarchyMilitaryStrengthMultiplier(countryIdeology) *
    getAuthoritarianMilitaryStrengthMultiplier(countryIdeology) > 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <h3 className="font-black text-[#00FFAA] uppercase tracking-wider text-xl">{selectedItem?.label}</h3>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0F2424] relative z-10 space-y-4 text-xs font-semibold text-[#E0E0E0] custom-scrollbar">
          <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
            <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Kategori Matra</p>
            <p className="text-xl font-black text-white">
              {selectedCategory ? groupMeta[selectedCategory].title : '-'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Jumlah Unit Saat Ini</p>
              <p className="text-xl font-black text-white">
                {formatNumber(currentQuantity)} {selectedItem.key === "barak" ? "pasukan" : "unit"}
              </p>
            </div>

            {capacityInfo && (
              <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
                <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Kapasitas {capacityInfo.infraName}</p>
                <p className={`text-xl font-black ${capacityInfo.isFull ? "text-rose-400" : "text-[#00FFAA]"}`}>
                  {formatNumber(capacityInfo.used)} / {formatNumber(capacityInfo.totalCapacity)}
                </p>
                <p className="text-[10px] text-[#6B8A8A] mt-1">
                  (Total seluruh armada terpakai dalam {capacityInfo.infraName})
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Kekuatan</p>
              <p className="flex items-center gap-2 text-lg font-black text-[#00FFAA]">
                {hasMilitaryBonus && (
                  <span className="text-sm text-rose-400 line-through">
                    {formatNumber(currentUnit?.baseTotalPower ?? 0)}
                  </span>
                )}
                {formatNumber(currentUnit?.totalPower ?? 0)}
              </p>
            </div>
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Total HP</p>
              <p className="flex items-center gap-2 text-lg font-black text-rose-400">
                {hasMilitaryBonus && (
                  <span className="text-sm text-rose-300/60 line-through">
                    {formatNumber(currentUnit?.baseTotalHealth ?? 0)}
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

        {/* Footer */}
        <div className="p-4 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex justify-end relative z-10 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-white text-[10px] font-black uppercase cursor-pointer hover:bg-[#1A3838] transition-all text-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}