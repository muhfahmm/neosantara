'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldAlert, 
  X, 
  AlertTriangle, 
  Coins, 
  Target, 
  Skull, 
  Globe2, 
  ArrowRight,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { 
  OPSI_BUBARKAN_MASSA, 
  DetailOpsiBubarkan, 
  OpsiBubarkanMassa 
} from './opsiBubarkanMassaConfig';

interface MenuBubarkanMassaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: DetailOpsiBubarkan) => void;
  currentBudget?: number;
}

export default function MenuBubarkanMassaModal({
  isOpen,
  onClose,
  onSelectOption,
  currentBudget = 100_000_000,
}: MenuBubarkanMassaModalProps) {
  const [selectedId, setSelectedId] = useState<OpsiBubarkanMassa>('brimob');

  if (typeof window === 'undefined' || !isOpen) return null;

  const currentSelected = OPSI_BUBARKAN_MASSA.find(opt => opt.id === selectedId) || OPSI_BUBARKAN_MASSA[0];
  const isBudgetSufficient = currentBudget >= currentSelected.cost;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-sans select-none animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#14080B] via-[#0E0406] to-[#070203] border-2 border-rose-500/50 shadow-[0_0_80px_rgba(244,63,94,0.35)] flex flex-col"
      >
        {/* HEADER MODAL */}
        <div className="px-5 py-4 border-b border-rose-500/30 flex items-center justify-between bg-gradient-to-r from-rose-950/80 via-[#1A0A0E] to-[#0E0406] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border border-rose-500/50 bg-rose-900/40 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Tindakan Keamanan Negara
                </span>
                <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
                  Kas: <strong className="text-emerald-400">{currentBudget.toLocaleString('id-ID')} NEO</strong>
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-wider uppercase text-white mt-0.5">
                PILIH METODE PEMBUBARAN MASSA
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY (LIST & DETAIL GRID) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-h-0">
          
          {/* KOLOM KIRI: PILIHAN STRATEGI (5 OPSI) */}
          <div className="lg:col-span-7 flex flex-col gap-2.5 overflow-y-auto pr-1">
            <p className="text-[10px] font-black tracking-widest uppercase text-rose-400/90 mb-1">
              Pilihan Operasi Keamanan
            </p>
            {OPSI_BUBARKAN_MASSA.map((option, index) => {
              const isSelected = selectedId === option.id;
              const affordable = currentBudget >= option.cost;

              return (
                <div
                  key={option.id}
                  onClick={() => setSelectedId(option.id)}
                  className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-3 relative overflow-hidden ${
                    isSelected
                      ? 'bg-rose-950/60 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.3)] ring-1 ring-rose-400/50'
                      : 'bg-[#150709]/70 hover:bg-rose-950/30 border-rose-900/40 hover:border-rose-500/40'
                  }`}
                >
                  {/* Nomor & Icon Emoji */}
                  <div className="flex flex-col items-center shrink-0">
                    <span className="text-xl sm:text-2xl leading-none p-1.5 rounded-xl bg-black/40 border border-rose-500/20">
                      {option.icon}
                    </span>
                  </div>

                  {/* Info Ringkas */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight truncate">
                        {index + 1}. {option.title}
                      </h4>
                      <span className={`text-[10px] font-black shrink-0 px-2 py-0.5 rounded-md border ${
                        affordable 
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' 
                          : 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                      }`}>
                        {option.costLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                      {option.subtitle}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] font-bold">
                      <span className="text-amber-300 flex items-center gap-1">
                        <Target className="w-3 h-3" /> Efektivitas: {option.effectivenessPercent}%
                      </span>
                      <span className="text-slate-300 flex items-center gap-1">
                        <Skull className="w-3 h-3 text-rose-400" /> {option.casualtiesLabel}
                      </span>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div className="shrink-0 self-center">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-rose-400 bg-rose-500' : 'border-slate-600 bg-black/40'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* KOLOM KANAN: DETAIL ANALISIS AKIBAT */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-black/40 border border-rose-500/30 rounded-2xl p-4 sm:p-5">
            <div className="space-y-4 text-left">
              <div className="border-b border-rose-500/20 pb-3">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider">
                  <span>{currentSelected.icon}</span>
                  <span>{currentSelected.title}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-normal">
                  {currentSelected.description}
                </p>
              </div>

              {/* Rincian Parameter */}
              <div className="space-y-2.5">
                {/* Biaya Operasi */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#170609] border border-rose-500/20 text-xs">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" /> Biaya Operasi:
                  </span>
                  <span className={`font-black ${isBudgetSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currentSelected.costLabel}
                  </span>
                </div>

                {/* Efektivitas Pembubaran */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#170609] border border-rose-500/20 text-xs">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-400" /> Peluang Berhasil:
                  </span>
                  <span className="font-black text-white">
                    {currentSelected.effectivenessLabel}
                  </span>
                </div>

                {/* Perkiraan Korban Jiwa */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#170609] border border-rose-500/20 text-xs">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Skull className="w-4 h-4 text-rose-400" /> Korban Jiwa:
                  </span>
                  <span className="font-black text-rose-300">
                    {currentSelected.casualtiesLabel}
                  </span>
                </div>
              </div>

              {/* Box Peringatan Dampak Sosial & Internasional */}
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-1.5 text-xs text-left">
                <div className="flex items-center gap-1.5 text-rose-400 font-black uppercase text-[10px] tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Dampak & Konsekuensi</span>
                </div>
                <p className="text-[11px] text-rose-200 leading-relaxed">
                  {currentSelected.impactDescription}
                </p>
                {currentSelected.unNotificationRisk === 'high' && (
                  <p className="text-[10px] text-amber-300 font-bold flex items-center gap-1 pt-1 border-t border-rose-500/20">
                    <Globe2 className="w-3 h-3 shrink-0" /> Potensi Sidang HAM Internasional PBB Sangat Tinggi.
                  </p>
                )}
                {currentSelected.unNotificationRisk === 'sanctions' && (
                  <p className="text-[10px] text-rose-300 font-black flex items-center gap-1 pt-1 border-t border-rose-500/20">
                    <Globe2 className="w-3 h-3 shrink-0 text-red-500 animate-pulse" /> Resolusi Sanksi Embargo PBB Hampir Pasti Muncul!
                  </p>
                )}
              </div>
            </div>

            {/* Tombol Eksekusi Operasi */}
            <div className="pt-4 border-t border-rose-500/30 mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={!isBudgetSufficient}
                onClick={() => onSelectOption(currentSelected)}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
                  isBudgetSufficient
                    ? 'border-rose-400 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 text-white shadow-rose-900/50 hover:scale-[1.02]'
                    : 'border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                <span>{isBudgetSufficient ? 'Eksekusi Operasi' : 'Kas Tidak Cukup'}</span>
                {isBudgetSufficient && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
