// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\7_sistem_ekonomi\tab_menu\1_spektrum_sistem\SpektrumSistemTab.tsx
"use client";

import React, { useMemo } from "react";
import { TrendingUp, AlertCircle, HeartPulse, Users } from "lucide-react";
import { EconomicSystemEffect } from "../../logic/logikaSistemEkonomi";
import { calculateEconomicPopulationImpact } from "@/app/logic/economic_logic/economicPopulationImpact";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

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
      <div className={`bg-root-canvas border border-root-accent/20 ${rootBorderRadius.card} p-3.5 lg:p-4 2xl:p-5 shadow-lg space-y-3 lg:space-y-4`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-root-accent/15 pb-2.5 lg:pb-3">
          <div>
            <h3 className={`${rootModalTypography.sectionTitle} mt-0.5`}>
              {systemDetails.title}
            </h3>
            {/* Indikator Dampak Populasi Mirip Harga Pokok */}
            <p className="text-[11px] lg:text-xs text-root-subtle mt-1">
              Dampak populasi:{" "}
              <span
                className={`font-bold ${
                  populationImpact.monthlyModifierPercent < 0
                    ? "text-rose-400"
                    : "text-root-accent"
                }`}
              >
                {populationImpact.monthlyModifierPercent >= 0 ? "+" : ""}
                {populationImpact.monthlyModifierPercent.toFixed(2)}% / bulan
              </span>{" "}
              <span className="text-[9px] text-root-muted">
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

        <p className="text-[10px] lg:text-xs text-root-text leading-relaxed">
          {systemDetails.description}
        </p>

        {/* THE INTERACTIVE SLIDER */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-[10px] lg:text-xs font-black uppercase tracking-wider">
            <span className="text-rose-400 flex items-center gap-1">🔴 0% TERPUSAT (KOMANDO)</span>
            <span className="text-root-accent font-bold">{sliderValue}%</span>
            <span className="text-emerald-400 flex items-center gap-1">🟢 100% PASAR BEBAS</span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={sliderValue}
            onChange={(e) => handleChangeSlider(Number(e.target.value))}
            className="w-full h-2 lg:h-2.5 bg-root-surface border border-root-accent/30 rounded-lg appearance-none cursor-pointer accent-root-accent"
          />

          {/* 5 PRESET BUTTONS (LANGSUNG MERUBAH NILAI & NETTO POPULASI) */}
          <div className="economic-spectrum-presets flex flex-nowrap gap-1.5 pt-1">
            {SPECTRUM_PRESETS.map((preset) => {
              const isActive = sliderValue >= preset.min && sliderValue <= preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset.value)}
                  className={`economic-spectrum-preset min-w-0 flex-1 px-1 sm:px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isActive
                      ? "bg-root-accent text-root-accent-ink border-root-accent font-black shadow-sm"
                      : "bg-root-surface text-root-muted border-root-accent/25 hover:border-root-accent/60 hover:text-root-accent"
                  }`}
                >
                  <span className="economic-spectrum-preset-label text-[9px] lg:text-[10px] uppercase font-bold tracking-tight leading-tight">
                    {preset.label}
                  </span>
                  <span
                    className={`economic-spectrum-preset-value text-[8px] font-semibold mt-0.5 ${
                      isActive ? "text-root-canvas/80" : "text-root-subtle"
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
      <div className="economic-impact-grid grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3">
        {/* CARD DAMPAK NETTO POPULASI */}
        <div className={`economic-impact-card bg-root-canvas border border-root-accent/20 p-3 ${rootBorderRadius.card} flex items-center gap-3 min-w-0`}>
          <div
            className={`p-1.5 lg:p-2 rounded-lg shrink-0 border ${
              populationImpact.monthlyModifierPercent < 0
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-root-accent"
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </div>
          <div className="min-w-0">
            <p className="economic-impact-label text-[8px] lg:text-[9px] font-black text-root-subtle uppercase tracking-wider">
              Dampak Netto Populasi
            </p>
            <p
              className={`economic-impact-value text-sm font-black mt-0.5 whitespace-nowrap ${
                populationImpact.monthlyModifierPercent < 0 ? "text-rose-400" : "text-root-accent"
              }`}
            >
              {populationImpact.monthlyModifierPercent >= 0 ? "+" : ""}
              {populationImpact.monthlyModifierPercent.toFixed(2)}% / bulan
            </p>
          </div>
        </div>

        <div className={`economic-impact-card bg-root-canvas border border-root-accent/20 p-3 ${rootBorderRadius.card} flex items-center gap-3 min-w-0`}>
          <div className="p-1.5 lg:p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </div>
          <div className="min-w-0">
            <p className="economic-impact-label text-[8px] lg:text-[9px] font-black text-root-subtle uppercase tracking-wider">
              Bonus Pertumbuhan PDB
            </p>
            <p className="economic-impact-value text-sm font-black text-root-text mt-0.5 whitespace-nowrap">
              +{systemDetails.gdpGrowthBonus.toFixed(1)}% / Tahun
            </p>
          </div>
        </div>

        <div className={`economic-impact-card bg-root-canvas border border-root-accent/20 p-3 ${rootBorderRadius.card} flex items-center gap-3 min-w-0`}>
          <div className="p-1.5 lg:p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </div>
          <div className="min-w-0">
            <p className="economic-impact-label text-[8px] lg:text-[9px] font-black text-root-subtle uppercase tracking-wider">
              Dampak Inflasi
            </p>
            <p className="economic-impact-value text-sm font-black text-root-text mt-0.5 whitespace-nowrap">
              {systemDetails.inflationImpact >= 0
                ? `+${systemDetails.inflationImpact.toFixed(1)}%`
                : `${systemDetails.inflationImpact.toFixed(1)}%`}
            </p>
          </div>
        </div>

        <div className={`economic-impact-card bg-root-canvas border border-root-accent/20 p-3 ${rootBorderRadius.card} flex items-center gap-3 min-w-0`}>
          <div className="p-1.5 lg:p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 shrink-0">
            <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </div>
          <div className="min-w-0">
            <p className="economic-impact-label text-[8px] lg:text-[9px] font-black text-root-subtle uppercase tracking-wider">
              Ketimpangan (Gini)
            </p>
            <p className="economic-impact-value text-sm font-black text-root-text mt-0.5 whitespace-nowrap">
              {systemDetails.giniIndexImpact >= 0
                ? `+${systemDetails.giniIndexImpact.toFixed(2)}`
                : `${systemDetails.giniIndexImpact.toFixed(2)}`}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}