"use client";

import React, { useState, useEffect } from "react";
import { Users, Heart, Shield, Home, HeartPulse, Utensils, AlertTriangle, ArrowUpRight, Skull } from "lucide-react";
import { fetchBuildingMetadata } from "@/lib/buildingMetadata";

import {
  calculateGeneralSatisfaction,
  calculateLifeExpectancy,
  calculateSecurityLevel,
  calculateDailyDeaths,
} from "@/app/logic/populations_logic/population_logic";
import { calculatePanganScore, calculateKesehatanScore, calculatePenegakanHukumScore } from "@/app/logic/kepuasanCalculator";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
// Import dari logic yang baru dibuat
import { calculateKeamananLogic } from "./logic/keamananLogic";
import { calculateKesehatanLogic } from "./logic/kesehatanLogic";
import { calculateTunawismaLogic } from "./logic/tunawismaLogic";
import { calculateKriminalitasLogic } from "./logic/kriminalitasLogic";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";

interface DetailKematianModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  selectedCountry?: any;
  dailyDeaths?: number;
  homelessCount?: number; // Data tunawisma dari induk
  onOpenTempatUmum?: (tabId: string) => void;
  onOpenIndustriPangan?: () => void;
  onOpenArmada?: (tabId: 'aktif' | 'infrastruktur' | 'polisi') => void;
}

