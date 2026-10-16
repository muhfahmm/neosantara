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

interface HunianPermukimanSectionProps {
  countryDetail?: Record<string, any> | null;
  metadata?: Record<string, any>;
}

interface HousingItemConfig {
  key: string;
  label: string;
  category: "subsidi" | "vertikal" | "mewah";
  categoryLabel: string;
  icon: React.ElementType;
  defaultCapacity: number;
  desc: string;
  detailDesc: string;
  color: string;
  borderColor: string;
  badgeBg: string;
}

const HOUSING_CONFIGS: HousingItemConfig[] = [
  {
    key: "rumah_subsidi",
    label: "Perumahan Subsidi",
    category: "subsidi",
    categoryLabel: "Hunian Terjangkau",
    icon: Home,
    defaultCapacity: 5,
    desc: "Rumah tapak bersubsidi untuk masyarakat berpenghasilan rendah",
    detailDesc:
      "Disediakan pemerintah dengan insentif harga dan subsidi bunga agar seluruh keluarga memiliki hunian layak huni.",
    color: "#10B981",
    borderColor: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    key: "apartemen",
    label: "Apartemen Vertikal",
    category: "vertikal",
    categoryLabel: "Hunian Vertikal",
    icon: Building,
    defaultCapacity: 6000,
    desc: "Kompleks hunian vertikal terintegrasi ruang kota padat",
    detailDesc:
      "Pembangunan menara apartemen bertingkat untuk memaksimalkan efisiensi lahan perkotaan dan menampung populasi besar.",
    color: "#06B6D4",
    borderColor: "border-cyan-500/30",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  {
    key: "mansion",
    label: "Mansion & Residensial Mewah",
    category: "mewah",
    categoryLabel: "Hunian Premium",
    icon: Castle,
    defaultCapacity: 10,
    desc: "Kawasan pemukiman eksklusif kalangan menengah ke atas",
    detailDesc:
      "Rumah bertapak luas dengan kelengkapan taman privat dan fasilitas eksklusif untuk segmen ekonomi atas.",
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
  }, [countryDetail, metadata, population]);

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D2E2B] via-[#09221F] to-[#041412] p-5 sm:p-7 border border-[#00FFAA]/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#00FFAA]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFAA]/15 border border-[#00FFAA]/30 text-[#00FFAA] text-xs font-black tracking-wider uppercase">
              <Home className="w-3.5 h-3.5" />
              <span>Sektor Hunian & Infrastruktur Permukiman</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Hunian Permukiman Nasional
            </h1>
            <p className="text-xs sm:text-sm text-[#A0D4C2] leading-relaxed">
              Monitoring ketersediaan unit rumah subsidi, gedung apartemen vertikal, serta kawasan
              mansion dalam memenuhi kebutuhan papan seluruh penduduk negara.
            </p>
          </div>

          {/* STATUS KAPASITAS VS POPULASI CARD */}
          <div className="bg-[#031510]/80 backdrop-blur-md border-2 border-[#00FFAA]/40 rounded-2xl p-4 sm:p-5 flex items-center gap-4 min-w-[270px] shadow-lg">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00FFAA]/30 to-[#00FFAA]/5 border border-[#00FFAA]/50 flex items-center justify-center shrink-0">
              <Users className="w-7 h-7 text-[#00FFAA]" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-[#6B8A8A]">
                Kapasitas Daya Tampung
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#00FFAA]">
                  {housingStats.coveragePercent}%
                </span>
                <span className="text-xs font-bold text-gray-300">
                  ({formatNumber(housingStats.totalCap)} / {formatNumber(population)} Jiwa)
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
                    Surplus +{formatNumber(housingStats.deficitOrSurplus)} Jiwa
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    Defisit {formatNumber(Math.abs(housingStats.deficitOrSurplus))} Jiwa
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 2. SUB-STATS: BREAKDOWN TIAP TIPE HUNIAN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-[#00FFAA]/20">
          {housingStats.items.map((it) => {
            const Icon = it.icon;
            const isSelected = selectedCategory === it.category;
            return (
              <button
                key={it.key}
                onClick={() => setSelectedCategory(isSelected ? "all" : it.category)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? "bg-[#0F2E28] border-[#00FFAA] shadow-md shadow-[#00FFAA]/15 scale-[1.02]"
                    : "bg-[#061C17]/80 hover:bg-[#0A2620] border-[#00FFAA]/20 hover:border-[#00FFAA]/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${it.color}20`, color: it.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? "bg-[#00FFAA] text-black border-[#00FFAA]"
                        : "bg-black/30 text-gray-400 border-white/10"
                    }`}
                  >
                    {it.categoryLabel}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">
                  {it.label}
                </div>
                <div className="flex items-baseline justify-between mt-1.5">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-2xl font-black transition-colors"
                      style={{ color: isSelected ? "#00FFAA" : it.color }}
                    >
                      {formatNumber(it.count)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">unit</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#6B8A8A] block">Daya Tampung</span>
                    <span className="text-xs font-black text-gray-200">
                      {formatNumber(it.subtotalCapacity)} jiwa
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CONTROLS: FILTER CATEGORY & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0A1A1A] p-3 rounded-xl border border-[#00FFAA]/20">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {HOUSING_CONFIGS.map((cfg) => {
            const Icon = cfg.icon;
            const count = Number(countryDetail?.[cfg.key]) || 0;
            const isActive = selectedCategory === cfg.category;
            return (
              <button
                key={cfg.key}
                onClick={() => setSelectedCategory(cfg.category)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#00FFAA] text-[#0A1A1A] shadow-sm font-black"
                    : "bg-[#0F2424] text-[#A0C0C0] hover:text-[#00FFAA] border border-[#00FFAA]/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>
                  {cfg.label} ({formatNumber(count)})
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#6B8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari jenis hunian..."
            className="w-full bg-[#0F2424] border border-[#00FFAA]/20 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#E0E0E0] placeholder-[#6B8A8A] focus:outline-none focus:border-[#00FFAA]"
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
              className="bg-[#0A1A1A] rounded-2xl p-5 border border-[#00FFAA]/20 hover:border-[#00FFAA]/50 transition-all flex flex-col justify-between group shadow-lg"
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
                      <h3 className="text-sm font-bold text-white group-hover:text-[#00FFAA] transition-colors">
                        {item.label}
                      </h3>
                      <span className="text-[10px] text-[#6B8A8A] uppercase font-bold tracking-wider">
                        {item.categoryLabel}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#0F2424] text-[#00FFAA] border border-[#00FFAA]/30 shrink-0">
                    {sharePercent}% Porsi
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-4">{item.detailDesc}</p>

                {/* STATS HIGHLIGHT */}
                <div className="space-y-2 bg-[#0F2424] p-3 rounded-xl border border-[#00FFAA]/15">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B8A8A] font-semibold">Jumlah Bangunan</span>
                    <span className="font-black text-white text-sm">
                      {formatNumber(item.count)} Unit
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B8A8A] font-semibold">Daya Tampung / Unit</span>
                    <span className="font-bold text-[#00FFAA]">
                      {formatNumber(item.effectiveCap)} Jiwa/Unit
                      {housingBonusPercent > 0 && (
                        <span className="text-[10px] text-emerald-400 ml-1">
                          (+{housingBonusPercent}%)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#00FFAA]/10">
                    <span className="text-[#6B8A8A] font-semibold">Total Kapasitas</span>
                    <span className="font-black text-emerald-400 text-sm">
                      {formatNumber(item.subtotalCapacity)} Jiwa
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#00FFAA]/10 flex items-center justify-between text-[11px]">
                <span className="text-[#6B8A8A] font-medium">Status Ketersediaan</span>
                <span
                  className={`font-black flex items-center gap-1 ${
                    item.count > 0 ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {item.count > 0 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tersedia Aktif
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Belum Dibangun
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
