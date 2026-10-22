"use client";

import React from "react";
import { X, Users, HeartPulse, GraduationCap, Banknote, Activity, TrendingUp, Sparkles } from "lucide-react";

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
      <div className="flex flex-col h-full overflow-hidden bg-[#0A1A1A] rounded-xl border border-[#00FFAA]/20 shadow-[0_0_30px_rgba(0,255,170,0.15)]">

        {/* ============ HEADER (DISAMAKAN DENGAN MODAL KEPENDUDUKAN) ============ */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0 shadow-[0_0_10px_rgba(0,255,170,0.2)]">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              {/* Font size dinaikkan kembali ke text-base sm:text-xl */}
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase drop-shadow-[0_0_8px_rgba(0,255,170,0.5)]">
                Rincian Pertumbuhan Penduduk
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] hover:shadow-[0_0_15px_rgba(0,255,170,0.3)] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            {/* Teks Tutup ditampilkan di semua ukuran layar dan ukurannya disesuaikan */}
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ============ BODY (TETAP COMPACT & RESPONSIF) ============ */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#0A1A1A]/80 relative z-10
          [&::-webkit-scrollbar]:w-1.5 
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
          <div className="space-y-3">

            {/* ============ RINGKASAN UTAMA ============ */}
            <div className="relative bg-gradient-to-br from-[#0F2424] to-[#0A1A1A] border border-[#00FFAA]/30 p-3 sm:p-4 rounded-xl overflow-hidden shadow-[inset_0_0_25px_rgba(0,255,170,0.05)]">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00FFAA]/10 blur-3xl rounded-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 relative z-10">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] font-black text-[#6B8A8A] uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-[#00FFAA]" />
                    Pertumbuhan Bersih Harian
                  </p>
                  {/* Angka Utama Tetap Kecil: text-2xl sm:text-3xl */}
                  <p className={`text-2xl sm:text-3xl font-black mt-1 tracking-tight ${netDailyChange >= 0 ? 'text-[#00FFAA] drop-shadow-[0_0_10px_rgba(0,255,170,0.5)]' : 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}>
                    {netDailyChange >= 0 ? '+' : ''}{formatNumber(netDailyChange)}
                    <span className="text-xs sm:text-sm text-[#6B8A8A] font-bold ml-1 tracking-normal">/hr</span>
                  </p>
                </div>
                <div className="p-2 bg-[#00FFAA]/10 rounded-full border border-[#00FFAA]/30 shadow-[0_0_20px_rgba(0,255,170,0.2)] self-start sm:self-auto">
                  <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-[#00FFAA]" />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 relative z-10">
                <div className="bg-[#0F2424]/80 backdrop-blur-sm p-2 rounded-lg border border-emerald-500/40 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]">
                  <p className="text-[8px] sm:text-[9px] text-emerald-400 font-black uppercase tracking-wider">Kelahiran</p>
                  <p className="text-sm sm:text-base font-black text-emerald-400 mt-0.5 drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]">
                    +{formatNumber(dailyBirths)}
                  </p>
                </div>
                <div className="bg-[#0F2424]/80 backdrop-blur-sm p-2 rounded-lg border border-rose-500/40 shadow-[inset_0_0_15px_rgba(244,63,94,0.1)]">
                  <p className="text-[8px] sm:text-[9px] text-rose-400 font-black uppercase tracking-wider">Kematian</p>
                  <p className="text-sm sm:text-base font-black text-rose-400 mt-0.5 drop-shadow-[0_0_5px_rgba(244,63,94,0.4)]">
                    -{formatNumber(dailyDeaths)}
                  </p>
                </div>
              </div>
            </div>

            {/* ============ BREAKDOWN FAKTOR ============ */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-md bg-[#0F2424] border border-[#00FFAA]/30 shadow-[0_0_8px_rgba(0,255,170,0.2)]">
                  <Sparkles className="h-3 w-3 text-[#00FFAA]" />
                </div>
                <h3 className="text-[10px] sm:text-xs font-black text-[#E0E0E0] uppercase tracking-wider italic">
                  Faktor yang Memengaruhi
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#00FFAA]/40 to-transparent ml-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1. Populasi Dasar */}
                <div className="group bg-[#0F2424] border border-[#00FFAA]/20 p-2 sm:p-2.5 rounded-lg space-y-1 transition-all hover:border-[#00FFAA]/40">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-md shrink-0">
                      <Users className="h-3 w-3 text-[#00FFAA]" />
                    </div>
                    <h4 className="text-[9px] sm:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Populasi Dasar</h4>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#E0E0E0]">
                    {formatNumber(populasi)} <span className="text-[8px] text-[#6B8A8A] font-medium">jiwa</span>
                  </p>
                </div>

                {/* 2. Kesejahteraan */}
                <div className="group bg-[#0F2424] border border-[#00FFAA]/20 p-2 sm:p-2.5 rounded-lg space-y-1 transition-all hover:border-[#00FFAA]/40">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-md shrink-0">
                      <Banknote className="h-3 w-3 text-[#00FFAA]" />
                    </div>
                    <h4 className="text-[9px] sm:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Kesejahteraan</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-[#E0E0E0]">
                      {countryDetail?.kesejahteraan !== undefined ? Math.round(Number(countryDetail.kesejahteraan)) : 50} <span className="text-[8px] text-[#6B8A8A] font-medium">INDX</span>
                    </span>
                    <span className="text-[8px] text-[#00FFAA] font-bold bg-[#00FFAA]/10 px-1 py-0.5 rounded border border-[#00FFAA]/20">
                      × {welfareFactor.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 3. Fasilitas Kesehatan (clickable) */}
                <div
                  className="group bg-[#0F2424] border border-[#00FFAA]/20 p-2 sm:p-2.5 rounded-lg space-y-1 cursor-pointer transition-all hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 hover:shadow-[0_0_15px_rgba(0,255,170,0.2)] active:scale-[0.98]"
                  onClick={() => onOpenTempatUmum?.('kesehatan')}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-md shrink-0 group-hover:scale-110 transition-transform">
                        <HeartPulse className="h-3 w-3 text-[#00FFAA]" />
                      </div>
                      <h4 className="text-[9px] sm:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Fasilitas Kesehatan</h4>
                    </div>
                    <span className="text-[8px] text-[#6B8A8A] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Buka →</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-[#E0E0E0]">
                      {kesehatanScore} <span className="text-[8px] text-[#6B8A8A] font-medium">POIN</span>
                    </span>
                    <span className="text-[8px] text-[#6B8A8A]">(rasio {hospitalRatio.toFixed(2)})</span>
                    <span className="text-[8px] text-[#00FFAA] font-bold bg-[#00FFAA]/10 px-1 py-0.5 rounded border border-[#00FFAA]/20">
                      × {healthFactor.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 4. Tingkat Pendidikan (clickable) */}
                <div
                  className="group bg-[#0F2424] border border-[#00FFAA]/20 p-2 sm:p-2.5 rounded-lg space-y-1 cursor-pointer transition-all hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 hover:shadow-[0_0_15px_rgba(0,255,170,0.2)] active:scale-[0.98]"
                  onClick={() => onOpenTempatUmum?.('pendidikan')}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-md shrink-0 group-hover:scale-110 transition-transform">
                        <GraduationCap className="h-3 w-3 text-[#00FFAA]" />
                      </div>
                      <h4 className="text-[9px] sm:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Tingkat Pendidikan</h4>
                    </div>
                    <span className="text-[8px] text-[#6B8A8A] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Buka →</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-[#E0E0E0]">
                      {pendidikanScore} <span className="text-[8px] text-[#6B8A8A] font-medium">POIN</span>
                    </span>
                    <span className="text-[8px] text-[#6B8A8A]">(rasio {educationRatio.toFixed(2)})</span>
                    <span className="text-[8px] text-[#00FFAA] font-bold bg-[#00FFAA]/10 px-1 py-0.5 rounded border border-[#00FFAA]/20">
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