"use client"
import React from "react";
import { AlertCircle, CheckCircle, MessageSquare, ArrowRight, Utensils } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { SECTOR_MAP } from "./logic/AI_suggestionsLogic";

interface AISuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectorLabel: string;
  totalDeficit: number;
  totalSurplus: number;
  commodities: {
    key?: string;
    label: string;
    balance: number;
    isDeficit: boolean;
    isSurplus: boolean;
  }[];
  onCommodityClick?: (commodityKey: string) => void;
  onDeficitClick?: (commodityKey: string) => void;
}

// Helper lokal untuk memformat angka
const formatNumber = (value: any) => {
  const parsed = Number(value) || 0;
  return parsed.toLocaleString('id-ID');
};

export default function AISuggestModal({
  isOpen,
  onClose,
  sectorLabel,
  totalDeficit,
  totalSurplus,
  commodities,
  onCommodityClick,
  onDeficitClick,
}: AISuggestModalProps) {
  if (!isOpen) return null;

  const totalDeficitCommodities = commodities.filter(c => c.isDeficit).length;
  const totalSurplusCommodities = commodities.filter(c => c.isSurplus).length;
  const SectorIcon = Object.values(SECTOR_MAP).find(sector => sector.label === sectorLabel)?.icon ?? Utensils;

  return (
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[75]">
      <div className="flex h-full flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="shrink-0 rounded-lg border border-root-accent/30 bg-root-surface p-1 sm:p-1.5">
              <SectorIcon className="h-4 w-4 text-root-accent sm:h-5 sm:w-5" />
            </div>
            <h2 className={`${rootModalTypography.title} min-w-0`}>Analisis Sektor AI - {sectorLabel}</h2>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-root-surface p-6 text-sm text-root-text neon-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-rose-950/40 p-4 border border-rose-500/30">
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-tight">Total Defisit</div>
              <div className="mt-1 font-black text-rose-400 text-lg">-{formatNumber(totalDeficit)}</div>
            </div>
            <div className="rounded-xl bg-emerald-950/40 p-4 border border-emerald-500/30">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Total Surplus</div>
              <div className="mt-1 font-black text-emerald-400 text-lg">+{formatNumber(totalSurplus)}</div>
            </div>
          </div>

          <div className="border-t border-root-accent/20 pt-4">
            <p className="font-bold text-root-accent uppercase tracking-wider mb-3">
              Rincian Komoditas ({commodities.length} item)
            </p>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 neon-scrollbar">
              {commodities.map((item, idx) => (
                <div
                  key={idx}
                  className={`w-full flex justify-between items-center p-3 rounded-lg border transition-all ${
                    item.isDeficit
                      ? 'border-rose-500/40 bg-rose-950/30'
                      : item.isSurplus
                      ? 'border-emerald-500/40 bg-emerald-950/30'
                      : 'border-root-accent/20 bg-root-canvas'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.isDeficit ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.key) onDeficitClick?.(item.key);
                        }}
                        className="group relative p-1 rounded-full hover:bg-rose-900/50 transition-colors cursor-pointer focus:outline-none"
                        title="Klik untuk Lihat Detail Defisit & Rekomendasi"
                      >
                        <AlertCircle className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-root-accent opacity-80 whitespace-nowrap group-hover:opacity-100">Detail</span>
                      </button>
                    ) : item.isSurplus ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : null}

                    <span className="font-bold tracking-tight text-root-text">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-black ${
                        item.isDeficit
                          ? 'text-rose-400'
                          : item.isSurplus
                          ? 'text-emerald-400'
                          : 'text-root-subtle'
                      }`}
                    >
                      {item.isDeficit ? '-' : item.isSurplus ? '+' : ''}
                      {formatNumber(Math.abs(item.balance))}
                    </span>
                    {item.key && (
                      <button
                        onClick={() => onCommodityClick?.(item.key!)}
                        className="ml-1 p-1 rounded-lg bg-root-canvas border border-root-accent/30 hover:bg-root-accent hover:text-root-canvas text-root-accent transition-colors cursor-pointer"
                        title="Buka Halaman Produksi"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-root-canvas p-4 rounded-xl border border-root-accent/30 text-[11px] text-root-subtle">
            <span className="font-black uppercase tracking-wider text-root-accent">💡 Saran AI:</span>
            {totalDeficit > 0 ? (
              <p className="mt-1 text-root-text">
                Deteksi defisit pada {totalDeficitCommodities} komoditas. Klik ikon <b className="text-rose-400">tanda seru merah (!)</b> pada komoditas yang defisit untuk melihat rekomendasi jumlah bangunan yang harus dibangun.
              </p>
            ) : totalSurplus > 0 ? (
              <p className="mt-1 text-root-text">
                Sektor ini surplus ({totalSurplusCommodities} komoditas). Anda dapat mengekspor komoditas berlebih untuk menambah pendapatan negara atau meningkatkan populasi.
              </p>
            ) : (
              <p className="mt-1 text-root-text">
                Neraca sektor ini seimbang. Pertahankan kondisi saat ini.
              </p>
            )}
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}