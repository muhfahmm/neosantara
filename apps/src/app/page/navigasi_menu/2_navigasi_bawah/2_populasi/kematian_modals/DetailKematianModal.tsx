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
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

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

  const { t, language } = useLanguage();
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

  const formatNumber = (num: number) => num.toLocaleString(language, { maximumFractionDigits: 2 });
  const countryDisplayName = selectedCountry?.country || "Indonesia";

  return (
    <>
      <NotebookModalWrapper
        compact
        frameClassName="populasi-info-content-sized-frame"
        zIndexClass="z-[75]"
        onClose={onClose}
      >
        <div className="flex w-full min-w-0 flex-col overflow-hidden bg-root-surface">
          <RootInfoModalHeader
            title={t("navigation_population_deaths.title")}
            onClose={onClose}
            size="standard"
            icon={<Skull aria-hidden="true" />}
          />

          {/* Body */}
          <div className="max-h-[calc(100dvh-170px)] min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 bg-root-surface neon-scrollbar space-y-3">
            
            {/* Ringkasan Utama */}
            <div className="relative bg-gradient-to-br from-root-surface to-root-canvas border border-rose-500/30 rounded-xl p-2.5 sm:p-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-rose-400">
                    <Skull className="h-3.5 w-3.5 text-rose-400" />
                    {t("navigation_population_deaths.dailyDeaths")}
                  </p>
                  <p className="text-base sm:text-lg font-black text-rose-400 tabular-nums tracking-tight">
                    -{formatNumber(dailyDeaths)}
                    <span className="text-[10px] sm:text-xs font-bold text-root-subtle ml-1">{t("navigation_population_deaths.perHour")}</span>
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-root-canvas border border-rose-500/30 text-rose-400 shadow-inner">
                  <Skull className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
            </div>

            {/* Breakdown Faktor */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 pb-1 border-b border-root-accent/15">
                <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-root-accent">
                  {t("navigation_population_deaths.factors")}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1. Harapan Hidup */}
                <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-root-subtle">
                    <Heart className="h-3.5 w-3.5 text-rose-400" />
                    <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-root-text">{t("navigation_population_deaths.lifeExpectancy")}</h4>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-black tabular-nums text-root-text">
                    <span>{harapanHidup} {t("navigation_population_deaths.years")}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-root-accent">× {lifeExpectancyFactor.toFixed(2)}</span>
                  </div>
                  <p className="text-[9px] text-root-subtle leading-tight">{t("navigation_population_deaths.lifeExpectancyDescription")}</p>
                </div>

                {/* 2. Keamanan */}
                <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-root-subtle">
                    <Shield className="h-3.5 w-3.5 text-cyan-400" />
                    <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-root-text">{t("navigation_population_deaths.security")}</h4>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-black tabular-nums text-root-text">
                    <span>{tingkatKeamanan}%</span>
                    <span className="text-[10px] sm:text-xs font-bold text-root-accent">× {securityFactor.toFixed(2)}</span>
                  </div>
                  <p className="text-[9px] text-root-subtle leading-tight">{t("navigation_population_deaths.securityDescription")}</p>
                </div>

                {/* 3. Tunawisma */}
                <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-root-subtle">
                    <Home className="h-3.5 w-3.5 text-amber-400" />
                    <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-root-text">{t("navigation_population_deaths.homeless")}</h4>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-black tabular-nums text-root-text">
                    <span>{t("navigation_population_deaths.homelessCount", {
                      count: formatNumber(homelessCount),
                      ratio: (homelessRatio * 100).toFixed(2),
                    })}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-root-accent">× {homelessFactor.toFixed(2)}</span>
                  </div>
                  <p className="text-[9px] text-root-subtle leading-tight">{t("navigation_population_deaths.homelessDescription")}</p>
                </div>

                {/* 4. Kesehatan (clickable) */}
                <div 
                  className="rounded-xl border border-root-accent/25 bg-root-canvas hover:border-root-accent/50 p-2.5 space-y-1 cursor-pointer transition-colors"
                  onClick={() => onOpenTempatUmum?.('kesehatan')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <HeartPulse className="h-3.5 w-3.5 text-emerald-400" />
                      <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-root-text">{t("navigation_population_deaths.healthFacilities")}</h4>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-root-accent hover:underline">{t("navigation_population_deaths.open")}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-black tabular-nums text-root-text">
                    <span>{calculateKesehatanScore(countryDetail)} {t("navigation_population_deaths.points")} <span className="text-[9px] font-normal text-root-subtle">{t("navigation_population_deaths.ratio", { value: hospitalRatio.toFixed(2) })}</span></span>
                    <span className="text-[10px] sm:text-xs font-bold text-root-accent">× {healthFactor.toFixed(2)}</span>
                  </div>
                  <p className="text-[9px] text-root-subtle leading-tight">{t("navigation_population_deaths.healthDescription")}</p>
                </div>

                {/* 5. Ketahanan Pangan (clickable) */}
                <div 
                  className="rounded-xl border border-root-accent/25 bg-root-canvas hover:border-root-accent/50 p-2.5 space-y-1 cursor-pointer transition-colors"
                  onClick={() => onOpenIndustriPangan?.()}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Utensils className="h-3.5 w-3.5 text-lime-400" />
                      <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-root-text">{t("navigation_population_deaths.foodSecurity")}</h4>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-root-accent hover:underline">Buka →</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-black tabular-nums text-root-text">
                    <span>{indeksKetahananPangan} {t("navigation_population_deaths.points")}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-root-accent">× {foodSecurityFactor.toFixed(2)}</span>
                  </div>
                  <p className="text-[9px] text-root-subtle leading-tight">{t("navigation_population_deaths.foodDescription")}</p>
                </div>

                {/* 6. Kriminalitas (clickable) */}
                <div 
                  className="rounded-xl border border-root-accent/25 bg-root-canvas hover:border-root-accent/50 p-2.5 space-y-1 cursor-pointer transition-colors"
                  onClick={() => onOpenArmada?.('polisi')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-root-text">{t("navigation_population_deaths.lawEnforcement")}</h4>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-root-accent hover:underline">{t("navigation_population_deaths.open")}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-black tabular-nums text-root-text">
                    <span>{calculatePenegakanHukumScore(countryDetail)} {t("navigation_population_deaths.points")}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-root-accent">× {crimeFactor.toFixed(2)}</span>
                  </div>
                  <p className="text-[9px] text-root-subtle leading-tight">{t("navigation_population_deaths.lawDescription")}</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </NotebookModalWrapper>
    </>
  );
}