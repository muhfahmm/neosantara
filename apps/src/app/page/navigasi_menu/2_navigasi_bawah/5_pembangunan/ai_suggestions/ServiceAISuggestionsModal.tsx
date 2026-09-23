"use client"
import React from "react";
import { X, MessageSquare, AlertCircle, CheckCircle, ArrowRight, Factory } from "lucide-react";
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
              📊 REKOMENDASI & ANALISIS AI SEKTOR {tempatUmumAnalysis?.tabLabel || hunianAnalysis?.tabLabel}
            </h3>
            <p className="text-[11px] font-bold text-[#6B8A8A] uppercase tracking-wider">
              EVALUASI KEBUTUHAN PUBLIK & HUNIAN MASYARAKAT
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
              {/* CARD INDEKS KEPUASAN RAKYAT (SEPERTI GAMBAR 1) */}
              <div className="bg-[#0A1A1A] p-5 rounded-2xl border border-[#00FFAA]/30 flex flex-col gap-4 shadow-inner">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-[#6B8A8A] uppercase tracking-wider max-w-[70%]">
                    INDEKS KEPUASAN RAKYAT ({tempatUmumAnalysis.tabLabel.toUpperCase()})
                  </span>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-black text-[#00FFAA] tracking-tight">
                      {tempatUmumAnalysis.satisfactionScore} / 100
                    </span>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="w-full h-3 bg-[#0F2424] rounded-full overflow-hidden border border-[#00FFAA]/20 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      tempatUmumAnalysis.satisfactionScore <= 40
                        ? "bg-rose-500"
                        : tempatUmumAnalysis.satisfactionScore <= 75
                        ? "bg-amber-400"
                        : "bg-[#00FFAA]"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(2, tempatUmumAnalysis.satisfactionScore))}%` }}
                  />
                </div>

                {/* STATUS MESSAGE & DOT INDICATOR */}
                <div className="flex items-center gap-2 text-xs font-bold text-[#E0E0E0]">
                  <span>
                    {tempatUmumAnalysis.satisfactionScore <= 40
                      ? `🔴 Krisis fasilitas ${tempatUmumAnalysis.tabLabel.toLowerCase()}, tingkat keterpenuhan sangat rendah.`
                      : tempatUmumAnalysis.satisfactionScore <= 75
                      ? `⚠️ Fasilitas ${tempatUmumAnalysis.tabLabel.toLowerCase()} masih terbatas, perlu pembangunan lebih lanjut.`
                      : `✅ Ketersediaan fasilitas ${tempatUmumAnalysis.tabLabel.toLowerCase()} sangat mencukupi bagi seluruh rakyat.`}
                  </span>
                </div>

                {/* DIVIDER & METRICS */}
                <div className="border-t border-[#00FFAA]/15 pt-3 flex justify-between items-center text-xs text-[#6B8A8A] font-semibold">
                  <div>
                    Rasio per kapita: <strong className="text-[#E0E0E0] font-black">{tempatUmumAnalysis.ratio.toFixed(6)}</strong>
                  </div>
                  <div>
                    Persentase keterpenuhan: <strong className="text-[#E0E0E0] font-black">{tempatUmumAnalysis.percentageMet.toFixed(1)}%</strong>
                  </div>
                </div>
              </div>

              {/* RINCIAN ANALISIS FASILITAS (SEPERTI GAMBAR 2) */}
              <div className="border-t border-[#00FFAA]/20 pt-4">
                <p className="font-bold text-[#00FFAA] uppercase tracking-wider mb-3 text-xs">
                  RINCIAN ANALISIS FASILITAS ({tempatUmumAnalysis.facilities.length} FASILITAS)
                </p>
                <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1 no-scrollbar">
                  {tempatUmumAnalysis.facilities.map((item, idx) => (
                    <div
                      key={idx}
                      className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all ${
                        item.isDeficit
                          ? "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60"
                          : "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.isDeficit ? (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-xs uppercase text-[#E0E0E0] block">{item.label}</span>
                          <span className="text-[10px] text-[#6B8A8A] block">
                            Tersedia: <strong className="text-[#E0E0E0]">{item.count} Unit</strong> | Target Ideal: {item.targetCount} Unit
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`font-black text-xs ${item.isDeficit ? "text-rose-400" : "text-emerald-400"}`}>
                          {item.isDeficit ? `Defisit -${item.deficit} Unit` : `Mencukupi (${item.count} Unit)`}
                        </span>

                        {item.isDeficit && (
                          <button
                            onClick={() => {
                              onClose();
                              onBuildClick?.(item.key, item.label, item.recommendedBuildQty);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-[10px] font-bold uppercase transition-all cursor-pointer active:scale-95 shadow-sm"
                          >
                            Rekomendasi <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI SUMMARY TEXT */}
              <div className="rounded-xl bg-[#0A1A1A] p-4 border border-[#00FFAA]/30 flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-[#00FFAA] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase text-[#00FFAA]">Ringkasan AI:</div>
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

              {/* RINCIAN ANALISIS HUNIAN */}
              <div className="border-t border-[#00FFAA]/20 pt-4">
                <p className="font-bold text-[#00FFAA] uppercase tracking-wider mb-3 text-xs">
                  RINCIAN ANALISIS HUNIAN PERMUKIMAN ({hunianAnalysis.housingItems.length} KATEGORI)
                </p>
                <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1 no-scrollbar">
                  {hunianAnalysis.housingItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all ${
                        item.isDeficit
                          ? "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60"
                          : "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.isDeficit ? (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-xs uppercase text-[#E0E0E0] block">{item.label}</span>
                          <span className="text-[10px] text-[#6B8A8A] block">
                            Kapasitas/Unit: {item.capacityPerUnit} Jiwa | Terpasang: <strong className="text-[#E0E0E0]">{item.count} Unit</strong> ({item.totalCapacity.toLocaleString('id-ID')} Jiwa)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`font-black text-xs ${item.isDeficit ? "text-rose-400" : "text-emerald-400"}`}>
                          {item.isDeficit ? `Kebutuhan +${item.deficitUnitsNeeded} Unit` : `Mencukupi`}
                        </span>

                        {item.isDeficit && (
                          <button
                            onClick={() => {
                              onClose();
                              onBuildClick?.(item.key, item.label, item.deficitUnitsNeeded);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-[10px] font-bold uppercase transition-all cursor-pointer active:scale-95 shadow-sm"
                          >
                            Rekomendasi <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI SUMMARY TEXT */}
              <div className="rounded-xl bg-[#0A1A1A] p-4 border border-[#00FFAA]/30 flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-[#00FFAA] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase text-[#00FFAA]">Ringkasan AI:</div>
                  <div className="text-xs text-[#E0E0E0] leading-relaxed">{hunianAnalysis.recommendation}</div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
