"use client";

import { useState, useEffect } from "react";
import { X, Smile, TrendingUp, Landmark, Coins, Apple, Plug, Home, Globe } from "lucide-react";
import {
  calculatePajakScore,
  calculateHargaScore,
  calculatePanganScore,
  calculateListrikScore,
  calculateHunianScore,
  calculateLayananPublikScore,
  calculateKeterbukaanScore,
} from "@/app/logic/kepuasanCalculator";

interface StatistikKepuasanModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveMenu?: (menu: string) => void;
  countryDetail: any;
  setCountryDetail?: (detail: any) => void;
  selectedCountry: any;
  metadata?: any;
}

export default function StatistikKepuasanModal({
  isOpen,
  onClose,
  setActiveMenu,
  countryDetail,
  setCountryDetail,
  selectedCountry,
  metadata
}: StatistikKepuasanModalProps) {
  
  if (!isOpen) return null;

  // Gunakan utility terpusat agar konsisten dengan nilai di navbar
  const pajakScore   = calculatePajakScore(countryDetail);
  const hargaScore   = calculateHargaScore(countryDetail);
  const panganScore  = calculatePanganScore(countryDetail, metadata);
  const listrikScore = calculateListrikScore(countryDetail, metadata);
  const hunianScore  = calculateHunianScore(countryDetail, metadata);
  const layananPublikScore = calculateLayananPublikScore(countryDetail);
  const keterbukaanScore   = calculateKeterbukaanScore(countryDetail);
  
  // Hitung general satisfaction sebagai rata-rata dari 7 sektor
  const generalSatisfaction = (pajakScore + hargaScore + panganScore + listrikScore + hunianScore + layananPublikScore + keterbukaanScore) / 7;

  // Update kepuasan di countryDetail setiap kali generalSatisfaction berubah
  useEffect(() => {
    if (isOpen && setCountryDetail && countryDetail) {
      // Hanya update jika kepuasan benar-benar berubah (mencegah infinite loop)
      if (Math.abs((countryDetail.kepuasan ?? 50) - generalSatisfaction) < 0.1) return;
      
      setCountryDetail({
        ...countryDetail,
        kepuasan: generalSatisfaction,
      });
    }
  }, [isOpen, generalSatisfaction]);

  // Sektor-sektor yang diminta
  const sectors = [
    { 
      name: "Pajak", 
      score: Math.round(pajakScore), 
      icon: Landmark, 
      color: "text-emerald-600", 
      desc: "Daya beli masyarakat dan beban pajak.",
      menuId: "Menu:Pajak"
    },
    { 
      name: "Harga Barang Pokok", 
      score: Math.round(hargaScore), 
      icon: Coins, 
      color: "text-amber-600", 
      desc: "Stabilitas harga bahan kebutuhan sehari-hari.",
      menuId: "Menu:Harga"
    },
    { 
      name: "Produksi Pangan", 
      score: Math.round(panganScore), 
      icon: Apple, 
      color: "text-green-600", 
      desc: "Ketersediaan dan ketahanan pangan nasional.",
      menuId: "Menu:IndustriPangan"
    },
    { 
      name: "Produksi Listrik", 
      score: Math.round(listrikScore), 
      icon: Plug, 
      color: "text-blue-600", 
      desc: "Keseimbangan pasokan dan permintaan energi listrik.",
      menuId: "Menu:Kelistrikan"
    },
    { 
      name: "Hunian Permukiman", 
      score: Math.round(hunianScore), 
      icon: Home, 
      color: "text-rose-600", 
      desc: "Ketersediaan rumah layak huni dan akses perumahan.",
      menuId: "Menu:HunianPermukiman"
    },
    { 
      name: "Layanan Publik & Tempat Umum", 
      score: Math.round(layananPublikScore), 
      icon: Landmark, 
      color: "text-yellow-700", 
      desc: "Rasio ketersediaan sarana sosial, kesehatan, pendidikan, keamanan, dan rekreasi.",
      menuId: "Menu:TempatUmum"
    },
    { 
      name: "Doktrin & Keterbukaan", 
      score: Math.round(keterbukaanScore), 
      icon: Globe, 
      color: "text-indigo-600", 
      desc: "Kebebasan sipil, HAM, media, dan jaminan keterbukaan informasi.",
      menuId: "Menu:DoktrinKeterbukaan"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424]/90 backdrop-blur-md border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
                <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Kepuasan Rakyat</h2>
              </div>
            </div>

            <div className="flex items-center bg-[#0A1A1A] p-0.5 sm:p-1 rounded-lg border border-[#00FFAA]/30 backdrop-blur-md">
              <button className="px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all bg-[#00FFAA] text-[#0A1A1A] cursor-pointer">
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

          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
            
            {/* Kartu skor umum */}
            <div className="bg-[#0F2424] border border-[#00FFAA]/30 p-2.5 lg:p-3 2xl:p-4 rounded-xl flex flex-row items-center justify-between gap-2.5 lg:gap-3">
              <div className="flex items-center gap-2.5 lg:gap-3">
                <div className="w-9 h-9 lg:w-11 lg:h-11 2xl:w-14 2xl:h-14 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/40 flex items-center justify-center shrink-0">
                  <Smile className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-7 2xl:w-7 text-[#00FFAA]" />
                </div>
                <div>
                  <h3 className="text-xs lg:text-sm 2xl:text-base font-black text-[#E0E0E0] uppercase tracking-wide leading-none mb-0.5 lg:mb-1">Persetujuan Umum Rakyat</h3>
                  <p className="text-[9px] lg:text-[10px] 2xl:text-xs text-[#6B8A8A] font-semibold max-w-sm sm:max-w-md leading-tight">
                    Rata-rata persetujuan nasional rakyat terhadap kebijakan kepemimpinan kabinet saat ini.
                  </p>
                </div>
              </div>
              <div className="text-right bg-[#0A1A1A] border border-[#00FFAA]/30 px-2.5 lg:px-3.5 2xl:px-4 py-1 lg:py-1.5 2xl:py-2 rounded-lg shrink-0 min-w-[75px] lg:min-w-[95px] 2xl:min-w-[110px]">
                <p className="text-base lg:text-xl 2xl:text-2xl font-black text-[#00FFAA] tracking-tight leading-none">{Math.round(generalSatisfaction)}%</p>
                <p className="text-[8px] lg:text-[9px] text-[#00FFAA] font-bold uppercase tracking-wider mt-0.5 flex items-center justify-end gap-0.5">
                  <TrendingUp className="h-2 w-2 lg:h-2.5 lg:w-2.5" /> Stabil
                </p>
              </div>
            </div>

            {/* Sektor-sektor */}
            <div>
              <div className="flex items-center gap-2.5 lg:gap-3 mb-3 lg:mb-4 2xl:mb-5 px-1">
                <div className="p-1 lg:p-1.5 rounded-lg bg-[#0F2424] border border-[#00FFAA]/30">
                  <TrendingUp className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#00FFAA]" />
                </div>
                <h3 className="text-sm lg:text-base 2xl:text-lg font-black text-[#E0E0E0] uppercase tracking-wider italic">Penilaian Sektoral</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#00FFAA]/30 to-transparent ml-2 lg:ml-4"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 lg:gap-3 2xl:gap-4">
                {sectors.map((sector, idx) => {
                  const Icon = sector.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveMenu?.(sector.menuId)}
                      className="bg-[#0F2424] border border-[#00FFAA]/20 p-2.5 lg:p-3.5 2xl:p-5 rounded-xl 2xl:rounded-2xl flex gap-2.5 lg:gap-3.5 2xl:gap-4 transition-all hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 relative overflow-hidden group cursor-pointer text-left"
                    >
                      <div className="p-2 lg:p-2.5 2xl:p-3 rounded-lg 2xl:rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20 text-[#00FFAA] self-start group-hover:border-[#00FFAA] shrink-0">
                        <Icon className="w-4 h-4 lg:w-4.5 lg:h-4.5 2xl:w-5 2xl:h-5" />
                      </div>
                      <div className="flex-1 space-y-1 lg:space-y-1.5 2xl:space-y-2 min-w-0">
                        <div className="flex items-center justify-between text-[11px] lg:text-xs font-black text-[#E0E0E0] uppercase group-hover:text-[#00FFAA]">
                          <span className="pr-1 whitespace-normal leading-tight">{sector.name}</span>
                          <span className="text-[#00FFAA] shrink-0">{sector.score}%</span>
                        </div>
                        <div className="h-1.5 lg:h-2 2xl:h-2.5 w-full bg-[#0A1A1A] rounded-full overflow-hidden border border-[#00FFAA]/20">
                          <div className="h-full bg-[#00FFAA] rounded-full" style={{ width: `${sector.score}%` }} />
                        </div>
                        <p className="text-[9px] lg:text-[10px] text-[#6B8A8A] font-bold leading-tight lg:leading-normal pt-0.5 group-hover:text-[#E0E0E0]">
                          {sector.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}