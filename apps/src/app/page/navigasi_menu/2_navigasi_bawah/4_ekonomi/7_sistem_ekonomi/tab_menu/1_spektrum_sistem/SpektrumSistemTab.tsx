// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\7_sistem_ekonomi\tab_menu\1_spektrum_sistem\SpektrumSistemTab.tsx
"use client";

import React from "react";
import { TrendingUp, AlertCircle, Users, Award } from "lucide-react";
import { EconomicSystemEffect } from "../../logic/logikaSistemEkonomi";

interface Props {
  sliderValue: number;
  setSliderValue: (val: number) => void;
  systemDetails: EconomicSystemEffect;
}

export default function SpektrumSistemTab({ sliderValue, setSliderValue, systemDetails }: Props) {
  return (
    <div className="space-y-4 lg:space-y-6 max-w-full">
      {/* SLIDER CONTROL CARD */}
      <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-2xl p-4 lg:p-5 2xl:p-6 shadow-lg space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#00FFAA]/15 pb-3 lg:pb-4">
          <div>
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">Status Sistem Ekonomi Saat Ini</span>
            <h3 className="text-base lg:text-lg 2xl:text-xl font-black text-[#00FFAA] uppercase tracking-wider mt-0.5 lg:mt-1">{systemDetails.title}</h3>
          </div>
          <span className={`px-2.5 lg:px-3 py-1 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-wider border ${
            systemDetails.category === "Terpusat" 
              ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
              : systemDetails.category === "Campuran"
              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          }`}>
            Kategori: {systemDetails.category}
          </span>
        </div>

        <p className="text-[11px] lg:text-xs text-[#E0E0E0] leading-relaxed">
          {systemDetails.description}
        </p>

        {/* THE INTERACTIVE SLIDER */}
        <div className="space-y-2.5 lg:space-y-3 pt-1 lg:pt-2">
          <div className="flex justify-between items-center text-[11px] lg:text-xs font-black uppercase tracking-wider">
            <span className="text-rose-400 flex items-center gap-1">🔴 0% TERPUSAT (KOMANDO)</span>
            <span className="text-[#00FFAA] font-bold">{sliderValue}%</span>
            <span className="text-emerald-400 flex items-center gap-1">🟢 100% PASAR BEBAS</span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="w-full h-2.5 lg:h-3 bg-[#0F2424] border border-[#00FFAA]/30 rounded-lg appearance-none cursor-pointer accent-[#00FFAA]"
          />

          <div className="flex justify-between text-[9px] lg:text-[10px] text-[#6B8A8A] font-bold uppercase tracking-widest px-1">
            <span>Komando Mutlak</span>
            <span>Sosialisme</span>
            <span>Campuran</span>
            <span>Pasar Terregulasi</span>
            <span>Laissez-Faire</span>
          </div>
        </div>
      </div>

      {/* IMPACT & EFFECT INDICATORS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3 lg:p-4 rounded-xl flex items-center gap-3">
          <div className="p-2 lg:p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
            <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" />
          </div>
          <div>
            <p className="text-[9px] lg:text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider">Bonus Pertumbuhan PDB</p>
            <p className="text-sm lg:text-base font-black text-[#E0E0E0] mt-0.5">+{systemDetails.gdpGrowthBonus.toFixed(1)}% / Tahun</p>
          </div>
        </div>

        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3 lg:p-4 rounded-xl flex items-center gap-3">
          <div className="p-2 lg:p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 shrink-0">
            <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />
          </div>
          <div>
            <p className="text-[9px] lg:text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider">Dampak Inflasi</p>
            <p className="text-sm lg:text-base font-black text-[#E0E0E0] mt-0.5">
              {systemDetails.inflationImpact >= 0 ? `+${systemDetails.inflationImpact.toFixed(1)}%` : `${systemDetails.inflationImpact.toFixed(1)}%`}
            </p>
          </div>
        </div>

        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3 lg:p-4 rounded-xl flex items-center gap-3">
          <div className="p-2 lg:p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 shrink-0">
            <Users className="w-4 h-4 lg:w-5 lg:h-5" />
          </div>
          <div>
            <p className="text-[9px] lg:text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider">Perubahan Ketimpangan (Gini)</p>
            <p className="text-sm lg:text-base font-black text-[#E0E0E0] mt-0.5">
              {systemDetails.giniIndexImpact >= 0 ? `+${systemDetails.giniIndexImpact.toFixed(2)}` : `${systemDetails.giniIndexImpact.toFixed(2)}`}
            </p>
          </div>
        </div>
      </div>

      {/* DUAL FACTION APPROVAL IMPACT */}
      <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-4 lg:p-5 space-y-3 lg:space-y-4">
        <h4 className="text-[11px] lg:text-xs font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-2">
          <Award className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Pengaruh Kepuasan Kelompok Masyarakat
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 text-[11px] lg:text-xs">
          <div className="p-2.5 lg:p-3 bg-[#0F2424] rounded-lg border border-[#00FFAA]/15 flex justify-between items-center">
            <span className="font-bold text-[#E0E0E0]">Kaum Buruh & Pekerja:</span>
            <span className={`font-black ${systemDetails.workerSatisfactionBonus >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {systemDetails.workerSatisfactionBonus >= 0 ? `+${systemDetails.workerSatisfactionBonus}%` : `${systemDetails.workerSatisfactionBonus}%`}
            </span>
          </div>

          <div className="p-2.5 lg:p-3 bg-[#0F2424] rounded-lg border border-[#00FFAA]/15 flex justify-between items-center">
            <span className="font-bold text-[#E0E0E0]">Pengusaha & Kapitalis:</span>
            <span className={`font-black ${systemDetails.capitalistSatisfactionBonus >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {systemDetails.capitalistSatisfactionBonus >= 0 ? `+${systemDetails.capitalistSatisfactionBonus}%` : `${systemDetails.capitalistSatisfactionBonus}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
