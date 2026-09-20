"use client";

import React from "react";
import { X, Users } from "lucide-react";

interface DetailPopulasiDasarModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  selectedCountry?: any;
}

export default function DetailPopulasiDasarModal({
  isOpen,
  onClose,
  countryDetail,
  selectedCountry,
}: DetailPopulasiDasarModalProps) {
  if (!isOpen) return null;

  const populasi = countryDetail?.jumlah_penduduk || 10_000_000;
  const formatNumber = (num: number) => num.toLocaleString('id-ID');
  const countryName = selectedCountry?.country || "Indonesia";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
        <div className="px-6 sm:px-8 py-4 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30">
              <Users className="h-6 w-6 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#00FFAA] tracking-tight leading-none uppercase">Populasi Dasar</h2>
              <p className="text-xs text-[#6B8A8A] font-medium mt-1">Dasar perhitungan kelahiran di {countryName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <div className="space-y-6">
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-[#6B8A8A] uppercase tracking-wider">Total Populasi</p>
                  <p className="text-4xl font-black text-[#E0E0E0] mt-1">{formatNumber(populasi)} <span className="text-lg text-[#6B8A8A] font-bold">jiwa</span></p>
                </div>
                <div className="p-4 bg-[#00FFAA]/10 rounded-full border border-[#00FFAA]/30">
                  <Users className="h-10 w-10 text-[#00FFAA]" />
                </div>
              </div>
              <p className="mt-4 text-xs text-[#6B8A8A] font-medium">
                Populasi dasar ini menjadi acuan utama perhitungan angka kelahiran. Semakin besar jumlah penduduk, semakin banyak potensi kelahiran yang terjadi setiap harinya.
              </p>
            </div>
            <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-black text-[#00FFAA] uppercase">Bagaimana Populasi Mempengaruhi Kelahiran?</h4>
              <p className="text-sm text-[#E0E0E0] leading-relaxed">
                Angka kelahiran dasar dihitung dengan mengalikan jumlah populasi dengan tingkat kelahiran dasar (base birth rate). Dalam simulasi ini, tingkat kelahiran dasar adalah <strong>0.00014</strong> dari total populasi per hari.
              </p>
              <div className="mt-2 p-3 bg-[#0A1A1A] rounded-lg border border-[#00FFAA]/20 text-xs">
                <p className="font-mono text-[#00FFAA]">
                  Contoh: {formatNumber(populasi)} × 0.00014 = {formatNumber(Math.floor(populasi * 0.00014))} kelahiran dasar per hari
                </p>
              </div>
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