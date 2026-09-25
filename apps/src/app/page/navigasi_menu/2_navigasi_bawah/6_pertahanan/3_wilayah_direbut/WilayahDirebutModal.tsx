"use client"
import React from "react";
import { X, Shield, Construction } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
}

export default function WilayahDirebutModal({ isOpen, onClose, countryDetail, setCountryDetail }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Wilayah yang Direbut</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">
                {countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || "Negara"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center w-full max-w-2xl py-6 text-center">
            
            {/* Ikon Konstruksi Besar */}
            <div className="p-6 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/30 mb-6 shadow-inner">
              <Construction className="w-20 h-20 text-[#00FFAA]" strokeWidth={1.5} />
            </div>

            {/* Judul Utama */}
            <h3 className="text-5xl md:text-6xl font-black uppercase text-[#E0E0E0] tracking-tight leading-[0.9] mb-4">
              Dalam<br />Pengembangan
            </h3>

            {/* Garis Pemisah Dekoratif */}
            <div className="w-16 h-1 bg-[#00FFAA] rounded-full mb-6" />

            {/* Sub Judul Keterangan */}
            <p className="text-sm md:text-base text-[#6B8A8A] font-medium leading-relaxed max-w-lg">
              Sistem data perebutan wilayah sedang dalam tahap pembangunan.
              Pantau terus perkembangan fitur ini untuk menguasai lebih banyak sektor strategis!
            </p>

            {/* Label Status "Segera Hadir" */}
            <div className="mt-8 inline-flex items-center rounded-full bg-[#0A1A1A] border border-[#00FFAA]/30 px-6 py-2 text-xs font-black uppercase tracking-widest text-[#00FFAA]">
              <span className="mr-2 h-2.5 w-2.5 animate-pulse rounded-full bg-[#00FFAA]" />
              Segera Hadir
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}