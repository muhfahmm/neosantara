"use client"
import React from "react";
import { X, MessageSquare, AlertCircle, CheckCircle, Factory } from "lucide-react";
import { TempatUmumSectorAnalysis, HunianSectorAnalysis } from "./serviceAISuggestionsLogic";

interface ServiceAISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempatUmumAnalysis?: TempatUmumSectorAnalysis | null;
  hunianAnalysis?: HunianSectorAnalysis | null;
  onBuildClick?: (buildingKey: string, label: string, quantity?: number) => void;
}

export default function ServiceAISuggestionsModal({
  isOpen,
  onClose,
  tempatUmumAnalysis,
  hunianAnalysis,
  onBuildClick,
}: ServiceAISuggestionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden flex flex-col pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#00FFAA]/20 bg-[#0A1A1A] shrink-0">
          <div>
            <h3 className="text-base font-black uppercase tracking-[0.2em] text-[#00FFAA]">
              📊 Rekomendasi & Analisis AI Sektor {tempatUmumAnalysis?.tabLabel || hunianAnalysis?.tabLabel}
            </h3>
            <p className="text-[11px] font-bold text-[#6B8A8A] uppercase tracking-wider">
              Evaluasi Kebutuhan Publik & Hunian Masyarakat
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
            aria-label="Tutup rekomendasi AI"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm text-[#E0E0E0] bg-[#0F2424] no-scrollbar">
          
          {/* TEMPAT UMUM ANALYSIS */}
          {tempatUmumAnalysis && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#0A1A1A] p-4 border border-[#00FFAA]/20">
                  <div className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-tight">Indeks Kepuasan Publik</div>
                  <div className="mt-1 font-black text-[#00FFAA] text-2xl">{tempatUmumAnalysis.satisfactionScore} / 100</div>
                </div>
                <div className={`rounded-xl p-4 border ${
                  tempatUmumAnalysis.status === 'KRISIS' ? 'bg-rose-950/40 border-rose-500/30 text-rose-400' :
                  tempatUmumAnalysis.status === 'TERBATAS' ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' :
                  'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                }`}>
                  <div className="text-[10px] font-bold uppercase tracking-tight">Status Ketersediaan</div>
                  <div className="mt-1 font-black text-lg flex items-center gap-2">
                    {tempatUmumAnalysis.status === 'KRISIS' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                    {tempatUmumAnalysis.status === 'MENCUKUPI' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                    {tempatUmumAnalysis.status}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#0A1A1A] p-4 border border-[#00FFAA]/30 flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-[#00FFAA] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase text-[#00FFAA]">Rekomendasi AI:</div>
                  <div className="text-xs text-[#E0E0E0] leading-relaxed">{tempatUmumAnalysis.recommendation}</div>
                </div>
              </div>
            </>
          )}

          {/* HUNIAN ANALYSIS */}
          {hunianAnalysis && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-[#0A1A1A] p-4 border border-[#00FFAA]/20">
                  <div className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-tight">Kapasitas Per Unit</div>
                  <div className="mt-1 font-black text-[#00FFAA] text-lg">{hunianAnalysis.capacityPerUnit.toLocaleString('id-ID')} Jiwa</div>
                </div>
                <div className="rounded-xl bg-[#0A1A1A] p-4 border border-[#00FFAA]/20">
                  <div className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-tight">Total Kapasitas Terpasang</div>
                  <div className="mt-1 font-black text-[#00FFAA] text-lg">{hunianAnalysis.totalCapacity.toLocaleString('id-ID')} Jiwa</div>
                </div>
                <div className="rounded-xl bg-rose-950/40 p-4 border border-rose-500/30">
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-tight">Kebutuhan Unit Tambahan</div>
                  <div className="mt-1 font-black text-rose-400 text-lg">{hunianAnalysis.deficitUnitsNeeded.toLocaleString('id-ID')} Unit</div>
                </div>
              </div>

              <div className="rounded-xl bg-[#0A1A1A] p-4 border border-[#00FFAA]/30 flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-[#00FFAA] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase text-[#00FFAA]">Rekomendasi AI:</div>
                  <div className="text-xs text-[#E0E0E0] leading-relaxed">{hunianAnalysis.recommendation}</div>
                </div>
              </div>

              {hunianAnalysis.deficitUnitsNeeded > 0 && (
                <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20 flex items-center justify-between gap-4">
                  <span className="text-xs text-[#E0E0E0]">
                    Klik tombol untuk langsung menjadwalkan pembangunan <strong className="text-[#00FFAA]">{hunianAnalysis.deficitUnitsNeeded} unit {hunianAnalysis.tabLabel}</strong>.
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onBuildClick?.(hunianAnalysis.tabId, hunianAnalysis.tabLabel, hunianAnalysis.deficitUnitsNeeded);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 transition-all font-black text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer shadow-md"
                  >
                    <Factory className="w-4 h-4" /> Bangun {hunianAnalysis.deficitUnitsNeeded} Unit
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
