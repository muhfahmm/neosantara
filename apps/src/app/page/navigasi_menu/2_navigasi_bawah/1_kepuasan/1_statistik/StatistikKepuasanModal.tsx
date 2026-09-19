"use client";

import { useState, useEffect } from "react";
import { X, Smile, TrendingUp, Landmark, Coins, Apple, Plug, Home } from "lucide-react";
import {
  calculatePajakScore,
  calculateHargaScore,
  calculatePanganScore,
  calculateListrikScore,
  calculateHunianScore,
  calculateLayananPublikScore,
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
  
  // Hitung general satisfaction sebagai rata-rata dari 6 sektor
  const generalSatisfaction = (pajakScore + hargaScore + panganScore + listrikScore + hunianScore + layananPublikScore) / 6;

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
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#C4B49C]/40 flex items-center justify-between bg-[#FAF6EE] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-1 sm:p-1.5 bg-[#5c3c10]/10 rounded-lg border border-[#5c3c10]/20 shrink-0">
                <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-[#5c3c10]" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Kepuasan Rakyat</h2>
              </div>
            </div>

            <div className="flex items-center bg-[#e4dac3]/40 p-0.5 sm:p-1 rounded-lg border border-[#bfae93]/50 backdrop-blur-md">
              <button className="px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all bg-[#5c3c10] text-[#FAF6EE] shadow-sm cursor-pointer">
                Statistik
              </button>
              <button
                onClick={() => setActiveMenu?.("Action:NaikkanKepuasan")}
                className="px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all text-[#8b7e66] hover:text-[#5c3c10] cursor-pointer"
              >
                Naikkan Peringkat
              </button>
            </div>
          </div>

          <button onClick={onClose} className="p-1 sm:p-1.5 rounded-lg border border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1 hidden sm:inline">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#FAF6EE]/40 relative z-10 custom-scrollbar">
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
            
            {/* Kartu skor umum */}
            <div className="bg-[#e4dac3]/25 border border-[#C4B49C]/40 p-3.5 sm:p-4 rounded-xl flex flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#ffe07d] via-[#fcae1e] to-[#c77a00] border-2 border-[#FAF6EE] shadow-md flex items-center justify-center shrink-0">
                  <Smile className="h-5 w-5 sm:h-7 sm:w-7 text-[#5c3c10]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#5c3c10] uppercase tracking-wide leading-none mb-1">Persetujuan Umum Rakyat</h3>
                  <p className="text-[10px] sm:text-xs text-[#8b7e66] font-semibold max-w-sm sm:max-w-md leading-tight">
                    Rata-rata persetujuan nasional rakyat terhadap kebijakan kepemimpinan kabinet saat ini.
                  </p>
                </div>
              </div>
              <div className="text-right bg-[#FAF6EE] border border-[#C4B49C]/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-xs shrink-0 min-w-[90px] sm:min-w-[110px]">
                <p className="text-xl sm:text-2xl font-black text-[#2e261a] tracking-tight leading-none">{Math.round(generalSatisfaction)}%</p>
                <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider mt-0.5 flex items-center justify-end gap-0.5">
                  <TrendingUp className="h-2.5 w-2.5" /> Stabil
                </p>
              </div>
            </div>

            {/* Sektor-sektor */}
            <div>
              <div className="flex items-center gap-3 mb-5 px-1">
                <div className="p-1.5 rounded-lg bg-[#e4dac3]/50 border border-[#C4B49C]/40">
                  <TrendingUp className="h-4 w-4 text-[#5c3c10]" />
                </div>
                <h3 className="text-lg font-black text-[#5c3c10] uppercase tracking-wider italic">Penilaian Sektoral</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#C4B49C] to-transparent ml-4 opacity-50"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectors.map((sector, idx) => {
                  const Icon = sector.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveMenu?.(sector.menuId)}
                      className="bg-[#FAF6EE] border-2 border-[#C4B49C]/40 p-5 rounded-2xl flex gap-4 transition-all hover:border-[#5c3c10] hover:bg-[#e4dac3]/10 hover:shadow-md active:bg-[#e4dac3]/20 shadow-sm relative overflow-hidden group cursor-pointer text-left"
                    >
                      <div className={`p-3 rounded-xl bg-black/5 border border-black/5 ${sector.color} self-start group-hover:bg-black/10 transition-colors`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between text-xs font-black text-[#5c3c10] uppercase">
                          <span>{sector.name}</span>
                          <span>{sector.score}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-[#e4dac3] rounded-full overflow-hidden border border-[#bfae93]/50">
                          <div className={`h-full bg-gradient-to-r from-[#fcae1e] to-[#c77a00] rounded-full`} style={{ width: `${sector.score}%` }} />
                        </div>
                        <p className="text-[10px] text-[#8b7e66] font-bold leading-normal pt-1">
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