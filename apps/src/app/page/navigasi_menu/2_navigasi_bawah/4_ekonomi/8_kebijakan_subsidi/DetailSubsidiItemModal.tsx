"use client";

import React from "react";
import { X, HandHelping, Info, ShieldAlert, TrendingUp, TrendingDown, DollarSign, Check } from "lucide-react";
import { SubsidyItem, formatCurrencyCompact } from "./logic/logikaSubsidi";

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
              <HandHelping className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                Rincian Kebijakan Subsidi
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A1A1A]/90 relative z-10 custom-scrollbar space-y-4">
          
          {/* Badge & Title */}
          <div>
            <span className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/30 mb-2">
              SEKTOR {item.category}
            </span>
            <h3 className="text-base sm:text-xl font-black text-[#E0E0E0] uppercase tracking-wider leading-tight">
              {item.name}
            </h3>
          </div>

          {/* Card Description */}
          <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-[#00FFAA] font-bold text-xs uppercase tracking-wider">
              <Info className="h-4 w-4 shrink-0" />
              <span>Deskripsi Kebijakan</span>
            </div>
            <p className="text-xs sm:text-sm text-[#E0E0E0] font-medium leading-relaxed pl-6">
              {item.description}
            </p>
          </div>

          {/* Metric Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Biaya APBN */}
            <div className="bg-[#0F2424] p-3 rounded-xl border border-[#00FFAA]/20">
              <div className="flex items-center gap-1.5 text-[#6B8A8A] text-[10px] font-bold uppercase tracking-wider mb-1">
                <DollarSign className="h-3.5 w-3.5 text-[#00FFAA]" />
                <span>Beban APBN</span>
              </div>
              <span className="text-lg font-black text-[#00FFAA]">
                {formatCurrencyCompact(item.budgetCost)}
              </span>
            </div>

            {/* Approval Impact */}
            <div className="bg-[#0F2424] p-3 rounded-xl border border-[#00FFAA]/20">
              <div className="flex items-center gap-1.5 text-[#6B8A8A] text-[10px] font-bold uppercase tracking-wider mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>Bonus Kepuasan</span>
              </div>
              <span className="text-lg font-black text-emerald-400">
                +{item.approvalImpact}% Approval
              </span>
            </div>

            {/* Inflasi */}
            <div className="bg-[#0F2424] p-3 rounded-xl border border-[#00FFAA]/20">
              <div className="flex items-center gap-1.5 text-[#6B8A8A] text-[10px] font-bold uppercase tracking-wider mb-1">
                <TrendingDown className="h-3.5 w-3.5 text-blue-400" />
                <span>Reduksi Inflasi</span>
              </div>
              <span className="text-lg font-black text-blue-400">
                -{item.inflationReduction}% Inflasi
              </span>
            </div>

            {/* Risiko Demo */}
            <div className="bg-[#0F2424] p-3 rounded-xl border border-[#00FFAA]/20">
              <div className="flex items-center gap-1.5 text-[#6B8A8A] text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                <span>Risiko Cabut</span>
              </div>
              <span className={`text-lg font-black ${
                item.demoRiskIfDisabled === 'Kritis' ? 'text-rose-500' :
                item.demoRiskIfDisabled === 'Tinggi' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {item.demoRiskIfDisabled}
              </span>
            </div>

          </div>

          {/* Status & Action Footer */}
          <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-4 rounded-xl flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider">Status Alokasi Saat Ini</p>
              <p className={`text-sm font-black uppercase mt-0.5 ${item.isSubsidized ? 'text-emerald-400' : 'text-[#6B8A8A]'}`}>
                {item.isSubsidized ? '✓ Subsidi Aktif' : '✗ Non-Aktif'}
              </p>
            </div>

            {toggleSubsidy && (
              <button
                onClick={() => toggleSubsidy(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
                  item.isSubsidized
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500 hover:text-white"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-[#0A1A1A]"
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
