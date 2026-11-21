"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Globe,
  Lock,
  Unlock,
  Shield,
  Tv,
  Plane,
  Users,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Info,
} from "lucide-react";
import { fetchDoktrinKeterbukaanFromDb } from "../../../../../../../json/2_database_doktrin_keterbukaan/index";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface DoktrinKeterbukaanSectionProps {
  countryDetail?: Record<string, any> | null;
}

interface DoctrineIndicator {
  key: string;
  category: "civil" | "media" | "global";
  icon: React.ElementType;
}

const DOCTRINE_INDICATORS: DoctrineIndicator[] = [
  // 1. Kebebasan Sipil & HAM
  { key: "speechScore", category: "civil", icon: Users },
  { key: "religionScore", category: "civil", icon: Shield },
  { key: "demoScore", category: "civil", icon: Users },
  { key: "transparencyScore", category: "civil", icon: Eye },

  // 2. Media & Informasi
  { key: "mediaScore", category: "media", icon: Tv },
  { key: "internetScore", category: "media", icon: Globe },

  // 3. Perbatasan & Geopolitik
  { key: "borderScore", category: "global", icon: Plane },
  { key: "tradeScore", category: "global", icon: Scale },
  { key: "diplomacyScore", category: "global", icon: Globe },
];

export default function DoktrinKeterbukaanSection({
  countryDetail,
}: DoktrinKeterbukaanSectionProps) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dbData, setDbData] = useState<Record<string, any> | null>(null);

  const countryName =
    countryDetail?.country ||
    countryDetail?.nama_negara ||
    countryDetail?.name_id ||
    countryDetail?.name_en ||
    "Negara";

  useEffect(() => {
    fetchDoktrinKeterbukaanFromDb(countryName).then((res: any) => {
      if (res) setDbData(res);
    });
  }, [countryName]);

  const scores = useMemo(() => {
    const getVal = (key: string, def: number) => {
      if (countryDetail?.[key] !== undefined && countryDetail?.[key] !== null) {
        const v = Number(countryDetail[key]);
        if (!Number.isNaN(v)) return v;
      }
      if (dbData?.[key] !== undefined && dbData?.[key] !== null) {
        const v = Number(dbData[key]);
        if (!Number.isNaN(v)) return v;
      }
      // snake_case fallback
      const snake = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      if (dbData?.[snake] !== undefined && dbData?.[snake] !== null) {
        const v = Number(dbData[snake]);
        if (!Number.isNaN(v)) return v;
      }
      return def;
    };

    return {
      speechScore: getVal("speechScore", 55),
      religionScore: getVal("religionScore", 60),
      demoScore: getVal("demoScore", 50),
      transparencyScore: getVal("transparencyScore", 45),
      mediaScore: getVal("mediaScore", 50),
      internetScore: getVal("internetScore", 65),
      borderScore: getVal("borderScore", 55),
      tradeScore: getVal("tradeScore", 60),
      diplomacyScore: getVal("diplomacyScore", 70),
    };
  }, [countryDetail, dbData]);

  // Overall Openness Score (Average)
  const overallScore = useMemo(() => {
    const vals = Object.values(scores);
    const sum = vals.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / vals.length);
  }, [scores]);

  // Status Rezim Keterbukaan
  const regime = useMemo(() => {
    if (overallScore <= 20) {
      return {
        label: t("detail_negara_ai.building.doktrin.regimes.autarki.label"),
        desc: t("detail_negara_ai.building.doktrin.regimes.autarki.desc"),
        color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        badge: "Otoriter Autarki",
      };
    }
    if (overallScore <= 40) {
      return {
        label: t("detail_negara_ai.building.doktrin.regimes.proteksionis.label"),
        desc: t("detail_negara_ai.building.doktrin.regimes.proteksionis.desc"),
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        badge: "Proteksionis Terbatas",
      };
    }
    if (overallScore <= 60) {
      return {
        label: t("detail_negara_ai.building.doktrin.regimes.moderat.label"),
        desc: t("detail_negara_ai.building.doktrin.regimes.moderat.desc"),
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        badge: "Moderat Campuran",
      };
    }
    if (overallScore <= 80) {
      return {
        label: t("detail_negara_ai.building.doktrin.regimes.terbuka.label"),
        desc: t("detail_negara_ai.building.doktrin.regimes.terbuka.desc"),
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
        badge: "Demokratis Terbuka",
      };
    }
    return {
      label: t("detail_negara_ai.building.doktrin.regimes.globalis.label"),
      desc: t("detail_negara_ai.building.doktrin.regimes.globalis.desc"),
      color: "text-root-accent bg-root-accent/10 border-root-accent/30",
      badge: "Globalis Bebas Penuh",
    };
  }, [overallScore, t]);

  const filteredIndicators = useMemo(() => {
    return DOCTRINE_INDICATORS.filter(
      (ind) => selectedCategory === "all" || ind.category === selectedCategory
    );
  }, [selectedCategory]);

  const getScoreColor = (val: number) => {
    if (val >= 70) return "text-emerald-400";
    if (val >= 45) return "text-amber-400";
    return "text-rose-400";
  };

  const getBarGradient = (val: number) => {
    if (val >= 70) return "from-emerald-600 to-emerald-400";
    if (val >= 45) return "from-amber-600 to-amber-400";
    return "from-rose-600 to-rose-400";
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO SUMMARY SECTION */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D2E2B] via-[#09221F] to-[#041412] p-5 sm:p-7 border border-root-accent/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-root-accent/15 border border-root-accent/30 text-root-accent text-xs font-black tracking-wider uppercase">
              <Globe className="w-3.5 h-3.5" />
              <span>{t("detail_negara_ai.building.doktrin.badge")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {regime.label}
            </h1>
            <p className="text-xs sm:text-sm text-[#A0D4C2] leading-relaxed">{regime.desc}</p>
          </div>

          {/* Skor Keterbukaan Global */}
          <div className="bg-[#031510]/80 border-2 border-root-accent/40 rounded-2xl p-4 sm:p-5 flex items-center gap-4 min-w-[270px] shadow-lg">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-root-accent/30 to-root-accent/5 border border-root-accent/50 flex items-center justify-center shrink-0">
              <Sparkles className="w-7 h-7 text-root-accent" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-root-subtle">
                {t("detail_negara_ai.building.doktrin.indexTitle")}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-root-accent">
                  {overallScore}
                </span>
                <span className="text-xs font-bold text-gray-300">/ 100</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mt-1 ${regime.color}`}>
                {regime.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Bar Indikator Utama */}
        <div className="mt-6 pt-5 border-t border-root-accent/20">
          <div className="flex justify-between items-center text-xs font-bold mb-2">
            <span className="flex items-center gap-1.5 text-rose-400">
              <Lock className="w-3.5 h-3.5" /> 0 (Autarki)
            </span>
            <span className="flex items-center gap-1.5 text-root-accent">
              100 (Globalis) <Unlock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="h-3 w-full bg-root-surface rounded-full overflow-hidden border border-root-accent/30">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-root-accent transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(5, Math.min(100, overallScore))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. FILTER KATEGORI */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-root-canvas p-2.5 rounded-xl border border-root-accent/20">
        {[
          { id: "all", label: t("detail_negara_ai.building.doktrin.categories.all"), icon: Globe },
          { id: "civil", label: t("detail_negara_ai.building.doktrin.categories.civil"), icon: Users },
          { id: "media", label: t("detail_negara_ai.building.doktrin.categories.media"), icon: Tv },
          { id: "global", label: t("detail_negara_ai.building.doktrin.categories.global"), icon: Plane },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${isActive
                  ? "bg-root-accent text-root-canvas shadow-md font-black"
                  : "bg-root-surface text-[#A0C0C0] hover:text-root-accent border border-root-accent/20"
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. GRID 9 INDIKATOR DOKTRIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIndicators.map((item) => {
          const Icon = item.icon;
          const val = (scores as Record<string, number>)[item.key] ?? 50;
          const scoreColor = getScoreColor(val);
          const barGradient = getBarGradient(val);

          const itemName = t(`detail_negara_ai.building.doktrin.indicators.${item.key}.name` as any);
          const itemDesc = t(`detail_negara_ai.building.doktrin.indicators.${item.key}.desc` as any);
          const lowLabel = t(`detail_negara_ai.building.doktrin.indicators.${item.key}.lowLabel` as any);
          const highLabel = t(`detail_negara_ai.building.doktrin.indicators.${item.key}.highLabel` as any);
          const catTag = item.category === "civil"
            ? t("detail_negara_ai.building.doktrin.categoryTags.civil")
            : item.category === "media"
            ? t("detail_negara_ai.building.doktrin.categoryTags.media")
            : t("detail_negara_ai.building.doktrin.categoryTags.global");

          return (
            <div
              key={item.key}
              className="bg-root-canvas rounded-2xl p-5 border border-root-accent/20 hover:border-root-accent/50 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-root-accent/10 border border-root-accent/20 flex items-center justify-center shrink-0 text-root-accent">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-root-accent transition-colors leading-tight">
                        {itemName}
                      </h3>
                      <span className="text-[9px] font-black uppercase text-root-subtle tracking-wider">
                        {catTag}
                      </span>
                    </div>
                  </div>
                  <span className={`text-lg font-black ${scoreColor} shrink-0`}>
                    {val}
                    <span className="text-[10px] text-gray-500 font-semibold">/100</span>
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-4">{itemDesc}</p>
              </div>

              {/* PROGRESS BAR & SPEKTRUM NILAI */}
              <div className="space-y-1.5 pt-2 border-t border-root-accent/10">
                <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                  <span className="truncate max-w-[120px]">{lowLabel}</span>
                  <span className="truncate max-w-[120px] text-right">{highLabel}</span>
                </div>

                <div className="h-2 w-full bg-root-surface rounded-full overflow-hidden border border-root-accent/20">
                  <div
                    className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-300`}
                    style={{ width: `${Math.max(4, Math.min(100, val))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <span className="text-root-subtle">{t("detail_negara_ai.building.doktrin.regulationStatus")}</span>
                  <span className={`font-bold flex items-center gap-1 ${scoreColor}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {val >= 70
                      ? t("detail_negara_ai.building.doktrin.statusOpenFree")
                      : val >= 45
                      ? t("detail_negara_ai.building.doktrin.statusModerate")
                      : t("detail_negara_ai.building.doktrin.statusRestricted")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
