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
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

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
  const { t, language } = useLanguage();
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

  const formatNumber = (num: number) => num.toLocaleString(language, { maximumFractionDigits: 2 });

  return (
    <NotebookModalWrapper
      compact
      frameClassName="populasi-info-content-sized-frame"
      zIndexClass="z-[75]"
      onClose={onClose}
    >
      <div className="flex w-full min-w-0 flex-col overflow-hidden bg-root-surface">
        <RootInfoModalHeader
          title={t("navigation_population_births.title")}
          onClose={onClose}
          size="standard"
          icon={<Users aria-hidden="true" />}
        />

        {/* ============ BODY (COMPACT CONTENT-SIZED) ============ */}
        <div className="max-h-[calc(100dvh-170px)] min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 bg-root-surface neon-scrollbar space-y-3">
          {/* ============ RINGKASAN UTAMA ============ */}
          <div className="relative bg-gradient-to-br from-root-surface to-root-canvas border border-root-accent/30 rounded-xl p-2.5 sm:p-3 shadow-md">
            
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-root-accent/15">
              <div className="space-y-0.5">
                <p className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-root-subtle">
                  <TrendingUp className="h-3.5 w-3.5 text-root-accent" />
                  {t("navigation_population_births.dailyNetGrowth")}
                </p>
                <p className={`text-base sm:text-lg font-black tabular-nums tracking-tight ${netDailyChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {netDailyChange >= 0 ? '+' : ''}{formatNumber(netDailyChange)}
                  <span className="text-[10px] sm:text-xs font-bold text-root-subtle ml-1">{t("navigation_population_births.perHour")}</span>
                </p>
              </div>
              <div className="p-2 rounded-xl bg-root-canvas border border-root-accent/20 text-root-accent shadow-inner">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-root-canvas/90 border border-emerald-500/30 p-2 text-center">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wide text-emerald-400/80 mb-0.5">{t("navigation_population_births.births")}</p>
                <p className="text-xs sm:text-sm font-black text-emerald-400 tabular-nums">
                  +{formatNumber(dailyBirths)}
                </p>
              </div>
              <div className="rounded-lg bg-root-canvas/90 border border-rose-500/30 p-2 text-center">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wide text-rose-400/80 mb-0.5">{t("navigation_population_births.deaths")}</p>
                <p className="text-xs sm:text-sm font-black text-rose-400 tabular-nums">
                  -{formatNumber(dailyDeaths)}
                </p>
              </div>
            </div>
          </div>

          {/* ============ BREAKDOWN FAKTOR ============ */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pb-1 border-b border-root-accent/15">
              <Sparkles className="h-3.5 w-3.5 text-root-accent" />
              <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-root-accent">
                {t("navigation_population_births.factors")}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* 1. Populasi Dasar */}
              <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-root-subtle">
                  <Users className="h-3.5 w-3.5 text-root-accent" />
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-root-text">{t("navigation_population_births.basePopulation")}</h4>
                </div>
                <p className="text-xs sm:text-sm font-black tabular-nums text-root-text">
                  {formatNumber(populasi)} <span className="text-[10px] font-bold text-root-subtle">{t("navigation_population_births.people")}</span>
                </p>
              </div>

              {/* 2. Kesejahteraan */}
              <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-root-subtle">
                  <Banknote className="h-3.5 w-3.5 text-root-accent" />
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-root-text">{t("navigation_population_births.welfare")}</h4>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm font-black tabular-nums text-root-text">
                  <span>
                    {countryDetail?.kesejahteraan !== undefined ? Math.round(Number(countryDetail.kesejahteraan)) : 50} <span className="text-[10px] font-bold text-root-subtle">{t("navigation_population_births.index")}</span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-root-accent">
                    × {welfareFactor.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* 3. Fasilitas Kesehatan (clickable) */}
              <div
                className="rounded-xl border border-root-accent/25 bg-root-canvas hover:border-root-accent/50 p-2.5 space-y-1 cursor-pointer transition-colors"
                onClick={() => onOpenTempatUmum?.('kesehatan')}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <HeartPulse className="h-3.5 w-3.5 text-root-accent" />
                    <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-root-text">{t("navigation_population_births.healthFacilities")}</h4>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-root-accent hover:underline">{t("navigation_population_births.open")}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm font-black tabular-nums text-root-text">
                  <span>
                    {kesehatanScore} <span className="text-[10px] font-bold text-root-subtle">{t("navigation_population_births.points")}</span>
                    <span className="text-[9px] font-normal text-root-subtle ml-1">{t("navigation_population_births.ratio", { value: hospitalRatio.toFixed(2) })}</span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-root-accent">
                    × {healthFactor.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* 4. Tingkat Pendidikan (clickable) */}
              <div
                className="rounded-xl border border-root-accent/25 bg-root-canvas hover:border-root-accent/50 p-2.5 space-y-1 cursor-pointer transition-colors"
                onClick={() => onOpenTempatUmum?.('pendidikan')}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-root-accent" />
                    <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-root-text">{t("navigation_population_births.educationLevel")}</h4>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-root-accent hover:underline">{t("navigation_population_births.open")}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm font-black tabular-nums text-root-text">
                  <span>
                    {pendidikanScore} <span className="text-[10px] font-bold text-root-subtle">{t("navigation_population_births.points")}</span>
                    <span className="text-[9px] font-normal text-root-subtle ml-1">{t("navigation_population_births.ratio", { value: educationRatio.toFixed(2) })}</span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-root-accent">
                    × {educationFactor.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}