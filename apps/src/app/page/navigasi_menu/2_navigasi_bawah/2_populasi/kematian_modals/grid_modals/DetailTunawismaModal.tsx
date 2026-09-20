"use client";

import React from "react";
import { X, Home } from "lucide-react";
import { calculateTunawismaLogic } from "../logic/tunawismaLogic";

interface DetailTunawismaModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  selectedCountry?: any;
}

export default function DetailTunawismaModal({
  isOpen,
  onClose,
  countryDetail,
  selectedCountry,
}: DetailTunawismaModalProps) {
  if (!isOpen) return null;

  const populasi = countryDetail?.jumlah_penduduk || 10_000_000;
  const rawHomeless = countryDetail?.tunawisma ?? 0;
  const result = calculateTunawismaLogic(countryDetail, populasi, rawHomeless);
  const countryName = selectedCountry?.country || "Indonesia";
  const ratio = result.homelessCount / populasi;
  const formatNumber = (num: number) => num.toLocaleString('id-ID');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
        <div className="px-6 sm:px-8 py-4 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30">
              <Home className="h-6 w-6 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#00FFAA] tracking-tight leading-none uppercase">Tunawisma</h2>
              <p className="text-xs text-[#6B8A8A] font-medium mt-1">Dampak tunawisma terhadap kematian di {countryName}</p>
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
                  <p className="text-sm font-black text-[#6B8A8A] uppercase tracking-wider">Jumlah Tunawisma (Tersesuaikan)</p>
                  <p className="text-4xl font-black text-[#00FFAA] mt-1">{formatNumber(result.homelessCount)} <span className="text-lg text-[#6B8A8A] font-bold">jiwa</span></p>
                </div>
                <div className="p-4 bg-[#00FFAA]/10 rounded-full border border-[#00FFAA]/30">
                  <Home className="h-10 w-10 text-[#00FFAA]" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0F2424] p-3 rounded-xl border border-[#00FFAA]/20">
                  <p className="text-[10px] text-[#6B8A8A] font-black uppercase">Persentase</p>
                  <p className="text-xl font-black text-[#00FFAA]">{(ratio * 100).toFixed(2)}%</p>
                </div>
                <div className="bg-[#0F2424] p-3 rounded-xl border border-[#00FFAA]/20">
                  <p className="text-[10px] text-[#6B8A8A] font-black uppercase">Bangunan Pendukung</p>
                  <p className="text-xl font-black text-[#E0E0E0]">{result.totalBangunanHunian} / {result.idealHunian}</p>
                </div>
                <div className="bg-[#0F2424] p-3 rounded-xl border border-[#00FFAA]/20">
                  <p className="text-[10px] text-[#6B8A8A] font-black uppercase">Rasio Ketersediaan</p>
                  <p className="text-xl font-black text-[#E0E0E0]">{result.hunianRatio.toFixed(2)}</p>
                </div>
                <div className="bg-[#0F2424] p-3 rounded-xl border border-rose-500/30">
                  <p className="text-[10px] text-rose-400 font-black uppercase">Faktor Pengali Kematian</p>
                  <p className="text-xl font-black text-rose-400">× {result.homelessFactor.toFixed(3)}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-[#6B8A8A] font-medium">
                Pembangunan kawasan komersial dan akomodasi (mall, hotel, pusat grosir) membantu menurunkan jumlah tunawisma secara tidak langsung melalui penciptaan lapangan kerja dan opsi hunian sementara. Semakin banyak bangunan pendukung, persentase tunawisma riil berkurang, sehingga menekan angka kematian akibat ketiadaan tempat tinggal layak.
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