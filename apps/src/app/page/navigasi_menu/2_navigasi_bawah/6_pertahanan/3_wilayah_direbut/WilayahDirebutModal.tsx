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
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />
        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-rose-700" />
              <div>
                <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Wilayah yang Direbut</h2>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 🔥 BODY MODAL - TAMPILAN DALAM PENGEMBANGAN */}
        <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center w-full max-w-2xl py-6 text-center">
            
            {/* Ikon Konstruksi Besar */}
            <div className="p-6 rounded-full bg-[#e4dac3]/30 border border-[#C4B49C]/30 mb-8">
              <Construction className="w-24 h-24 text-[#5c3c10]" strokeWidth={1.5} />
            </div>

            {/* Judul Utama (Tulisan Besar) */}
            <h3 className="text-6xl md:text-7xl font-black uppercase text-[#5c3c10] tracking-tight leading-[0.9] mb-4">
              Dalam<br />Pengembangan
            </h3>

            {/* Garis Pemisah Dekoratif */}
            <div className="w-16 h-1 bg-[#C4B49C] rounded-full mb-6" />

            {/* Sub Judul Keterangan */}
            <p className="text-sm md:text-base text-[#8b7e66] font-medium leading-relaxed max-w-lg">
              Sistem data perebutan wilayah sedang dalam tahap pembangunan.
              Pantau terus perkembangan fitur ini untuk menguasai lebih banyak sektor strategis!
            </p>

            {/* Label Status "Segera Hadir" dengan animasi */}
            <div className="mt-8 inline-flex items-center rounded-full bg-amber-100 border border-amber-300 px-6 py-2 text-xs font-black uppercase tracking-widest text-amber-700">
              <span className="mr-2 h-2.5 w-2.5 animate-pulse rounded-full bg-amber-600" />
              Segera Hadir
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}