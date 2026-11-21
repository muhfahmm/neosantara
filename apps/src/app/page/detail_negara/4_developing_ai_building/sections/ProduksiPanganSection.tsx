"use client";

import React, { useMemo, useState } from "react";
import {
  Apple,
  Wheat,
  Fish,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Layers,
  Search,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface SubCategoryFood {
  id: "all" | "peternakan" | "agrikultur" | "perikanan" | "olahan_pangan";
  icon: React.ElementType;
  color: string;
  borderColor: string;
  badgeBg: string;
  items: {
    key: string;
    label: string;
    unitSuffix: string;
    subCatId: "peternakan" | "agrikultur" | "perikanan" | "olahan_pangan";
  }[];
}

const FOOD_SUB_CATEGORIES: SubCategoryFood[] = [
  {
    id: "peternakan",
    icon: ShoppingBag,
    color: "#F59E0B",
    borderColor: "border-amber-500/30",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    items: [
      { key: "ayam_unggas", label: "Peternakan Ayam Unggas", unitSuffix: "peternakan", subCatId: "peternakan" },
      { key: "sapi_perah", label: "Peternakan Sapi Perah", unitSuffix: "peternakan", subCatId: "peternakan" },
      { key: "sapi_potong", label: "Peternakan Sapi Potong", unitSuffix: "peternakan", subCatId: "peternakan" },
      { key: "domba_kambing", label: "Peternakan Domba & Kambing", unitSuffix: "peternakan", subCatId: "peternakan" },
    ],
  },
  {
    id: "agrikultur",
    icon: Wheat,
    color: "#10B981",
    borderColor: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    items: [
      { key: "padi", label: "Lahan Padi", unitSuffix: "lahan", subCatId: "agrikultur" },
      { key: "gandum", label: "Lahan Gandum", unitSuffix: "lahan", subCatId: "agrikultur" },
      { key: "jagung", label: "Lahan Jagung", unitSuffix: "lahan", subCatId: "agrikultur" },
      { key: "sayur", label: "Kebun Sayuran", unitSuffix: "kebun", subCatId: "agrikultur" },
      { key: "umbi", label: "Kebun Umbi-umbian", unitSuffix: "kebun", subCatId: "agrikultur" },
      { key: "kedelai", label: "Lahan Kedelai", unitSuffix: "lahan", subCatId: "agrikultur" },
      { key: "kelapa_sawit", label: "Perkebunan Kelapa Sawit", unitSuffix: "kebun", subCatId: "agrikultur" },
      { key: "kopi", label: "Perkebunan Kopi", unitSuffix: "kebun", subCatId: "agrikultur" },
      { key: "teh", label: "Perkebunan Teh", unitSuffix: "kebun", subCatId: "agrikultur" },
      { key: "kakao", label: "Perkebunan Kakao", unitSuffix: "kebun", subCatId: "agrikultur" },
      { key: "tebu", label: "Perkebunan Tebu", unitSuffix: "kebun", subCatId: "agrikultur" },
      { key: "karet", label: "Perkebunan Karet", unitSuffix: "kebun", subCatId: "agrikultur" },
    ],
  },
  {
    id: "perikanan",
    icon: Fish,
    color: "#06B6D4",
    borderColor: "border-cyan-500/30",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    items: [
      { key: "ikan", label: "Perikanan Tangkap Laut", unitSuffix: "armada", subCatId: "perikanan" },
      { key: "udang", label: "Tambak Udang", unitSuffix: "tambak", subCatId: "perikanan" },
      { key: "mutiara", label: "Budidaya Mutiara", unitSuffix: "tambak", subCatId: "perikanan" },
    ],
  },
  {
    id: "olahan_pangan",
    icon: Apple,
    color: "#EC4899",
    borderColor: "border-pink-500/30",
    badgeBg: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    items: [
      { key: "beras", label: "Pabrik Pengolahan Beras", unitSuffix: "pabrik", subCatId: "olahan_pangan" },
      { key: "gula", label: "Pabrik Gula", unitSuffix: "pabrik", subCatId: "olahan_pangan" },
      { key: "roti", label: "Pabrik Roti", unitSuffix: "pabrik", subCatId: "olahan_pangan" },
      { key: "mie_instan", label: "Pabrik Mie Instan", unitSuffix: "pabrik", subCatId: "olahan_pangan" },
      { key: "minyak_goreng", label: "Pabrik Minyak Goreng", unitSuffix: "pabrik", subCatId: "olahan_pangan" },
      { key: "susu", label: "Pabrik Pengolahan Susu", unitSuffix: "pabrik", subCatId: "olahan_pangan" },
      { key: "pengolahan_daging", label: "Pabrik Pengolahan Daging", unitSuffix: "pabrik", subCatId: "olahan_pangan" },
      { key: "air_mineral", label: "Pabrik Air Mineral", unitSuffix: "pabrik", subCatId: "olahan_pangan" },
    ],
  },
];

const ALL_FOOD_ITEMS = FOOD_SUB_CATEGORIES.flatMap((c) => c.items);

const formatNumber = (val: unknown): string => {
  const num = Number(val ?? 0);
  return Number.isFinite(num) ? num.toLocaleString("id-ID", { maximumFractionDigits: 0 }) : "0";
};

interface ProduksiPanganSectionProps {
  countryDetail?: Record<string, any> | null;
  metadata?: Record<string, any>;
}

export default function ProduksiPanganSection({
  countryDetail,
  metadata = {},
}: ProduksiPanganSectionProps) {
  const { t } = useLanguage();
  const [selectedSubCat, setSelectedSubCat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Resolusi nilai bangunan pangan
  const getBuildingCount = (key: string): number => {
    return Number(countryDetail?.[key]) || 0;
  };

  // Statistik per sub-kategori
  const stats = useMemo(() => {
    let totalAll = 0;
    const subTotals: Record<string, number> = {};

    FOOD_SUB_CATEGORIES.forEach((sub) => {
      let subSum = 0;
      sub.items.forEach((item) => {
        const c = getBuildingCount(item.key);
        subSum += c;
      });
      subTotals[sub.id] = subSum;
      totalAll += subSum;
    });

    return { totalAll, subTotals };
  }, [countryDetail]);

  const activeSubCategoryObj = useMemo(() => {
    return FOOD_SUB_CATEGORIES.find((c) => c.id === selectedSubCat);
  }, [selectedSubCat]);

  const displayedItems = useMemo(() => {
    let items = selectedSubCat === "all" ? ALL_FOOD_ITEMS : activeSubCategoryObj?.items || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => {
        const itemLabel = metadata?.[item.key]?.label || item.label;
        return itemLabel.toLowerCase().includes(q);
      });
    }
    return items;
  }, [selectedSubCat, activeSubCategoryObj, searchQuery, metadata]);

  return (
    <div className="space-y-6">
      {/* 1. HERO SUMMARY SECTION */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D2E2B] via-[#09221F] to-[#041412] p-5 sm:p-7 border border-root-accent/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-root-accent/15 border border-root-accent/30 text-root-accent text-xs font-black tracking-wider uppercase">
              <Wheat className="w-3.5 h-3.5" />
              <span>{t("detail_negara_ai.building.produksiPangan.badge")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {t("detail_negara_ai.building.produksiPangan.title")}
            </h1>
            <p className="text-xs sm:text-sm text-[#A0D4C2] leading-relaxed">
              {t("detail_negara_ai.building.produksiPangan.desc")}
            </p>
          </div>

          {/* TOTAL UNIT CARD */}
          <div className="bg-[#031510]/80 border-2 border-root-accent/40 rounded-2xl p-4 sm:p-5 flex items-center gap-4 min-w-[270px] shadow-lg">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-root-accent/30 to-root-accent/5 border border-root-accent/50 flex items-center justify-center shrink-0">
              <Warehouse className="w-7 h-7 text-root-accent" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-root-subtle">
                {t("detail_negara_ai.building.produksiPangan.totalCapacity")}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-root-accent">
                  {formatNumber(stats.totalAll)}
                </span>
                <span className="text-xs font-bold text-gray-300">
                  {t("detail_negara_ai.building.produksiPangan.unitFacility")}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {t("detail_negara_ai.building.produksiPangan.facilitiesActive")}
              </span>
            </div>
          </div>
        </div>

        {/* 2. SUB-STATS: BREAKDOWN TIAP SUB-SEKTOR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-root-accent/20">
          {FOOD_SUB_CATEGORIES.map((sub) => {
            const Icon = sub.icon;
            const subCount = stats.subTotals[sub.id] || 0;
            const isSelected = selectedSubCat === sub.id;
            const subTitle = t(`detail_negara_ai.building.produksiPangan.subcategories.${sub.id}.title` as any);

            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubCat((prev) => (prev === sub.id ? "all" : sub.id))}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-root-accent/15 border-root-accent shadow-md shadow-root-accent/10"
                    : "bg-root-surface/60 border-root-accent/20 hover:border-root-accent/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${sub.color}15`,
                      borderColor: `${sub.color}30`,
                      color: sub.color,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-xs font-bold truncate ${
                      isSelected ? "text-root-accent font-black" : "text-white"
                    }`}
                  >
                    {subTitle}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black text-root-accent">
                    {formatNumber(subCount)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {t("detail_negara_ai.building.produksiPangan.unit")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FILTER TABS & SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-root-canvas/60 p-3 rounded-2xl border border-root-accent/15">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedSubCat("all")}
            className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedSubCat === "all"
                ? "bg-root-accent text-root-canvas font-black shadow-sm"
                : "bg-root-surface text-root-subtle hover:text-root-accent border border-root-accent/20"
            }`}
          >
            <span>{t("detail_negara_ai.building.produksiPangan.allSubsectors", { count: formatNumber(stats.totalAll) })}</span>
          </button>
          {FOOD_SUB_CATEGORIES.map((sub) => {
            const isSelected = selectedSubCat === sub.id;
            const subTitle = t(`detail_negara_ai.building.produksiPangan.subcategories.${sub.id}.title` as any);
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubCat(sub.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? "bg-root-accent text-root-canvas font-black shadow-sm"
                    : "bg-root-surface text-root-subtle hover:text-root-accent border border-root-accent/20"
                }`}
              >
                <span>
                  {subTitle} ({formatNumber(stats.subTotals[sub.id] || 0)})
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-root-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("detail_negara_ai.building.produksiPangan.searchPlaceholder")}
            className="w-full bg-root-surface border border-root-accent/20 rounded-lg pl-8 pr-3 py-1.5 text-xs text-root-text placeholder-root-subtle focus:outline-none focus:border-root-accent"
          />
        </div>
      </div>

      {/* 4. GRID DAFTAR KOMODITAS PANGAN */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-root-accent flex items-center gap-2">
            <Layers className="w-4 h-4" />
            {selectedSubCat === "all"
              ? t("detail_negara_ai.building.produksiPangan.totalProductionUnits", { count: displayedItems.length })
              : t(`detail_negara_ai.building.produksiPangan.subcategories.${selectedSubCat}.desc` as any)}
          </h2>
          <span className="text-[10px] text-root-subtle font-semibold">
            {t("detail_negara_ai.building.produksiPangan.activeFacilitiesCount", { count: displayedItems.filter((i) => getBuildingCount(i.key) > 0).length })}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayedItems.map((item) => {
            const count = getBuildingCount(item.key);
            const isZero = count === 0;
            const bMeta = metadata?.[item.key];
            const displayLabel = bMeta?.label || item.label;
            const unitSuffix = bMeta?.unitSuffix || item.unitSuffix || t("detail_negara_ai.building.produksiPangan.unit");

            return (
              <div
                key={item.key}
                className="bg-root-canvas border border-root-accent/20 rounded-2xl p-3.5 flex flex-col justify-between hover:border-root-accent/50 transition-all shadow-sm group min-h-[95px]"
              >
                <div>
                  <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#8AB0A8] leading-tight line-clamp-2">
                    {displayLabel}
                  </p>
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-lg sm:text-xl font-black tracking-tight leading-none ${
                        isZero ? "text-root-subtle" : "text-root-text"
                      }`}
                    >
                      {formatNumber(count)}
                    </span>
                    <span className="text-[9px] font-bold text-root-subtle uppercase">
                      {unitSuffix}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-root-accent/10 text-[9px] font-semibold text-root-subtle">
                    <span>
                      {count > 0 ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {t("detail_negara_ai.building.produksiPangan.statusActive")}
                        </span>
                      ) : (
                        <span className="text-gray-500 font-medium">{t("detail_negara_ai.building.produksiPangan.statusUnbuilt")}</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
