"use client";

import React, { useState, useMemo } from "react";
import { X, Zap, TrendingUp, TrendingDown, Building2, Home, Factory, Search, Shield, Activity } from "lucide-react";
import { getKelistrikanFuelRequirements } from "../../5_pembangunan/1_produksi/requirements_logic/1_produksi/1_kelistrikan/fuelLogic";
import { getMaterialStock } from "../../5_pembangunan/build_logic/build_logic";
import { getCountryConsumptionBreakdown } from "./consumptionLogic";

interface CountryKelistrikanModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryData: any;
  metadata?: Record<string, any>;
  isUserCountry?: boolean;
}

const SOURCE_ORDER = [
  "pembangkit_listrik_tenaga_nuklir",
  "pembangkit_listrik_tenaga_air",
  "pembangkit_listrik_tenaga_surya",
  "pembangkit_listrik_tenaga_uap",
  "pembangkit_listrik_tenaga_gas",
  "pembangkit_listrik_tenaga_angin"
];

export default function CountryKelistrikanModal({
  isOpen,
  onClose,
  countryData,
  metadata = {},
  isUserCountry = false,
}: CountryKelistrikanModalProps) {
  const [activeTab, setActiveTab] = useState<"semua" | "produksi" | "tempat_umum" | "hunian" | "pertahanan">("semua");
  const [searchQuery, setSearchQuery] = useState("");

  const countryName = countryData?.name_id || countryData?.name || countryData?.country || "Negara";

  const findMeta = (key: string) => {
    if (!metadata) return undefined;
    if (metadata[key]) return metadata[key];
    for (const k of Object.keys(metadata)) {
      const entry = metadata[k];
      if (!entry) continue;
      if (entry.dataKey === key) return entry;
      if (k.endsWith(`_${key}`) || k === `1_${key}`) return entry;
    }
    return undefined;
  };

  // 1. GRID PEMBANGKIT (PRODUKSI)
  const powerSources = SOURCE_ORDER.map((key) => {
    const bMeta = findMeta(key);
    const count = Number(countryData?.[key]) || 0;
    const unitProduction = Number(bMeta?.produksi) || 0;

    let isFuelDeficit = false;
    if (count > 0) {
      const fuelReqs = getKelistrikanFuelRequirements(key);
      if (fuelReqs.length > 0) {
        for (const req of fuelReqs) {
          const stock = getMaterialStock(countryData, req.resourceKey);
          const totalNeeded = req.amount * count;
          if (stock < totalNeeded) {
            isFuelDeficit = true;
            break;
          }
        }
      }
    }

    const formatLabel = (k: string) => {
      const customLabels: Record<string, string> = {
        pembangkit_listrik_tenaga_nuklir: "PLT Nuklir (PLTN)",
        pembangkit_listrik_tenaga_air: "PLT Air (PLTA)",
        pembangkit_listrik_tenaga_surya: "PLT Surya (PLTS)",
        pembangkit_listrik_tenaga_uap: "PLT Uap (PLTU)",
        pembangkit_listrik_tenaga_gas: "PLT Gas (PLTG)",
        pembangkit_listrik_tenaga_angin: "PLT Angin (PLTB)",
      };
      return customLabels[k] || k.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
    };

    return {
      key,
      label: formatLabel(key),
      count,
      unitProduction,
      totalProduction: count * unitProduction,
      isFuelDeficit,
    };
  });

  const totalProductionMW = powerSources.reduce(
    (sum, source) => sum + (source.isFuelDeficit ? 0 : source.totalProduction),
    0
  );

  // 2. BREAKDOWN KONSUMSI LISTRIK
  const breakdown = useMemo(() => {
    return getCountryConsumptionBreakdown(countryData, metadata);
  }, [countryData, metadata]);

  const {
    hunianBreakdown,
    tempatUmumBreakdown,
    pertahananBreakdown,
    produksiBreakdown,
    totalHunianConsumption,
    totalTempatUmumConsumption,
    totalPertahananConsumption,
    totalProduksiConsumption,
    totalAllBreakdownConsumption,
  } = breakdown;

  const allItems = useMemo(() => {
    return [
      ...produksiBreakdown.map((i) => ({ ...i, category: "produksi" })),
      ...tempatUmumBreakdown.map((i) => ({ ...i, category: "tempat_umum" })),
      ...hunianBreakdown.map((i) => ({ ...i, category: "hunian" })),
      ...pertahananBreakdown.map((i) => ({ ...i, category: "pertahanan" })),
    ];
  }, [produksiBreakdown, tempatUmumBreakdown, hunianBreakdown, pertahananBreakdown]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchTab = activeTab === "semua" || item.category === activeTab;
      const matchQuery =
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sector.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchQuery && (item.count > 0 || item.total > 0);
    });
  }, [allItems, activeTab, searchQuery]);

  const totalConsumptionMW = totalAllBreakdownConsumption > 0 ? totalAllBreakdownConsumption : Math.round(totalProductionMW * 0.7);
  const nettoMW = totalProductionMW - totalConsumptionMW;

  if (!isOpen || !countryData) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424]/95 backdrop-blur-md border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                Grid Kelistrikan - {countryName}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">Data Sektor Listrik Nasional</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-4 lg:ml-8 pl-4 lg:pl-8 border-l border-[#00FFAA]/30">
            <div className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1 bg-[#0F2424] border border-[#00FFAA]/30 rounded-lg">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] lg:text-[11px] font-black text-emerald-400 uppercase tracking-wider">Produksi</span>
              <span className="text-[10px] lg:text-[11px] font-black text-emerald-400">{totalProductionMW.toLocaleString('id-ID')} MW</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1 bg-[#0F2424] border border-rose-500/30 rounded-lg">
              <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
              <span className="text-[10px] lg:text-[11px] font-black text-rose-400 uppercase tracking-wider">Konsumsi</span>
              <span className="text-[10px] lg:text-[11px] font-black text-rose-400">
                {totalConsumptionMW.toLocaleString('id-ID', { maximumFractionDigits: 2 })} MW
              </span>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 bg-[#0F2424] custom-scrollbar space-y-6">
          
          {/* SEKTOR PEMBANGKIT LISTRIK */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-[#00FFAA]" />
              <h3 className="text-base font-black text-[#00FFAA] uppercase tracking-wider">Kelistrikan</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {powerSources.map((source) => (
                <div
                  key={source.key}
                  className="relative rounded-2xl flex flex-col justify-between transition-all bg-[#0A1A1A] border border-[#00FFAA]/20 p-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <p className="text-[10px] font-black uppercase text-[#6B8A8A] tracking-wider leading-snug">
                        {source.label}
                      </p>
                    </div>
                    <p className="text-lg font-black text-[#E0E0E0] leading-none mt-1">
                      {source.count}
                    </p>
                  </div>

                  <div className="border-t border-[#00FFAA]/10 mt-3 pt-2 text-center min-h-[44px] flex flex-col justify-center">
                    <span className={`font-black text-xs sm:text-sm leading-tight break-words ${source.isFuelDeficit ? 'text-rose-400' : 'text-[#00FFAA]'}`}>
                      {source.isFuelDeficit ? '0 MW' : `${source.totalProduction.toLocaleString('id-ID')} MW`}
                    </span>
                    {source.isFuelDeficit && (
                      <span className="text-[8px] sm:text-[9px] font-bold text-rose-400 leading-tight">(bahan bakar defisit)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEKTOR RINCIAN KONSUMSI LISTRIK */}
          <div className="pt-4 border-t border-[#00FFAA]/20 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-rose-400" />
              <h3 className="text-base font-black text-rose-400 uppercase tracking-wider">
                Rincian Konsumsi Listrik - {countryName}
              </h3>
            </div>

            {/* CARD SUMMARY GRID: ROW 1 (3 KARTU UTAMA) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Total Produksi Listrik */}
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Total Produksi Listrik</p>
                  </div>
                  <p className="text-base sm:text-lg font-black text-emerald-400 mt-1 break-words">
                    {totalProductionMW.toLocaleString("id-ID")} <span className="text-xs font-bold text-[#6B8A8A]">MW</span>
                  </p>
                </div>
                <p className="text-[9px] text-emerald-300/70 mt-1.5 font-medium">Pembangkit aktif</p>
              </div>

              {/* Total Konsumsi Terestimasi */}
              <div className="bg-rose-950/40 border border-rose-500/40 p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    <p className="text-[9px] font-black uppercase tracking-wider text-rose-400">Total Konsumsi Terestimasi</p>
                  </div>
                  <p className="text-base sm:text-lg font-black text-rose-400 mt-1 break-words">
                    {totalAllBreakdownConsumption.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-xs font-bold text-[#6B8A8A]">MW</span>
                  </p>
                </div>
                <p className="text-[9px] text-rose-300/70 mt-1.5 font-medium">Beban energi nasional</p>
              </div>

              {/* Total Netto Listrik */}
              <div className={`p-3.5 rounded-xl flex flex-col justify-between ${nettoMW >= 0 ? 'bg-cyan-950/40 border border-cyan-500/40' : 'bg-amber-950/40 border border-amber-500/40'}`}>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Activity className={`w-3.5 h-3.5 ${nettoMW >= 0 ? 'text-cyan-400' : 'text-amber-400'}`} />
                    <p className={`text-[9px] font-black uppercase tracking-wider ${nettoMW >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>Total Netto Listrik</p>
                  </div>
                  <p className={`text-base sm:text-lg font-black mt-1 break-words ${nettoMW >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                    {nettoMW >= 0 ? '+' : ''}{nettoMW.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-xs font-bold text-[#6B8A8A]">MW</span>
                  </p>
                </div>
                <p className={`text-[9px] mt-1.5 font-medium ${nettoMW >= 0 ? 'text-cyan-300/70' : 'text-amber-300/70'}`}>
                  {nettoMW >= 0 ? 'Surplus daya nasional' : 'Defisit daya nasional'}
                </p>
              </div>

            </div>

            {/* CARD SUMMARY GRID: ROW 2 (4 KARTU SEKTOR) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

              {/* Sektor Produksi & Industri */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Factory className="w-3.5 h-3.5 text-[#00FFAA]" />
                    <p className="text-[9px] font-black uppercase tracking-wider text-[#6B8A8A]">Produksi & Tambang</p>
                  </div>
                  <p className="text-base sm:text-lg font-black text-[#00FFAA]">
                    {totalProduksiConsumption.toLocaleString("id-ID", { maximumFractionDigits: 1 })} <span className="text-xs font-bold text-[#6B8A8A]">MW</span>
                  </p>
                </div>
                <p className="text-[9px] text-[#6B8A8A] mt-1.5 font-medium">{produksiBreakdown.filter(p => p.count > 0).length} jenis industri</p>
              </div>

              {/* Sektor Tempat Umum */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-[#00FFAA]" />
                    <p className="text-[9px] font-black uppercase tracking-wider text-[#6B8A8A]">Tempat Umum</p>
                  </div>
                  <p className="text-base sm:text-lg font-black text-[#00FFAA]">
                    {totalTempatUmumConsumption.toLocaleString("id-ID", { maximumFractionDigits: 1 })} <span className="text-xs font-bold text-[#6B8A8A]">MW</span>
                  </p>
                </div>
                <p className="text-[9px] text-[#6B8A8A] mt-1.5 font-medium">{tempatUmumBreakdown.filter(t => t.count > 0).length} fasilitas publik</p>
              </div>

              {/* Sektor Pertahanan & Keamanan */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Shield className="w-3.5 h-3.5 text-[#00FFAA]" />
                    <p className="text-[9px] font-black uppercase tracking-wider text-[#6B8A8A]">Pertahanan & Keamanan</p>
                  </div>
                  <p className="text-base sm:text-lg font-black text-[#00FFAA]">
                    {totalPertahananConsumption.toLocaleString("id-ID", { maximumFractionDigits: 1 })} <span className="text-xs font-bold text-[#6B8A8A]">MW</span>
                  </p>
                </div>
                <p className="text-[9px] text-[#6B8A8A] mt-1.5 font-medium">{pertahananBreakdown.filter(p => p.count > 0).length} pangkalan & infrastruktur</p>
              </div>

              {/* Sektor Hunian */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Home className="w-3.5 h-3.5 text-[#00FFAA]" />
                    <p className="text-[9px] font-black uppercase tracking-wider text-[#6B8A8A]">Hunian & Permukiman</p>
                  </div>
                  <p className="text-base sm:text-lg font-black text-[#00FFAA]">
                    {totalHunianConsumption.toLocaleString("id-ID", { maximumFractionDigits: 2 })} <span className="text-xs font-bold text-[#6B8A8A]">MW</span>
                  </p>
                </div>
                <p className="text-[9px] text-[#6B8A8A] mt-1.5 font-medium">Beban rumah tangga</p>
              </div>

            </div>

            {/* FILTER & SEARCH TABS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0A1A1A] p-2.5 rounded-xl border border-[#00FFAA]/20">
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveTab("semua")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "semua"
                      ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md"
                      : "bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#0F2424]/80"
                  }`}
                >
                  Semua Sektor
                </button>
                <button
                  onClick={() => setActiveTab("produksi")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "produksi"
                      ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md"
                      : "bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#0F2424]/80"
                  }`}
                >
                  Produksi
                </button>
                <button
                  onClick={() => setActiveTab("tempat_umum")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "tempat_umum"
                      ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md"
                      : "bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#0F2424]/80"
                  }`}
                >
                  Tempat Umum
                </button>
                <button
                  onClick={() => setActiveTab("pertahanan")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "pertahanan"
                      ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md"
                      : "bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#0F2424]/80"
                  }`}
                >
                  Pertahanan & Keamanan
                </button>
                <button
                  onClick={() => setActiveTab("hunian")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "hunian"
                      ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md"
                      : "bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#0F2424]/80"
                  }`}
                >
                  Hunian
                </button>
              </div>

              <div className="relative min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B8A8A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari fasilitas..."
                  className="w-full bg-[#0F2424] border border-[#00FFAA]/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#E0E0E0] placeholder-[#6B8A8A] focus:outline-none focus:border-[#00FFAA]"
                />
              </div>
            </div>

            {/* DAFTAR BREAKDOWN ITEM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div
                    key={`${item.category}-${item.key}`}
                    className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3.5 rounded-xl flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase text-[#6B8A8A] tracking-wider leading-tight">
                          {item.sector}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#0F2424] border border-[#00FFAA]/20 text-[#00FFAA] shrink-0">
                          {item.count.toLocaleString("id-ID")} unit
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-[#E0E0E0] uppercase tracking-wide leading-snug">
                        {item.label}
                      </h4>
                    </div>

                    <div className="border-t border-[#00FFAA]/10 mt-3 pt-2 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-[#6B8A8A]">Konsumsi / Unit:</p>
                        <p className="text-xs font-bold text-[#E0E0E0]">
                          {item.rate.toLocaleString("id-ID", { maximumFractionDigits: 4 })} MW
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-rose-400 font-bold">Total Beban:</p>
                        <p className="text-sm font-black text-rose-400">
                          {item.total.toLocaleString("id-ID", { maximumFractionDigits: 2 })} MW
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-[#0A1A1A] border border-[#00FFAA]/10 rounded-xl">
                  <p className="text-xs text-[#6B8A8A] font-bold uppercase tracking-wider">Tidak ada fasilitas yang sesuai kriteria pencarian.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

