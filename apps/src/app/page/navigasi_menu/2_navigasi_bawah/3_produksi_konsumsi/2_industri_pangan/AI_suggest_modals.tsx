"use client"
import React from "react";
import { X, AlertCircle, CheckCircle, MessageSquare, ArrowRight } from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden flex flex-col pointer-events-auto">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-base font-black uppercase tracking-[0.2em] text-[#00FFAA]">Analisis Sektor AI</h3>
            <p className="text-[11px] font-bold text-[#6B8A8A] uppercase tracking-wider">{sectorLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
            aria-label="Tutup analisis AI"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm text-[#E0E0E0] bg-[#0F2424] no-scrollbar">
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

          <div className="border-t border-[#00FFAA]/20 pt-4">
            <p className="font-bold text-[#00FFAA] uppercase tracking-wider mb-3">
              Rincian Komoditas ({commodities.length} item)
            </p>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
              {commodities.map((item, idx) => (
                <div
                  key={idx}
                  className={`w-full flex justify-between items-center p-3 rounded-lg border transition-all ${
                    item.isDeficit
                      ? 'border-rose-500/40 bg-rose-950/30'
                      : item.isSurplus
                      ? 'border-emerald-500/40 bg-emerald-950/30'
                      : 'border-[#00FFAA]/20 bg-[#0A1A1A]'
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
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#00FFAA] opacity-80 whitespace-nowrap group-hover:opacity-100">Detail</span>
                      </button>
                    ) : item.isSurplus ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : null}

                    <span className="font-bold tracking-tight text-[#E0E0E0]">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-black ${
                        item.isDeficit
                          ? 'text-rose-400'
                          : item.isSurplus
                          ? 'text-emerald-400'
                          : 'text-[#6B8A8A]'
                      }`}
                    >
                      {item.isDeficit ? '-' : item.isSurplus ? '+' : ''}
                      {formatNumber(Math.abs(item.balance))}
                    </span>
                    {item.key && (
                      <button
                        onClick={() => onCommodityClick?.(item.key!)}
                        className="ml-1 p-1 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 hover:bg-[#00FFAA] hover:text-[#0A1A1A] text-[#00FFAA] transition-colors cursor-pointer"
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

          <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/30 text-[11px] text-[#6B8A8A]">
            <span className="font-black uppercase tracking-wider text-[#00FFAA]">💡 Saran AI:</span>
            {totalDeficit > 0 ? (
              <p className="mt-1 text-[#E0E0E0]">
                Deteksi defisit pada {totalDeficitCommodities} komoditas. Klik ikon <b className="text-rose-400">tanda seru merah (!)</b> pada komoditas yang defisit untuk melihat rekomendasi jumlah bangunan yang harus dibangun.
              </p>
            ) : totalSurplus > 0 ? (
              <p className="mt-1 text-[#E0E0E0]">
                Sektor ini surplus ({totalSurplusCommodities} komoditas). Anda dapat mengekspor komoditas berlebih untuk menambah pendapatan negara atau meningkatkan populasi.
              </p>
            ) : (
              <p className="mt-1 text-[#E0E0E0]">
                Neraca sektor ini seimbang. Pertahankan kondisi saat ini.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}