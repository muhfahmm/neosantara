"use client";

import React from "react";
import { Users, HeartPulse, GraduationCap, Banknote, Activity, TrendingUp, Sparkles } from "lucide-react";

import {
  calculateGeneralSatisfaction,
  calculateDailyBirths,
  calculateDailyDeaths,
  calculateLifeExpectancy,
  calculateSecurityLevel,
} from "@/app/logic/populations_logic/population_logic";

import { calculateKesehatanScore, calculatePendidikanScore } from "@/app/logic/kesejahteraanCalculator";
import { calculateKesehatanLogic } from "../kematian_modals/logic/kesehatanLogic";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";

interface DetailKelahiranModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  selectedCountry?: any;
  dailyBirths?: number;
  dailyDeaths?: number;
  netDailyChange?: number;
  onOpenTempatUmum?: (tabId: string) => void;
}

export default function DetailKelahiranModal({
  isOpen,
  onClose,
  countryDetail,
  selectedCountry,
  dailyBirths: propsDailyBirths,
  dailyDeaths: propsDailyDeaths,
  netDailyChange: propsNetDailyChange,
  onOpenTempatUmum,
}: DetailKelahiranModalProps) {
  if (!isOpen) return null;

  const populasi = countryDetail?.jumlah_penduduk || 10_000_000;
  const countryName = selectedCountry?.country?.toLowerCase?.() || "";

  const detailWithDefaults = { ...countryDetail };
  const kepuasanUmum = calculateGeneralSatisfaction(detailWithDefaults);
  const programInsentifAnak = countryDetail?.program_insentif_anak ?? false;

  // Kesehatan & Pendidikan
  const kesehatanMetrics = calculateKesehatanScore(countryDetail);
  const kesehatanScore = typeof kesehatanMetrics === "object" ? kesehatanMetrics.score : kesehatanMetrics;

  const pendidikanMetrics = calculatePendidikanScore(countryDetail);
  const pendidikanScore = typeof pendidikanMetrics === "object" ? pendidikanMetrics.score : pendidikanMetrics;

  const kesehatanRes = calculateKesehatanLogic(countryDetail, populasi);
  const hospitalRatio = kesehatanRes.kesehatanRatio;
  const healthFactor = 0.7 + 0.3 * hospitalRatio;

  const eduKeys = ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan"];
  const totalEducation = eduKeys.reduce((sum, key) => sum + (Number(countryDetail?.[key]) || 0), 0);
  const idealEducation = Math.ceil(populasi / 50000) || 1;
  const educationRatio = Math.min(1, totalEducation / idealEducation);
  const tingkatPendidikan = educationRatio;
  const educationFactor = 1.1 - (0.3 * tingkatPendidikan);

  // Kelahiran & Kematian
  const dailyBirths = propsDailyBirths !== undefined ? propsDailyBirths : calculateDailyBirths(
    populasi, kepuasanUmum, 0, 0, 0, programInsentifAnak, 0, tingkatPendidikan, detailWithDefaults
  );

  const lifeExpectancy = calculateLifeExpectancy(detailWithDefaults, kepuasanUmum);
  const securityLevel = calculateSecurityLevel(detailWithDefaults, kepuasanUmum);
  const dailyDeaths = propsDailyDeaths !== undefined ? propsDailyDeaths : calculateDailyDeaths(populasi, lifeExpectancy, securityLevel, detailWithDefaults);

  const netDailyChange = propsNetDailyChange !== undefined ? propsNetDailyChange : (dailyBirths - dailyDeaths);
  const welfareFactor = 0.75;

  const formatNumber = (num: number) => num.toLocaleString('id-ID', { maximumFractionDigits: 2 });

  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="flex flex-col h-full overflow-hidden bg-root-canvas rounded-xl border border-root-accent/20 ">

        {/* ============ HEADER (DISAMAKAN DENGAN MODAL KEPENDUDUKAN) ============ */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0 ">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-root-text" />
            </div>
            <div>
              {/* Font size dinaikkan kembali ke text-base sm:text-xl */}
              <h2 className={`${rootModalTypography.title} leading-none`}>
                Rincian Pertumbuhan Penduduk
              </h2>
            </div>
          </div>

          <RootModalCloseButton onClick={onClose} />
        </div>

        {/* ============ BODY (TETAP COMPACT & RESPONSIF) ============ */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-root-canvas/80 relative z-10
          [&::-webkit-scrollbar]:w-1.5 
          [&::-webkit-scrollbar-track]:bg-root-canvas
          [&::-webkit-scrollbar-track]:rounded-full 
          [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-root-accent/20
          [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-root-accent [&::-webkit-scrollbar-thumb]:to-[#00B37A]
          [&::-webkit-scrollbar-thumb]:rounded-full 
          [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-root-canvas

          hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-root-accent
          [&::-webkit-scrollbar-button]:hidden
        ">
          <div className="space-y-2">

            {/* ============ RINGKASAN UTAMA ============ */}
            <div className={`relative bg-gradient-to-br from-root-surface to-root-canvas border border-root-accent/30 p-2 sm:p-3 ${rootBorderRadius.card} overflow-hidden`}>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 relative z-10">
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] sm:text-[9px] font-black text-root-muted uppercase tracking-widest flex items-center gap-1">
                    <TrendingUp className="h-2.5 w-2.5 text-root-text" />
                    Pertumbuhan Bersih Harian
                  </p>
                  <p className={`text-xl sm:text-2xl font-black mt-0.5 tracking-tight ${netDailyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {netDailyChange >= 0 ? '+' : ''}{formatNumber(netDailyChange)}
                    <span className="text-[10px] sm:text-xs text-root-muted font-bold ml-1 tracking-normal">/hr</span>
                  </p>
                </div>
                <div className="p-1.5 bg-root-accent/10 rounded-full border border-root-accent/30 self-start sm:self-auto">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-root-text" />
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1.5 relative z-10">
                <div className={`bg-root-surface/80 p-1.5 ${rootBorderRadius.card} border border-emerald-500/40`}>
                  <p className="text-[7px] sm:text-[8px] text-emerald-400 font-black uppercase tracking-wider">Kelahiran</p>
                  <p className="text-xs sm:text-sm font-black text-emerald-400 mt-0.5">
                    +{formatNumber(dailyBirths)}
                  </p>
                </div>
                <div className={`bg-root-surface/80 p-1.5 ${rootBorderRadius.card} border border-rose-500/40`}>
                  <p className="text-[7px] sm:text-[8px] text-rose-400 font-black uppercase tracking-wider">Kematian</p>
                  <p className="text-xs sm:text-sm font-black text-rose-400 mt-0.5">
                    -{formatNumber(dailyDeaths)}
                  </p>
                </div>
              </div>
            </div>

            {/* ============ BREAKDOWN FAKTOR ============ */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-md bg-root-surface border border-root-accent/30 ">
                  <Sparkles className="h-3 w-3 text-root-text" />
                </div>
                <h3 className="text-[10px] sm:text-xs font-black text-root-text uppercase tracking-wider italic">
                  Faktor yang Memengaruhi
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-root-accent/40 to-transparent ml-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {/* 1. Populasi Dasar */}
                <div className={`group bg-root-surface border border-root-accent/20 p-1.5 sm:p-2 ${rootBorderRadius.card} space-y-0.5 transition-all hover:border-root-accent/40`}>
                  <div className="flex items-center gap-1">
                    <div className="p-0.5 bg-root-canvas border border-root-accent/30 rounded-md shrink-0">
                      <Users className="h-2.5 w-2.5 text-root-text" />
                    </div>
                    <h4 className="text-[8px] sm:text-[9px] font-black text-root-text uppercase tracking-wider">Populasi Dasar</h4>
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-root-text">
                    {formatNumber(populasi)} <span className="text-[8px] text-root-muted font-medium">jiwa</span>
                  </p>
                </div>

                {/* 2. Kesejahteraan */}
                <div className={`group bg-root-surface border border-root-accent/20 p-1.5 sm:p-2 ${rootBorderRadius.card} space-y-0.5 transition-all hover:border-root-accent/40`}>
                  <div className="flex items-center gap-1">
                    <div className="p-0.5 bg-root-canvas border border-root-accent/30 rounded-md shrink-0">
                      <Banknote className="h-2.5 w-2.5 text-root-text" />
                    </div>
                    <h4 className="text-[8px] sm:text-[9px] font-black text-root-text uppercase tracking-wider">Kesejahteraan</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[11px] sm:text-xs font-bold text-root-text">
                      {countryDetail?.kesejahteraan !== undefined ? Math.round(Number(countryDetail.kesejahteraan)) : 50} <span className="text-[8px] text-root-muted font-medium">INDX</span>
                    </span>
                    <span className="text-[8px] text-root-text font-bold bg-root-accent/10 px-1 py-0.5 rounded border border-root-accent/20">
                      × {welfareFactor.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 3. Fasilitas Kesehatan (clickable) */}
                <div
                  className={`group bg-root-surface border border-root-accent/20 p-1.5 sm:p-2 ${rootBorderRadius.card} space-y-0.5 cursor-pointer transition-all hover:border-root-accent hover:bg-root-accent/10 active:scale-[0.98]`}
                  onClick={() => onOpenTempatUmum?.('kesehatan')}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <div className="p-0.5 bg-root-canvas border border-root-accent/30 rounded-md shrink-0 group-hover:scale-110 transition-transform">
                        <HeartPulse className="h-2.5 w-2.5 text-root-text" />
                      </div>
                      <h4 className="text-[8px] sm:text-[9px] font-black text-root-text uppercase tracking-wider">Fasilitas Kesehatan</h4>
                    </div>
                    <span className="text-[8px] text-root-muted font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Buka →</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[11px] sm:text-xs font-bold text-root-text">
                      {kesehatanScore} <span className="text-[8px] text-root-muted font-medium">POIN</span>
                    </span>
                    <span className="text-[8px] text-root-muted">(rasio {hospitalRatio.toFixed(2)})</span>
                    <span className="text-[8px] text-root-text font-bold bg-root-accent/10 px-1 py-0.5 rounded border border-root-accent/20">
                      × {healthFactor.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 4. Tingkat Pendidikan (clickable) */}
                <div
                  className={`group bg-root-surface border border-root-accent/20 p-1.5 sm:p-2 ${rootBorderRadius.card} space-y-0.5 cursor-pointer transition-all hover:border-root-accent hover:bg-root-accent/10 active:scale-[0.98]`}
                  onClick={() => onOpenTempatUmum?.('pendidikan')}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <div className="p-0.5 bg-root-canvas border border-root-accent/30 rounded-md shrink-0 group-hover:scale-110 transition-transform">
                        <GraduationCap className="h-2.5 w-2.5 text-root-text" />
                      </div>
                      <h4 className="text-[8px] sm:text-[9px] font-black text-root-text uppercase tracking-wider">Tingkat Pendidikan</h4>
                    </div>
                    <span className="text-[8px] text-root-muted font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Buka →</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[11px] sm:text-xs font-bold text-root-text">
                      {pendidikanScore} <span className="text-[8px] text-root-muted font-medium">POIN</span>
                    </span>
                    <span className="text-[8px] text-root-muted">(rasio {educationRatio.toFixed(2)})</span>
                    <span className="text-[8px] text-root-text font-bold bg-root-accent/10 px-1 py-0.5 rounded border border-root-accent/20">
                      × {educationFactor.toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}