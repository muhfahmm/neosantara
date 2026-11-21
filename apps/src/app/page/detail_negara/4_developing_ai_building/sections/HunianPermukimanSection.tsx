"use client";

import React, { useMemo, useState } from "react";
import {
  Home,
  Building,
  Castle,
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Search,
} from "lucide-react";
import {
  getTotalHousingCapacityBonusPercent,
  applyTotalHousingCapacityBonus,
} from "@/app/page/bonus_logic";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface HunianPermukimanSectionProps {
  countryDetail?: Record<string, any> | null;
  metadata?: Record<string, any>;
}

interface HousingItemConfig {
  key: string;
  category: "subsidi" | "vertikal" | "mewah";
  icon: React.ElementType;
  defaultCapacity: number;
  color: string;
  borderColor: string;
  badgeBg: string;
}

const HOUSING_CONFIGS: HousingItemConfig[] = [
  {
    key: "rumah_subsidi",
    category: "subsidi",
    icon: Home,
    defaultCapacity: 5,
    color: "#10B981",
    borderColor: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    key: "apartemen",
    category: "vertikal",
    icon: Building,
    defaultCapacity: 6000,
    color: "#06B6D4",
    borderColor: "border-cyan-500/30",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  {
    key: "mansion",
    category: "mewah",
    icon: Castle,
    defaultCapacity: 10,
    color: "#F59E0B",
    borderColor: "border-amber-500/30",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
];

const formatNumber = (val: unknown): string => {
  const num = Number(val ?? 0);
  return Number.isFinite(num) ? num.toLocaleString("id-ID", { maximumFractionDigits: 0 }) : "0";
};

export default function HunianPermukimanSection({
  countryDetail,
  metadata = {},
}: HunianPermukimanSectionProps) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const population = Number(countryDetail?.jumlah_penduduk) || 0;

  // Bonus penelitian kapasitas hunian
  const housingBonusPercent = useMemo(() => {
    return getTotalHousingCapacityBonusPercent(countryDetail);
  }, [countryDetail]);

  // Hitung total unit dan total kapasitas
  const housingStats = useMemo(() => {
    let totalUnits = 0;
    let totalCap = 0;

    const items = HOUSING_CONFIGS.map((cfg) => {
      const count = Number(countryDetail?.[cfg.key]) || 0;
      const bMeta = metadata[cfg.key];
      const baseCap = Number(bMeta?.kapasitas) || cfg.defaultCapacity;
      const effectiveCap = applyTotalHousingCapacityBonus(baseCap, countryDetail);
      const subtotalCapacity = count * effectiveCap;

      totalUnits += count;
      totalCap += subtotalCapacity;

      return {
        ...cfg,
        label: t(`detail_negara_ai.building.hunian.items.${cfg.key}.label` as any),
        categoryLabel: t(`detail_negara_ai.building.hunian.items.${cfg.key}.categoryLabel` as any),
        desc: t(`detail_negara_ai.building.hunian.items.${cfg.key}.desc` as any),
        detailDesc: t(`detail_negara_ai.building.hunian.items.${cfg.key}.detailDesc` as any),
        count,
        baseCap,
        effectiveCap,
        subtotalCapacity,
      };
    });

    const deficitOrSurplus = totalCap - population;
    const isDeficit = deficitOrSurplus < 0;
    const coveragePercent =
      population > 0 ? Math.min(100, Math.round((totalCap / population) * 100)) : 100;

    return {
      items,
      totalUnits,
      totalCap,
      deficitOrSurplus,
      isDeficit,
      coveragePercent,
    };
  }, [countryDetail, metadata, population, t]);

  const filteredItems = useMemo(() => {
    return housingStats.items.filter((item) => {
      const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
      const matchesQuery =
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [housingStats.items, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. HERO SUMMARY SECTION */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D2E2B] via-[#09221F] to-[#041412] p-5 sm:p-7 border border-root-accent/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-root-accent/15 border border-root-accent/30 text-root-accent text-xs font-black tracking-wider uppercase">
              <Home className="w-3.5 h-3.5" />
              <span>{t("detail_negara_ai.building.hunian.badge")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {t("detail_negara_ai.building.hunian.title")}
            </h1>
            <p className="text-xs sm:text-sm text-[#A0D4C2] leading-relaxed">
              {t("detail_negara_ai.building.hunian.desc")}
            </p>
          </div>

          {/* STATUS KAPASITAS VS POPULASI CARD */}
          <div className="bg-[#031510]/80 border-2 border-root-accent/40 rounded-2xl p-4 sm:p-5 flex items-center gap-4 min-w-[270px] shadow-lg">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-root-accent/30 to-root-accent/5 border border-root-accent/50 flex items-center justify-center shrink-0">
              <Users className="w-7 h-7 text-root-accent" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-root-subtle">
                {t("detail_negara_ai.building.hunian.housingCapacity")}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-root-accent">
                  {housingStats.coveragePercent}%
                </span>
                <span className="text-xs font-bold text-gray-300">
                  ({formatNumber(housingStats.totalCap)} / {formatNumber(population)} {t("detail_negara_ai.building.hunian.people")})
                </span>
              </div>
              <span
                className={`text-[10px] font-semibold flex items-center gap-1 ${
                  !housingStats.isDeficit ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {!housingStats.isDeficit ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    {t("detail_negara_ai.building.hunian.surplus", { count: formatNumber(housingStats.deficitOrSurplus) })}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    {t("detail_negara_ai.building.hunian.deficit", { count: formatNumber(Math.abs(housingStats.deficitOrSurplus)) })}
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 2. SUB-STATS: BREAKDOWN TIAP TIPE HUNIAN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-root-accent/20">
          {housingStats.items.map((it) => {
            const Icon = it.icon;
            const isSelected = selectedCategory === it.category;
            return (
              <button
                key={it.key}
                onClick={() =>
                  setSelectedCategory((prev) => (prev === it.category ? "all" : it.category))
                }
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-root-accent/15 border-root-accent shadow-md shadow-root-accent/10"
                    : "bg-root-surface/60 border-root-accent/20 hover:border-root-accent/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${it.color}15`,
                      borderColor: `${it.color}30`,
                      color: it.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{it.label}</h4>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {formatNumber(it.count)} {t("detail_negara_ai.building.hunian.unit")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-root-accent block">
                    {formatNumber(it.subtotalCapacity)}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                    {t("detail_negara_ai.building.hunian.people")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FILTER TIPE & SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-root-canvas/60 p-3 rounded-2xl border border-root-accent/15">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: t("detail_negara_ai.building.hunian.all") },
            { id: "subsidi", label: t("detail_negara_ai.building.hunian.items.rumah_subsidi.label") },
            { id: "vertikal", label: t("detail_negara_ai.building.hunian.items.apartemen.label") },
            { id: "mewah", label: t("detail_negara_ai.building.hunian.items.mansion.label") },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-root-accent text-root-canvas font-black shadow-sm"
                  : "bg-root-surface text-root-subtle hover:text-root-accent border border-root-accent/20"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-root-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("detail_negara_ai.building.hunian.searchPlaceholder")}
            className="w-full bg-root-surface border border-root-accent/20 rounded-lg pl-8 pr-3 py-1.5 text-xs text-root-text placeholder-root-subtle focus:outline-none focus:border-root-accent"
          />
        </div>
      </div>

      {/* 4. CARDS DETAIL PER JENIS HUNIAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const sharePercent =
            housingStats.totalCap > 0
              ? Math.round((item.subtotalCapacity / housingStats.totalCap) * 100)
              : 0;

          return (
            <div
              key={item.key}
              className="bg-root-canvas rounded-2xl p-5 border border-root-accent/20 hover:border-root-accent/50 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                      style={{ backgroundColor: `${item.color}25`, color: item.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-root-accent transition-colors">
                        {item.label}
                      </h3>
                      <span className="text-[10px] text-root-subtle uppercase font-bold tracking-wider">
                        {item.categoryLabel}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-root-surface text-root-accent border border-root-accent/30 shrink-0">
                    {t("detail_negara_ai.building.hunian.portion", { percent: sharePercent })}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-4">{item.detailDesc}</p>

                {/* STATS HIGHLIGHT */}
                <div className="space-y-2 bg-root-surface p-3 rounded-xl border border-root-accent/15">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-root-subtle font-semibold">
                      {t("detail_negara_ai.building.hunian.buildingCount")}
                    </span>
                    <span className="font-black text-white text-sm">
                      {formatNumber(item.count)} {t("detail_negara_ai.building.hunian.unit")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-root-subtle font-semibold">
                      {t("detail_negara_ai.building.hunian.capacityPerUnit")}
                    </span>
                    <span className="font-bold text-root-accent">
                      {formatNumber(item.effectiveCap)} {t("detail_negara_ai.building.hunian.perUnit")}
                      {housingBonusPercent > 0 && (
                        <span className="text-[10px] text-emerald-400 ml-1">
                          (+{housingBonusPercent}%)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-root-accent/10">
                    <span className="text-root-subtle font-semibold">
                      {t("detail_negara_ai.building.hunian.totalCapacity")}
                    </span>
                    <span className="font-black text-emerald-400 text-sm">
                      {formatNumber(item.subtotalCapacity)} {t("detail_negara_ai.building.hunian.people")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-root-accent/10 flex items-center justify-between text-[11px]">
                <span className="text-root-subtle font-medium">
                  {t("detail_negara_ai.building.hunian.availabilityStatus")}
                </span>
                <span
                  className={`font-black flex items-center gap-1 ${
                    item.count > 0 ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {item.count > 0 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("detail_negara_ai.building.hunian.statusActive")}
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {t("detail_negara_ai.building.hunian.statusUnbuilt")}
                    </>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
