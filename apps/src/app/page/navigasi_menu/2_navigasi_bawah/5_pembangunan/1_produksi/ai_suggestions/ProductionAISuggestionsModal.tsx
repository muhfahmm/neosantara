"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState } from "react";
import { X, MessageSquare, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { ProductionSectorAnalysisResult, calculateDeficitDetailData } from "./productionAISuggestionsLogic";
import AIDetailDefisit from "../../../3_produksi_konsumsi/2_industri_pangan/AI_detail_defisit";
import NotebookModalWrapper from "../../../NotebookModalWrapper";

interface ProductionAISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ProductionSectorAnalysisResult | null;
  countryDetail: any;
  metadata: any;
  onBuildClick?: (buildingKey: string, label: string, quantity?: number) => void;
}

const formatNumber = (value: any) => {
  const parsed = Number(value) || 0;
  return parsed.toLocaleString('id-ID', { maximumFractionDigits: 2 });
};

export default function ProductionAISuggestionsModal({
  isOpen,
  onClose,
  analysis,
  countryDetail,
  metadata,
  onBuildClick,
}: ProductionAISuggestionsModalProps) {
  const [selectedDeficitKey, setSelectedDeficitKey] = useState<string | null>(null);

  if (!isOpen || !analysis) return null;

  const totalDeficitCommodities = analysis.commodities.filter(c => c.isDeficit).length;
  const totalSurplusCommodities = analysis.commodities.filter(c => c.isSurplus).length;
  const population = Number(countryDetail?.jumlah_penduduk) || 0;

  return (
    <>
      <NotebookModalWrapper onClose={onClose} zIndexClass="z-[75]">
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          
          {/* HEADER */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0 rounded-t-2xl">
            <div>
              <h3 className="text-base font-black uppercase tracking-[0.2em] text-root-accent">Rekomendasi & Analisis AI Sektor {analysis.sectorLabel}</h3>
              <p className="text-[11px] font-bold text-root-subtle uppercase tracking-wider">Evaluasi Kebutuhan & Pasokan Komoditas</p>
            </div>
            <SharedModalCloseButton
              onClick={onClose}
              className="p-1.5 lg:p-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
              aria-label="Tutup rekomendasi AI"
             appearance="custom">
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </SharedModalCloseButton>
          </div>

          {/* BODY */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm text-root-text bg-root-surface neon-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-rose-950/40 p-4 border border-rose-500/30">
                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-tight">Total Defisit Sektor</div>
                <div className="mt-1 font-black text-rose-400 text-lg">-{formatNumber(analysis.totalDeficit)}</div>
              </div>
              <div className="rounded-xl bg-emerald-950/40 p-4 border border-emerald-500/30">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Total Surplus Sektor</div>
                <div className="mt-1 font-black text-emerald-400 text-lg">+{formatNumber(analysis.totalSurplus)}</div>
              </div>
            </div>

            <div className="border-t border-root-accent/20 pt-4">
              <p className="font-bold text-root-accent uppercase tracking-wider mb-3">
                Rincian Analisis Komoditas ({analysis.commodities.length} Komoditas)
              </p>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 neon-scrollbar">
                {analysis.commodities.map((item, idx) => (
                  <div
                    key={idx}
                    className={`w-full flex justify-between items-center p-3 rounded-lg border transition-all ${
                      item.isDeficit
                        ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60'
                        : item.isSurplus
                        ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
                        : 'bg-root-canvas border-root-accent/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.isDeficit ? (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <span className="font-bold text-xs uppercase">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`font-black text-xs ${item.isDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.balance >= 0 ? `+${formatNumber(item.balance)}` : formatNumber(item.balance)}
                      </span>

                      {item.isDeficit && (
                        <button
                          onClick={() => setSelectedDeficitKey(item.key)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-[10px] font-bold uppercase transition-all cursor-pointer"
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
            <div className="rounded-xl bg-root-canvas p-4 border border-root-accent/30 flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-root-accent shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-black uppercase text-root-accent">Ringkasan AI:</div>
                <div className="text-xs text-root-text leading-relaxed">
                  {totalDeficitCommodities > 0
                    ? `Terdapat ${totalDeficitCommodities} komoditas di sektor ${analysis.sectorLabel} yang mengalami defisit pasokan. Klik tombol "Rekomendasi" pada komoditas defisit untuk melihat perhitungan jumlah unit pabrik/pertanian yang disarankan.`
                    : `Sektor ${analysis.sectorLabel} saat ini dalam kondisi sangat baik dan memenuhi kebutuhan nasional secara mandiri.`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </NotebookModalWrapper>

      {/* MODAL REKOMENDASI DETIL UNTUK KOMODITAS DEFISIT */}
      {selectedDeficitKey && (
        <AIDetailDefisit
          isOpen={Boolean(selectedDeficitKey)}
          onClose={() => setSelectedDeficitKey(null)}
          data={calculateDeficitDetailData(selectedDeficitKey, countryDetail, metadata)}
          onGotoProduction={(_tab: string, key: string, quantity?: number) => {
            const bLabel = metadata?.[key]?.label || key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
            setSelectedDeficitKey(null);
            onClose();
            if (onBuildClick) {
              onBuildClick(key, bLabel, quantity);
            }
          }}
        />
      )}
    </>
  );
}