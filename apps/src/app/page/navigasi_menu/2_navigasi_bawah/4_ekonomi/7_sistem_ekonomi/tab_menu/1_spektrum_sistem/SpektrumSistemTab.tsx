// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\7_sistem_ekonomi\tab_menu\1_spektrum_sistem\SpektrumSistemTab.tsx
"use client";

import React, { useMemo } from "react";
import { TrendingUp, AlertCircle, Users, Award, HeartPulse } from "lucide-react";
import { EconomicSystemEffect } from "../../logic/logikaSistemEkonomi";
import { calculateEconomicPopulationImpact } from "@/app/logic/economic_logic/economicPopulationImpact";

interface Props {
  sliderValue: number;
  setSliderValue: (val: number) => void;
  onCommit?: (val: number) => void;
  systemDetails: EconomicSystemEffect;
  countryDetail?: any;
}

const SPECTRUM_PRESETS = [
  { label: "Komando Mutlak", value: 10, min: 0, max: 20 },
  { label: "Sosialisme", value: 30, min: 21, max: 40 },
  { label: "Campuran", value: 50, min: 41, max: 60 },
  { label: "Pasar Terregulasi", value: 70, min: 61, max: 80 },
  { label: "Laissez-Faire", value: 90, min: 81, max: 100 },
];

