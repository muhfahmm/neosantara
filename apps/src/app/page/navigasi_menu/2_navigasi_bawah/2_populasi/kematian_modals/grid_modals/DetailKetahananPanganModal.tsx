"use client";

import React from "react";
import { X, Utensils } from "lucide-react";

interface DetailKetahananPanganModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  selectedCountry?: any;
}

export default function DetailKetahananPanganModal({
  isOpen,
  onClose,
  countryDetail,
  selectedCountry,
}: DetailKetahananPanganModalProps) {
  if (!isOpen) return null;

  const indeks = countryDetail?.indeks_ketahanan_pangan ?? 60;
  const countryName = selectedCountry?.country || "Indonesia";
  const factor = 0.7 + (0.003 * indeks);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30">
              <Utensils className="h-6 w-6 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#00FFAA] tracking-tight leading-none uppercase">Ketahanan Pangan</h2>
              <p className="text-xs text-[#6B8A8A] font-medium mt-1">Pengaruh ketahanan pangan terhadap kematian di {countryName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <div className="space-y-6">
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-[#6B8A8A] uppercase tracking-wider">Indeks Ketahanan Pangan</p>
                  <p className="text-4xl font-black text-[#00FFAA] mt-1">{indeks}%</p>
                </div>
                <div className="p-4 bg-[#00FFAA]/10 rounded-full border border-[#00FFAA]/30">
                  <Utensils className="h-10 w-10 text-[#00FFAA]" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-[#0F2424] p-3 rounded-xl border border-emerald-500/30">
                  <p className="text-[10px] text-emerald-400 font-black uppercase">Faktor Pengali</p>
                  <p className="text-xl font-black text-emerald-400">× {factor.toFixed(3)}</p>
                </div>
                <div className="bg-[#0F2424] p-3 rounded-xl border border-[#00FFAA]/20">
                  <p className="text-[10px] text-[#6B8A8A] font-black uppercase">Semakin tinggi</p>
                  <p className="text-xl font-black text-emerald-400">semakin rendah kematian</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-[#6B8A8A] font-medium">
                Ketersediaan pangan yang cukup mengurangi risiko malnutrisi dan penyakit terkait kelaparan, sehingga menurunkan angka kematian.
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex justify-end relative z-10 shrink-0">
          <button onClick={onClose} className="px-8 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all font-black text-xs uppercase tracking-wider cursor-pointer">Tutup</button>
        </div>
      </div>
    </div>
  );
}