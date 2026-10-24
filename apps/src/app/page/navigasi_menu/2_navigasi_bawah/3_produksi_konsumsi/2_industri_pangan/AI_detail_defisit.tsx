"use client"
import React from "react";
import { X, AlertCircle, TrendingUp, Factory } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";

interface DeficitDetailProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    key: string;
    label: string;
    currentProd: number;
    currentCons: number;
    deficit: number;
    prodPerUnit: number;
    buildingsNeeded: number;
  } | null;
  onGotoProduction?: (tab: string, key: string, quantity?: number) => void;
}

// Helper format angka
const formatNumber = (value: any) => {
  const parsed = Number(value) || 0;
  return parsed.toLocaleString('id-ID');
};

export default function AIDetailDefisitModal({
  isOpen,
  onClose,
  data,
  onGotoProduction
}: DeficitDetailProps) {
  if (!isOpen || !data) return null;

  const {
    label,
    currentProd,
    currentCons,
    deficit,
    prodPerUnit,
    buildingsNeeded,
    key
  } = data;

  const handleBuild = () => {
    onGotoProduction?.('industri_pangan', key, buildingsNeeded);
  };

  return (
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[76]">
      <div className="flex h-full flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#00FFAA]/20 bg-[#0A1A1A] shrink-0">
          <div>
            <h3 className="text-base font-black uppercase tracking-[0.2em] text-[#00FFAA] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              Rincian Defisit
            </h3>
            <p className="text-[11px] font-bold text-[#6B8A8A] uppercase tracking-wider">{label}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
            aria-label="Tutup rincian defisit"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6 text-sm text-[#E0E0E0] neon-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-[#0A1A1A] p-4 border border-[#00FFAA]/20 text-center">
              <div className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-tight mb-1">Produksi Saat Ini</div>
              <div className="font-black text-emerald-400 text-lg">+{formatNumber(currentProd)}</div>
            </div>
            <div className="rounded-xl bg-[#0A1A1A] p-4 border border-rose-500/30 text-center">
              <div className="text-[10px] font-bold text-rose-300 uppercase tracking-tight mb-1">Total Konsumsi</div>
              <div className="font-black text-rose-400 text-lg">-{formatNumber(currentCons)}</div>
            </div>
            <div className="rounded-xl bg-[#0A1A1A] p-4 border border-rose-500/50 text-center">
              <div className="text-[10px] font-bold text-rose-300 uppercase tracking-tight mb-1">Total Defisit</div>
              <div className="font-black text-rose-400 text-lg">-{formatNumber(deficit)}</div>
            </div>
          </div>

          <div className="border-t border-[#00FFAA]/10 pt-4">
            <p className="font-bold text-[#00FFAA] uppercase tracking-wider mb-3">
              💡 Rekomendasi Kecukupan Pangan
            </p>
            
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center text-[#E0E0E0]">
                <span className="font-bold">Rumus Perhitungan:</span>
                <span className="text-xs font-bold text-[#6B8A8A]">(Defisit + 1) ÷ Produksi per Unit</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#0F2424] p-3 rounded-lg border border-[#00FFAA]/10 text-center">
                  <p className="text-[10px] text-[#6B8A8A] uppercase tracking-tight">Defisit</p>
                  <p className="text-lg font-black text-rose-400">-{formatNumber(deficit)}</p>
                </div>
                <div className="bg-[#0F2424] p-3 rounded-lg border border-[#00FFAA]/10 text-center">
                  <p className="text-[10px] text-[#6B8A8A] uppercase tracking-tight">Produksi / Unit</p>
                  <p className="text-lg font-black text-emerald-400">+{formatNumber(prodPerUnit)}</p>
                </div>
                <div className="bg-[#00FFAA]/10 p-3 rounded-lg border border-[#00FFAA]/30 text-center">
                  <p className="text-[10px] text-[#00FFAA] uppercase tracking-tight">Bangunan Dibutuhkan</p>
                  <p className="text-xl font-black text-[#00FFAA]">{buildingsNeeded} Unit</p>
                </div>
          </div>
            </div>
          </div>

          <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-black uppercase tracking-wider text-[#00FFAA] block mb-1 text-xs">🏗️ Kesimpulan AI:</span>
              <p className="text-sm text-[#E0E0E0]">
                Untuk menutupi defisit sebesar <span className="font-bold text-rose-400">-{formatNumber(deficit)}</span> dan mencapai surplus minimal +1, 
                Anda disarankan untuk membangun <span className="font-black text-[#00FFAA]">{buildingsNeeded} unit fasilitas {label}</span>.
              </p>
            </div>
            <button
              onClick={handleBuild}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 transition-all font-black text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer"
            >
              <Factory className="w-4 h-4" /> Bangun {buildingsNeeded} Unit
            </button>
          </div>

        </div>
      </div>
    </NotebookModalWrapper>
  );
}