export default function SpektrumSistemTab({
  sliderValue,
  setSliderValue,
  onCommit,
  systemDetails,
  countryDetail,
}: Props) {
  const handleSelectPreset = (val: number) => {
    setSliderValue(val);
    onCommit?.(val);
  };

  const handleChangeSlider = (val: number) => {
    setSliderValue(val);
    onCommit?.(val);
  };

  // Kalkulasi dampak modifier populasi bulanan (skala 25% seperti di Ringkasan Populasi & population_logic)
  const populationImpact = useMemo(() => {
    const tempDetail = {
      ...(countryDetail || {}),
      sistem_ekonomi_val: sliderValue,
    };
    const impact = calculateEconomicPopulationImpact(tempDetail);
    // Skala 25% modifier kebijakan sesuai kalkulasi RingkasanPopulasiModal
    const monthlyModifierPercent = impact.systemMonthlyModifierPercent * 0.25;
    return {
      policyScore: impact.policyScore,
      monthlyModifierPercent,
    };
  }, [countryDetail, sliderValue]);

  return (
    <div className="space-y-3 lg:space-y-4 max-w-full">
      {/* SLIDER CONTROL CARD */}
      <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-2xl p-3.5 lg:p-4 2xl:p-5 shadow-lg space-y-3 lg:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-[#00FFAA]/15 pb-2.5 lg:pb-3">
          <div>
            <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-[#6B8A8A]">
              Status Sistem Ekonomi Saat Ini
            </span>
            <h3 className="text-sm lg:text-base 2xl:text-lg font-black text-[#00FFAA] uppercase tracking-wider mt-0.5">
              {systemDetails.title}
            </h3>
            {/* Indikator Dampak Populasi Mirip Harga Pokok */}
            <p className="text-[11px] lg:text-xs text-[#6B8A8A] mt-1">
              Dampak populasi:{" "}
              <span
                className={`font-bold ${
                  populationImpact.monthlyModifierPercent < 0
                    ? "text-rose-400"
                    : "text-[#00FFAA]"
                }`}
              >
                {populationImpact.monthlyModifierPercent >= 0 ? "+" : ""}
                {populationImpact.monthlyModifierPercent.toFixed(2)}% / bulan
              </span>{" "}
              <span className="text-[9px] text-[#A7C4C4]">
                (Skor Kebijakan: {populationImpact.policyScore.toFixed(0)}/100)
              </span>
            </p>
          </div>
          <span
            className={`px-2 lg:px-2.5 py-0.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-wider border ${
              systemDetails.category === "Terpusat"
                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                : systemDetails.category === "Campuran"
                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            }`}
          >
            Kategori: {systemDetails.category}
          </span>
        </div>

        <p className="text-[10px] lg:text-xs text-[#E0E0E0] leading-relaxed">
          {systemDetails.description}
        </p>

        {/* THE INTERACTIVE SLIDER */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-[10px] lg:text-xs font-black uppercase tracking-wider">
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
            onChange={(e) => handleChangeSlider(Number(e.target.value))}
            className="w-full h-2 lg:h-2.5 bg-[#0F2424] border border-[#00FFAA]/30 rounded-lg appearance-none cursor-pointer accent-[#00FFAA]"
          />

          {/* 5 PRESET BUTTONS (LANGSUNG MERUBAH NILAI & NETTO POPULASI) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
            {SPECTRUM_PRESETS.map((preset) => {
              const isActive = sliderValue >= preset.min && sliderValue <= preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset.value)}
                  className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isActive
                      ? "bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA] font-black shadow-sm"
                      : "bg-[#0F2424] text-[#A7C4C4] border-[#00FFAA]/25 hover:border-[#00FFAA]/60 hover:text-[#00FFAA]"
                  }`}
                >
                  <span className="text-[9px] lg:text-[10px] uppercase font-bold tracking-tight leading-tight">
                    {preset.label}
                  </span>
                  <span
                    className={`text-[8px] font-semibold mt-0.5 ${
                      isActive ? "text-[#0A1A1A]/80" : "text-[#6B8A8A]"
                    }`}
                  >
                    {preset.value}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* IMPACT & EFFECT INDICATORS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3">
        {/* CARD DAMPAK NETTO POPULASI */}
        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3 rounded-xl flex items-center gap-3 min-w-0">
          <div
            className={`p-1.5 lg:p-2 rounded-lg shrink-0 border ${
              populationImpact.monthlyModifierPercent < 0
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-[#00FFAA]"
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] lg:text-[9px] font-black text-[#6B8A8A] uppercase tracking-wider">
              Dampak Netto Populasi
            </p>
            <p
              className={`text-sm font-black mt-0.5 whitespace-nowrap ${
                populationImpact.monthlyModifierPercent < 0 ? "text-rose-400" : "text-[#00FFAA]"
              }`}
            >
              {populationImpact.monthlyModifierPercent >= 0 ? "+" : ""}
              {populationImpact.monthlyModifierPercent.toFixed(2)}% / bulan
            </p>
          </div>
        </div>

        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3 rounded-xl flex items-center gap-3 min-w-0">
          <div className="p-1.5 lg:p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] lg:text-[9px] font-black text-[#6B8A8A] uppercase tracking-wider">
              Bonus Pertumbuhan PDB
            </p>
            <p className="text-sm font-black text-[#E0E0E0] mt-0.5 whitespace-nowrap">
              +{systemDetails.gdpGrowthBonus.toFixed(1)}% / Tahun
            </p>
          </div>
        </div>

        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3 rounded-xl flex items-center gap-3 min-w-0">
          <div className="p-1.5 lg:p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] lg:text-[9px] font-black text-[#6B8A8A] uppercase tracking-wider">
              Dampak Inflasi
            </p>
            <p className="text-sm font-black text-[#E0E0E0] mt-0.5 whitespace-nowrap">
              {systemDetails.inflationImpact >= 0
                ? `+${systemDetails.inflationImpact.toFixed(1)}%`
                : `${systemDetails.inflationImpact.toFixed(1)}%`}
            </p>
          </div>
        </div>

        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3 rounded-xl flex items-center gap-3 min-w-0">
          <div className="p-1.5 lg:p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 shrink-0">
            <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] lg:text-[9px] font-black text-[#6B8A8A] uppercase tracking-wider">
              Ketimpangan (Gini)
            </p>
            <p className="text-sm font-black text-[#E0E0E0] mt-0.5 whitespace-nowrap">
              {systemDetails.giniIndexImpact >= 0
                ? `+${systemDetails.giniIndexImpact.toFixed(2)}`
                : `${systemDetails.giniIndexImpact.toFixed(2)}`}
            </p>
          </div>
        </div>
      </div>

      {/* DUAL FACTION APPROVAL IMPACT */}
      <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-3 lg:p-4 space-y-2 lg:space-y-2.5">
        <h4 className="text-[10px] lg:text-xs font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" /> Pengaruh Kepuasan Kelompok Masyarakat
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3 text-[10px] lg:text-xs">
          <div className="p-2 lg:p-2.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/15 flex justify-between items-center">
            <span className="font-bold text-[#E0E0E0]">Kaum Buruh & Pekerja:</span>
            <span
              className={`font-black ${
                systemDetails.workerSatisfactionBonus >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {systemDetails.workerSatisfactionBonus >= 0
                ? `+${systemDetails.workerSatisfactionBonus}%`
                : `${systemDetails.workerSatisfactionBonus}%`}
            </span>
          </div>

          <div className="p-2 lg:p-2.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/15 flex justify-between items-center">
            <span className="font-bold text-[#E0E0E0]">Pengusaha & Kapitalis:</span>
            <span
              className={`font-black ${
                systemDetails.capitalistSatisfactionBonus >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {systemDetails.capitalistSatisfactionBonus >= 0
                ? `+${systemDetails.capitalistSatisfactionBonus}%`
                : `${systemDetails.capitalistSatisfactionBonus}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