export default function DetailKematianModal({
  isOpen,
  onClose,
  countryDetail,
  selectedCountry,
  dailyDeaths: propsDailyDeaths,
  homelessCount: propsHomelessCount,
  onOpenTempatUmum,
  onOpenIndustriPangan,
  onOpenArmada,
}: DetailKematianModalProps) {

  // Fetch building metadata agar rumus Pangan identik 100% dengan IndeksKesejahteraanModal
  const [metadata, setMetadata] = useState<any>(null);
  useEffect(() => {
    if (!isOpen) return;
    fetchBuildingMetadata().then((data) => setMetadata(data || {}));
  }, [isOpen]);

  if (!isOpen) return null;

  const populasi = countryDetail?.jumlah_penduduk || 10_000_000;

  const countryName = selectedCountry?.country?.toLowerCase?.() || "";

  const detailWithDefaults = { ...countryDetail };
  const kepuasanUmum = calculateGeneralSatisfaction(detailWithDefaults);
  const lifeExpectancy = calculateLifeExpectancy(detailWithDefaults, kepuasanUmum);
  const securityLevel = calculateSecurityLevel(detailWithDefaults, kepuasanUmum);

  const storedFood = countryDetail?.satisfaction?.food;
  const indeksKetahananPangan = (!metadata || Object.keys(metadata).length === 0)
    ? (storedFood !== undefined && storedFood !== null ? Math.round(Number(storedFood)) : calculatePanganScore(countryDetail, undefined))
    : calculatePanganScore(countryDetail, metadata);

  // Hitung dengan logic terpusat
  const keamananRes = calculateKeamananLogic(countryDetail, populasi);
  const kesehatanRes = calculateKesehatanLogic(countryDetail, populasi);
  const tunawismaRes = calculateTunawismaLogic(countryDetail, populasi, propsHomelessCount);
  const kriminalitasRes = calculateKriminalitasLogic(countryDetail, populasi);

  const tingkatKeamanan = keamananRes.tingkatKeamanan;
  const homelessCount = tunawismaRes.homelessCount;
  const jumlahRumahSakit = kesehatanRes.jumlahRumahSakit;
  const tingkatKriminalitas = kriminalitasRes.tingkatKriminalitas;

  const harapanHidup = Math.round(calculateLifeExpectancy(detailWithDefaults, kepuasanUmum));
  const lifeExpectancyFactor = Math.max(0.8, 1.2 - (0.005 * (harapanHidup - 50)));
  const securityFactor = keamananRes.securityFactor;
  const homelessRatio = homelessCount / populasi;
  const homelessFactor = tunawismaRes.homelessFactor;
  const hospitalRatio = kesehatanRes.kesehatanRatio;
  const healthFactor = kesehatanRes.healthFactor;
  const foodSecurityFactor = Math.max(0.5, 1.2 - (0.005 * indeksKetahananPangan));
  const crimeFactor = kriminalitasRes.crimeFactor;

  const dailyDeaths = propsDailyDeaths !== undefined
    ? propsDailyDeaths
    : calculateDailyDeaths(populasi, lifeExpectancy, securityLevel, detailWithDefaults);

  const formatNumber = (num: number) => num.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const countryDisplayName = selectedCountry?.country || "Indonesia";

  return (
    <>
      <NotebookModalWrapper onClose={onClose}>

        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-rose-500/30 shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" />
            </div>
            <div>
              <h2 className={`${rootModalTypography.title} leading-none`}>Rincian Angka Kematian</h2>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 bg-root-canvas/80 relative z-10 custom-scrollbar">
          <div className="space-y-6">
            
            {/* Ringkasan Utama */}
            <div className={`bg-root-canvas border border-root-accent/20 p-6 ${rootBorderRadius.card}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-root-muted uppercase tracking-wider">Kematian Harian</p>
                  <p className="text-4xl font-black text-rose-400 mt-1">-{formatNumber(dailyDeaths)}</p>
                </div>
                <div className="p-4 bg-rose-500/10 rounded-full border border-rose-500/30">
                  <Skull className="h-10 w-10 text-rose-400" />
                </div>
              </div>
            </div>

            {/* Breakdown Faktor */}
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              {/* 1. Harapan Hidup */}
              <div className={`min-w-0 bg-root-canvas border border-root-accent/20 p-4 ${rootBorderRadius.card} space-y-2 relative`}>
                <div className="flex min-w-0 items-center gap-2">
                  <div className="p-1.5 bg-root-accent/10 rounded-lg">
                    <Heart className="h-4 w-4 text-root-text" />
                  </div>
                  <h4 className="min-w-0 break-words text-xs font-black uppercase text-root-text">Harapan Hidup</h4>
                </div>
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="min-w-0 break-words text-sm font-bold text-root-text">{harapanHidup} tahun</span>
                  <span className="text-[10px] text-root-muted">× {lifeExpectancyFactor.toFixed(2)}</span>
                </div>
                <p className="min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] text-[10px] leading-relaxed text-root-muted">Semakin tinggi harapan hidup, semakin rendah angka kematian.</p>
              </div>

              {/* 2. Keamanan */}
              <div className={`min-w-0 bg-root-canvas border border-root-accent/20 p-4 ${rootBorderRadius.card} space-y-2 relative`}>
                <div className="flex min-w-0 items-center gap-2">
                  <div className="p-1.5 bg-root-accent/10 rounded-lg">
                    <Shield className="h-4 w-4 text-root-text" />
                  </div>
                  <h4 className="min-w-0 break-words text-xs font-black uppercase text-root-text">Tingkat Keamanan</h4>
                </div>
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="min-w-0 break-words text-sm font-bold text-root-text">{tingkatKeamanan}%</span>
                  <span className="text-[10px] text-root-muted">× {securityFactor.toFixed(2)}</span>
                </div>
                <p className="min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] text-[10px] leading-relaxed text-root-muted">Lingkungan aman mengurangi kematian akibat kriminalitas dan kecelakaan.</p>
              </div>

              {/* 3. Tunawisma */}
              <div className={`min-w-0 bg-root-canvas border border-root-accent/20 p-4 ${rootBorderRadius.card} space-y-2 relative`}>
                <div className="flex min-w-0 items-center gap-2">
                  <div className="p-1.5 bg-root-accent/10 rounded-lg">
                    <Home className="h-4 w-4 text-root-text" />
                  </div>
                  <h4 className="min-w-0 break-words text-xs font-black uppercase text-root-text">Tunawisma</h4>
                </div>
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="min-w-0 break-words text-sm font-bold text-root-text">{formatNumber(homelessCount)} jiwa ({ (homelessRatio * 100).toFixed(2)}%)</span>
                  <span className="text-[10px] text-root-muted">× {homelessFactor.toFixed(2)}</span>
                </div>
                <p className="min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] text-[10px] leading-relaxed text-root-muted">Setiap 1% populasi tunawisma meningkatkan kematian sebesar 5%.</p>
              </div>

              {/* 4. Kesehatan */}
              <div 
                className={`min-w-0 bg-root-canvas border border-root-accent/20 p-4 ${rootBorderRadius.card} space-y-2 relative cursor-pointer hover:border-root-accent/60 hover:bg-root-accent/5 transition-all duration-200`}
                onClick={() => onOpenTempatUmum?.('kesehatan')}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="p-1.5 bg-root-accent/10 rounded-lg">
                    <HeartPulse className="h-4 w-4 text-root-text" />
                  </div>
                  <h4 className="min-w-0 break-words text-xs font-black uppercase text-root-text">Fasilitas Kesehatan</h4>
                </div>
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="min-w-0 break-words text-sm font-bold text-root-text">{calculateKesehatanScore(countryDetail)} POIN <span className="text-xs font-normal text-root-muted">(rasio {hospitalRatio.toFixed(2)})</span></span>
                  <span className="text-[10px] text-root-muted">× {healthFactor.toFixed(2)}</span>
                </div>
                <p className="min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] text-[10px] leading-relaxed text-root-muted">Ketersediaan RS yang cukup menurunkan kematian akibat penyakit yang dapat diobati.</p>
              </div>

              {/* 5. Ketahanan Pangan */}
              <div 
                className={`min-w-0 bg-root-canvas border border-root-accent/20 p-4 ${rootBorderRadius.card} space-y-2 relative cursor-pointer hover:border-root-accent/60 hover:bg-root-accent/5 transition-all duration-200`}
                onClick={() => onOpenIndustriPangan?.()}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="p-1.5 bg-root-accent/10 rounded-lg">
                    <Utensils className="h-4 w-4 text-root-text" />
                  </div>
                  <h4 className="min-w-0 break-words text-xs font-black uppercase text-root-text">Ketahanan Pangan</h4>
                </div>
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="min-w-0 break-words text-sm font-bold text-root-text">{indeksKetahananPangan} POIN</span>
                  <span className="text-[10px] text-root-muted">× {foodSecurityFactor.toFixed(2)}</span>
                </div>
                <p className="min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] text-[10px] leading-relaxed text-root-muted">Ketersediaan pangan yang cukup mengurangi kematian akibat malnutrisi.</p>
              </div>

              {/* 6. Kriminalitas */}
              <div 
                className={`min-w-0 bg-root-canvas border border-root-accent/20 p-4 ${rootBorderRadius.card} space-y-2 relative cursor-pointer hover:border-root-accent/60 hover:bg-root-accent/5 transition-all duration-200`}
                onClick={() => onOpenArmada?.('polisi')}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="p-1.5 bg-root-accent/10 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-root-text" />
                  </div>
                  <h4 className="min-w-0 break-words text-xs font-black uppercase text-root-text">Penegakan Hukum & Kriminalitas</h4>
                </div>
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="min-w-0 break-words text-sm font-bold text-root-text">{calculatePenegakanHukumScore(countryDetail)} POIN</span>
                  <span className="text-[10px] text-root-muted">× {crimeFactor.toFixed(2)}</span>
                </div>
                <p className="min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] text-[10px] leading-relaxed text-root-muted">Skor kepuasan penegakan hukum dari Indeks Kesejahteraan.</p>
              </div>

            </div>
          </div>
        </div>
      </NotebookModalWrapper>
    </>
  );
}