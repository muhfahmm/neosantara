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

interface SubCategoryFood {
  id: "all" | "peternakan" | "agrikultur" | "perikanan" | "olahan_pangan";
  title: string;
  icon: React.ElementType;
  description: string;
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
    title: "Peternakan",
    icon: ShoppingBag,
    description: "Sentra pembiakan ternak ruminansia dan unggas nasional",
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
    title: "Agrikultur",
    icon: Wheat,
    description: "Lahan komoditas pangan pokok, palawija, dan perkebunan",
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
    title: "Perikanan",
    icon: Fish,
    description: "Sentra budidaya tambak perikanan laut & air tawar",
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
    title: "Olahan Pangan",
    icon: Apple,
    description: "Pabrik pengolahan bahan mentah pangan menjadi bahan pokok siap konsumsi",
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
  metadata,
}: ProduksiPanganSectionProps) {
  const [selectedSubCat, setSelectedSubCat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getBuildingValue = (key: string): number => {
    if (!countryDetail) return 0;
    if (countryDetail[key] !== undefined && countryDetail[key] !== null) {
      const v = Number(countryDetail[key]);
      if (!Number.isNaN(v)) return v;
    }
    return 0;
  };

  // Hitung jumlah bangunan tiap sub-kategori
  const stats = useMemo(() => {
    const subCatCounts: Record<string, number> = {
      peternakan: 0,
      agrikultur: 0,
      perikanan: 0,
      olahan_pangan: 0,
    };

    FOOD_SUB_CATEGORIES.forEach((cat) => {
      const sum = cat.items.reduce((acc, it) => acc + getBuildingValue(it.key), 0);
      subCatCounts[cat.id] = sum;
    });

    const totalAll = Object.values(subCatCounts).reduce((acc, v) => acc + v, 0);

    return {
      subCatCounts,
      totalAll,
    };
  }, [countryDetail]);

  // Filter items sesuai sub-kategori aktif dan input pencarian
  const displayedItems = useMemo(() => {
    let list = ALL_FOOD_ITEMS;
    if (selectedSubCat !== "all") {
      list = list.filter((it) => it.subCatId === selectedSubCat);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((it) => it.label.toLowerCase().includes(q) || it.key.toLowerCase().includes(q));
    }
    return list;
  }, [selectedSubCat, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. HERO TOTAL PRODUKSI PANGAN GABUNGAN */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B3A2C] via-[#082820] to-[#041612] p-5 sm:p-7 border border-[#00FFAA]/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#00FFAA]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFAA]/15 border border-[#00FFAA]/30 text-[#00FFAA] text-xs font-black tracking-wider uppercase">
              <Apple className="w-3.5 h-3.5" />
              <span>Sektor Pangan Nasional Terpadu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Produksi & Ketahanan Pangan
            </h1>
            <p className="text-xs sm:text-sm text-[#A0D4C2] leading-relaxed">
              Integrasi menyeluruh 4 sub-sektor strategis ketahanan pangan: Peternakan, Agrikultur,
              Perikanan, dan Olahan Pangan dari seluruh fasilitas produksi nasional.
            </p>
          </div>

          {/* TOTAL GABUNGAN CARD */}
          <div className="bg-[#031510]/80 backdrop-blur-md border-2 border-[#00FFAA]/40 rounded-2xl p-4 sm:p-5 flex items-center gap-4 min-w-[260px] shadow-lg">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00FFAA]/30 to-[#00FFAA]/5 border border-[#00FFAA]/50 flex items-center justify-center shrink-0">
              <Warehouse className="w-7 h-7 text-[#00FFAA]" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-[#6B8A8A]">
                Total Fasilitas Pangan
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#00FFAA]">
                  {formatNumber(stats.totalAll)}
                </span>
                <span className="text-xs font-bold text-gray-300">Unit / Fasilitas</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                27 Jenis Komoditas Aktif
              </span>
            </div>
          </div>
        </div>

        {/* 2. SUB-CARDS 4 SEKTOR PANGAN (TOTAL PER SEKTOR) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#00FFAA]/20">
          {FOOD_SUB_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = stats.subCatCounts[cat.id] ?? 0;
            const isSelected = selectedSubCat === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedSubCat(isSelected ? "all" : cat.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? "bg-[#0F2E28] border-[#00FFAA] shadow-md shadow-[#00FFAA]/15 scale-[1.02]"
                    : "bg-[#061C17]/80 hover:bg-[#0A2620] border-[#00FFAA]/20 hover:border-[#00FFAA]/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
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
                    {isSelected ? "Dipilih" : `${cat.items.length} item`}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">
                  {cat.title}
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    className="text-xl sm:text-2xl font-black transition-colors"
                    style={{ color: isSelected ? "#00FFAA" : cat.color }}
                  >
                    {formatNumber(count)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">unit</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CONTROLS: SUB-CATEGORY SELECTOR & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0A1A1A] p-3 rounded-xl border border-[#00FFAA]/20">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedSubCat("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedSubCat === "all"
                ? "bg-[#00FFAA] text-[#0A1A1A] shadow-sm font-black"
                : "bg-[#0F2424] text-[#A0C0C0] hover:text-[#00FFAA] border border-[#00FFAA]/20"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua Sub-Sektor ({formatNumber(stats.totalAll)})</span>
          </button>

          {FOOD_SUB_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = stats.subCatCounts[cat.id] ?? 0;
            const isActive = selectedSubCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedSubCat(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#00FFAA] text-[#0A1A1A] shadow-sm font-black"
                    : "bg-[#0F2424] text-[#A0C0C0] hover:text-[#00FFAA] border border-[#00FFAA]/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>
                  {cat.title} ({formatNumber(count)})
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
            placeholder="Cari komoditas pangan..."
            className="w-full bg-[#0F2424] border border-[#00FFAA]/20 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#E0E0E0] placeholder-[#6B8A8A] focus:outline-none focus:border-[#00FFAA]"
          />
        </div>
      </div>

      {/* 4. GRID DETAIL FASILITAS & KOMODITAS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#00FFAA] flex items-center gap-2">
            <span>Daftar Fasilitas & Kapasitas Produksi ({displayedItems.length} Komoditas)</span>
          </h2>
          <span className="text-[11px] text-gray-400">
            Sumber Data: Sensus Pembangunan Terverifikasi
          </span>
        </div>

        {displayedItems.length === 0 ? (
          <div className="p-8 text-center bg-[#0A1A1A] rounded-xl border border-dashed border-[#00FFAA]/20">
            <Apple className="w-8 h-8 text-[#6B8A8A] mx-auto mb-2 opacity-50" />
            <p className="text-xs text-gray-400">Tidak ada komoditas pangan yang sesuai dengan filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {displayedItems.map((item) => {
              const val = getBuildingValue(item.key);
              const parentSubCat = FOOD_SUB_CATEGORIES.find((c) => c.id === item.subCatId);
              const Icon = parentSubCat?.icon || Apple;

              return (
                <div
                  key={item.key}
                  className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20 hover:border-[#00FFAA]/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-[#00FFAA]/10 hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${parentSubCat?.color || "#00FFAA"}20`,
                            color: parentSubCat?.color || "#00FFAA",
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white group-hover:text-[#00FFAA] transition-colors leading-tight line-clamp-1">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#0F2424] text-[#A0C0C0] border border-[#00FFAA]/20 shrink-0">
                        {parentSubCat?.title}
                      </span>
                    </div>

                    <div className="bg-[#0F2424] p-2.5 rounded-lg border border-[#00FFAA]/10 mt-2">
                      <span className="text-[10px] text-[#6B8A8A] font-semibold block uppercase tracking-wider">
                        Jumlah Fasilitas Bangunan
                      </span>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <span className="text-xl font-black text-white group-hover:text-[#00FFAA] transition-colors">
                          {formatNumber(val)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          {item.unitSuffix}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#00FFAA]/10 flex items-center justify-between text-[10px]">
                    <span className="text-[#6B8A8A] font-medium">Status Produksi</span>
                    <span
                      className={`font-black flex items-center gap-1 ${
                        val > 0 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {val > 0 ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Operasional Aktif
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          Belum Dibangun
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
