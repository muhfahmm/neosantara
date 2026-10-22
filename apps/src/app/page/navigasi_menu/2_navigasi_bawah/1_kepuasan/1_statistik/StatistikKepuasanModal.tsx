"use client";

import Image from "next/image";
import { X, Smile, TrendingUp } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import {
  calculateKepuasan,
  calculateSatisfactionIndicatorScores,
  calculateEconomicPolicySatisfaction,
  calculateSubsidySatisfaction,
} from "@/app/logic/kepuasanCalculator";

interface StatistikKepuasanModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveMenu?: (menu: string) => void;
  onOpenTempatUmum?: (tabId: string) => void;
  countryDetail: any;
  setCountryDetail?: (detail: any) => void;
  selectedCountry: any;
  metadata?: any;
}

export default function StatistikKepuasanModal({
  isOpen,
  onClose,
  setActiveMenu,
  onOpenTempatUmum,
  countryDetail,
  selectedCountry,
  metadata
}: StatistikKepuasanModalProps) {
  
  if (!isOpen) return null;

  // Gunakan utility terpusat agar konsisten dengan nilai di navbar
  const sectorScores = calculateSatisfactionIndicatorScores(countryDetail, metadata ?? {});
  const generalSatisfaction = calculateKepuasan(countryDetail, metadata);
  const economicPolicySatisfaction = calculateEconomicPolicySatisfaction(countryDetail);
  const subsidySatisfaction = calculateSubsidySatisfaction(countryDetail);

  // Sektor-sektor yang diminta
  const sectors = [
    { 
      name: "Pajak", 
      score: sectorScores.pajak,
      image: "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-01.svg",
      color: "text-emerald-600", 
      menuId: "Menu:Pajak"
    },
    { 
      name: "Harga Barang Pokok", 
      score: sectorScores.harga,
      image: "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-02.svg",
      color: "text-amber-600", 
      menuId: "Menu:Harga"
    },
    { 
      name: "Produksi Pangan", 
      score: sectorScores.pangan,
      image: "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-03.svg",
      color: "text-green-600", 
      menuId: "Menu:IndustriPangan"
    },
    { 
      name: "Produksi Listrik", 
      score: sectorScores.listrik,
      image: "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-04.svg",
      color: "text-blue-600", 
      menuId: "Menu:Kelistrikan"
    },
    { 
      name: "Hunian Permukiman", 
      score: sectorScores.hunian,
      image: "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-05.svg",
      color: "text-rose-600", 
      menuId: "Menu:HunianPermukiman"
    },
    { 
      name: "Layanan Publik & Tempat Umum", 
      score: sectorScores.layananPublik,
      image: "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-06.svg",
      color: "text-yellow-700", 
      menuId: "Menu:TempatUmum"
    },
    { 
      name: "Doktrin & Keterbukaan", 
      score: sectorScores.keterbukaan,
      image: "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-07.svg",
      color: "text-indigo-600", 
      menuId: "Menu:DoktrinKeterbukaan"
    },
    {
      name: "Kebijakan & Sistem Ekonomi",
      score: economicPolicySatisfaction,
      image: "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-08.svg",
      color: "text-cyan-600",
      menuId: "Menu:SistemEkonomi"
    },
    {
      name: "Alokasi & Kebijakan Subsidi",
      score: subsidySatisfaction,
      image: "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-09.svg",
      color: "text-amber-600",
      menuId: "Menu:KebijakanSubsidi"
    },
    {
      name: "Integritas & Anti-Korupsi",
      score: sectorScores.integritas,
      image: "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-10.svg",
      color: "text-emerald-600",
      menuId: "Menu:AntiKorupsi"
    }
  ];

  return (
    <NotebookModalWrapper onClose={onClose} maxWidthClass="max-w-4xl lg:max-w-[1000px] xl:max-w-[1100px] 2xl:max-w-6xl">
      <div className="flex flex-col h-full overflow-hidden bg-[#0A1A1A] rounded-xl border border-[#00FFAA]/20 shadow-[0_0_30px_rgba(0,255,170,0.15)]">
        
        {/* ================= HEADER ================= */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0 shadow-[0_0_10px_rgba(0,255,170,0.2)]">
                <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase drop-shadow-[0_0_8px_rgba(0,255,170,0.5)]">
                  Kepuasan Rakyat
                </h2>
              </div>
            </div>

            <div className="flex items-center bg-[#0A1A1A] p-0.5 sm:p-1 rounded-lg border border-[#00FFAA]/30">
              <button className="px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all bg-[#00FFAA] text-[#0A1A1A] cursor-pointer shadow-[0_0_10px_rgba(0,255,170,0.4)]">
                Statistik
              </button>
              <button
                onClick={() => setActiveMenu?.("Action:NaikkanKepuasan")}
                className="px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all text-[#6B8A8A] hover:text-[#E0E0E0] cursor-pointer"
              >
                Naikkan Peringkat
              </button>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] hover:shadow-[0_0_15px_rgba(0,255,170,0.3)] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ================= CONTENT (SCROLLABLE AREA) ================= */}
        {/* 
          Di sini kuncinya: Kita menggunakan Arbitrary Variants Tailwind 
          untuk mengkustomisasi ::-webkit-scrollbar langsung di className.
        */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 relative z-10 custom-scrollbar
          [&::-webkit-scrollbar]:w-2 
          [&::-webkit-scrollbar-track]:bg-[#0A1A1A] 
          [&::-webkit-scrollbar-track]:rounded-full 
          [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-[#00FFAA]/20
          [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#00FFAA] [&::-webkit-scrollbar-thumb]:to-[#00B37A]
          [&::-webkit-scrollbar-thumb]:rounded-full 
          [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#0A1A1A]
          [&::-webkit-scrollbar-thumb]:shadow-[0_0_10px_rgba(0,255,170,0.6)]
          hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-[#00FFAA]
          [&::-webkit-scrollbar-button]:hidden
        ">
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
            
            {/* Kartu Skor Umum */}
            <div className="bg-[#0F2424] border border-[#00FFAA]/30 p-2.5 lg:p-3 2xl:p-4 rounded-xl flex flex-row items-center justify-between gap-2.5 lg:gap-3 shadow-[inset_0_0_20px_rgba(0,255,170,0.05)] relative overflow-hidden">
              {/* Efek pendaran di background card */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFAA]/5 blur-3xl rounded-full pointer-events-none"></div>

              <div className="flex items-center gap-2.5 lg:gap-3 relative z-10">
                <div className="w-9 h-9 lg:w-11 lg:h-11 2xl:w-14 2xl:h-14 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,255,170,0.2)]">
                  <Smile className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-7 2xl:w-7 text-[#00FFAA]" />
                </div>
                <div>
                  <h3 className="text-xs lg:text-sm 2xl:text-base font-black text-[#E0E0E0] uppercase tracking-wide leading-none mb-0.5 lg:mb-1">
                    Persetujuan Umum Rakyat
                  </h3>              
                </div>
              </div>
              <div className="text-right bg-[#0A1A1A] border border-[#00FFAA]/30 px-2.5 lg:px-3.5 2xl:px-4 py-1 lg:py-1.5 2xl:py-2 rounded-lg shrink-0 min-w-[75px] lg:min-w-[95px] 2xl:min-w-[110px] relative z-10 shadow-[0_0_10px_rgba(0,255,170,0.1)]">
                <p className="text-base lg:text-xl 2xl:text-2xl font-black text-[#00FFAA] tracking-tight leading-none drop-shadow-[0_0_5px_rgba(0,255,170,0.5)]">
                  {Math.round(generalSatisfaction)}%
                </p>
                <p className="text-[8px] lg:text-[9px] text-[#00FFAA] font-bold uppercase tracking-wider mt-0.5 flex items-center justify-end gap-0.5">
                  <TrendingUp className="h-2 w-2 lg:h-2.5 lg:w-2.5" /> Stabil
                </p>
              </div>
            </div>

            <section>
                <div className="flex items-center gap-2.5 lg:gap-3 mb-3 lg:mb-4 2xl:mb-5 px-1">
                  <div className="p-1 lg:p-1.5 rounded-lg bg-[#0F2424] border border-[#00FFAA]/30 shadow-[0_0_8px_rgba(0,255,170,0.2)]">
                    <TrendingUp className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#00FFAA]" />
                  </div>
                  <h3 className="text-sm lg:text-base 2xl:text-lg font-black text-[#E0E0E0] uppercase tracking-wider italic">
                    Sektor Utama
                  </h3>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-[#00FFAA]/50 to-transparent ml-2 lg:ml-4"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 lg:gap-3 2xl:gap-4">
                  {sectors.map((sector) => {
                    return (
                      <button
                        key={sector.name}
                        onClick={() => {
                          setActiveMenu?.(sector.menuId);
                        }}
                        className="bg-[#0F2424] border border-[#00FFAA]/20 p-2.5 lg:p-3.5 2xl:p-5 rounded-xl 2xl:rounded-2xl flex gap-2.5 lg:gap-3.5 2xl:gap-4 transition-all duration-300 hover:border-[#00FFAA] hover:bg-[#00FFAA]/5 hover:shadow-[0_0_15px_rgba(0,255,170,0.15)] relative overflow-hidden group cursor-pointer text-left items-center"
                      >
                        {/* Efek Glow pada Card saat Hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#00FFAA]/0 via-[#00FFAA]/5 to-[#00FFAA]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="shrink-0 relative z-10">
                          <Image
                            src={sector.image}
                            alt=""
                            width={56}
                            height={56}
                            className="h-10 w-10 object-contain lg:h-12 lg:w-12 2xl:h-14 2xl:w-14 transition-transform duration-300 group-hover:scale-110 drop-shadow-md"
                          />
                        </div>
                        <div className="flex-1 space-y-1 lg:space-y-1.5 min-w-0 relative z-10">
                          <div className="flex items-center justify-between text-[11px] lg:text-xs font-black text-[#E0E0E0] uppercase group-hover:text-[#00FFAA] transition-colors">
                            <span className="pr-1 whitespace-normal leading-tight">{sector.name}</span>
                            <span className="text-[#00FFAA] shrink-0 drop-shadow-[0_0_5px_rgba(0,255,170,0.4)]">{sector.score}%</span>
                          </div>
                          
                          {/* Progress Bar Modern */}
                          <div className="h-1.5 lg:h-2 2xl:h-2.5 w-full bg-[#0A1A1A] rounded-full overflow-hidden border border-[#00FFAA]/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                            <div 
                              className="h-full bg-gradient-to-r from-[#00B37A] to-[#00FFAA] rounded-full shadow-[0_0_8px_rgba(0,255,170,0.8)] transition-all duration-1000 ease-out" 
                              style={{ width: `${sector.score}%` }} 
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
            </section>

          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}