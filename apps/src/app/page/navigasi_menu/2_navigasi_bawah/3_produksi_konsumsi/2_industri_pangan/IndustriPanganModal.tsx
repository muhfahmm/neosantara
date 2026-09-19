// IndustriPanganModal.tsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  X, Plus, Globe, User, Search, ChevronUp, ChevronDown, ChevronRight, ChevronDown as ChevronDownIcon, Utensils, Info,
  Beef, Wheat, Fish, Cookie, MessageSquare
} from "lucide-react";
import {
  FOOD_CONSUMPTION_PER_CAPITA,
  calculateProduction,
  calculateConsumption,
  calculateCountryFoodAggregate,
  calculateCountryFoodDetails
} from "./logic/produksiKonsumsiLogic";
import { PROFILES_POPULATION_DATA } from "@/../../json/semua_fitur_negara/0_profiles/index";

// 🔥 IMPOR MODAL DAN LOGIKA
import AISuggestModal from "./AI_suggest_modals";
import AIDetailDefisitModal from "./AI_detail_defisit";
import {
  SECTOR_MAP,
  generateSectorAnalysis,
  calculateDeficitRecommendation
} from "./logic/AI_suggestionsLogic";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail?: (detail: any) => void;
  metadata?: any;
  onGotoProduction?: (tab: string, key: string) => void;
  prefetchedAllCountries?: any[];
}

interface SortConfig {
  key: 'name' | 'population' | 'production' | 'consumption' | 'balance';
  direction: 'asc' | 'desc';
}

const safeNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.\-]/g, '');
    if (normalized === '' || normalized === '-' || normalized === '.') return 0;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatColoredNumber = (value: any, isPositive: boolean = true) => {
  const parsed = safeNumber(value);
  if (parsed === 0) return <span className="font-black text-[#8b7e66]">0</span>;
  const formatted = parsed.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  const parts = formatted.split(',');
  const mainColor = isPositive ? 'text-emerald-700' : 'text-rose-700';
  const sign = isPositive ? '+' : '-';
  if (parts.length === 1) return <span className={`font-black ${mainColor}`}>{sign}{parts[0]}</span>;
  return (<span className={`font-black ${mainColor}`}>{sign}{parts[0]}<span className="text-amber-500 font-bold">,{parts[1]}</span></span>);
};

const formatNumber = (value: any) => {
  const parsed = safeNumber(value);
  return Number.isFinite(parsed) ? parsed.toLocaleString('id-ID') : '0';
};

const normalizePopulationFromProfile = (country: any, profileMap: Map<string, number>) => {
  const directPopulation = safeNumber(country?.jumlah_penduduk ?? country?.population ?? country?.pop ?? country?.penduduk ?? country?.total_population);
  if (directPopulation > 0) return directPopulation;
  const rawName = country?.name_id || country?.name_en || country?.nama || country?.country || '';
  if (rawName) {
    const profilePopulation = profileMap.get(rawName.toLowerCase().trim());
    if (profilePopulation) return profilePopulation;
  }
  return 0;
};

export default function IndustriPanganModal({ isOpen, onClose, countryDetail, setCountryDetail, metadata, onGotoProduction, prefetchedAllCountries }: ModalProps) {
  const [activeTab, setActiveTab] = useState<"my" | "global">("my");
  const [allCountries, setAllCountries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'production', direction: 'desc' });
  const [expandedRows, setExpandedRows] = useState<'all' | Set<number>>('all');
  const [selectedCommodityInfo, setSelectedCommodityInfo] = useState<{ key: string; label: string; population: number; consumptionPerCapita: number; production: number; consumption: number; balance: number; } | null>(null);

  // 🔥 STATE UNTUK AI DETAIL DEFISIT
  const [aiSectorAnalysis, setAiSectorAnalysis] = useState<{ sectorId: string; sectorLabel: string; totalDeficit: number; totalSurplus: number; commodities: { key: string; label: string; balance: number; isDeficit: boolean; isSurplus: boolean; }[]; } | null>(null);
  const [deficitDetailData, setDeficitDetailData] = useState<any>(null);

  const profilePopulationMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const profile of PROFILES_POPULATION_DATA) {
      const key = (profile.name_id || profile.name_en || '').toLowerCase().trim();
      const population = safeNumber(profile.jumlah_penduduk);
      if (key && population > 0) map.set(key, population);
    }
    return map;
  }, []);

  useEffect(() => {
    if (isOpen && allCountries.length === 0) {
      if (prefetchedAllCountries && prefetchedAllCountries.length > 0) {
        setAllCountries(prefetchedAllCountries);
        return;
      }
      (async () => {
        try {
          const res = await fetch('/api/country-data?all=true', { cache: 'no-store' });
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setAllCountries(data);
        } catch (error) { console.error('Error fetching all countries data:', error); }
      })();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const population = normalizePopulationFromProfile(countryDetail, profilePopulationMap);

  // --- HITUNG INDEKS KEPUASAN PANGAN ---
  const foodSatisfaction = useMemo(() => {
    if (!countryDetail || !metadata) return 50; // default
    const allKeys = Object.keys(FOOD_CONSUMPTION_PER_CAPITA);
    let totalRatio = 0;
    let count = 0;
    for (const key of allKeys) {
      const prod = calculateProduction(key, countryDetail, metadata);
      const cons = calculateConsumption(population, FOOD_CONSUMPTION_PER_CAPITA[key]);
      if (cons > 0) {
        const ratio = prod / cons;
        // Batasi rasio maksimal 2 agar tidak terlalu ekstrem
        totalRatio += Math.min(ratio, 2);
        count++;
      }
    }
    if (count === 0) return 50;
    const avgRatio = totalRatio / count;
    // petakan avgRatio dari 0..2 ke 1..100
    let score = (avgRatio / 2) * 100;
    score = Math.min(100, Math.max(1, Math.round(score)));
    return score;
  }, [countryDetail, metadata, population]);

  // Simpan indeks ke countryDetail agar bisa diakses dashboard
  useEffect(() => {
    if (setCountryDetail && countryDetail) {
      setCountryDetail({
        ...countryDetail,
        satisfaction: {
          ...(countryDetail?.satisfaction || {}),
          food: foodSatisfaction,
        }
      });
    }
  }, [foodSatisfaction]);

  const COMMODITY_PRODUCTION_TAB_MAP: Record<string, string> = {
    ayam_unggas: 'peternakan', sapi_potong: 'peternakan', sapi_perah: 'peternakan', domba_kambing: 'peternakan',
    padi: 'agrikultur', gandum: 'agrikultur', jagung: 'agrikultur', sayur: 'agrikultur', umbi: 'agrikultur', kedelai: 'agrikultur', kelapa_sawit: 'agrikultur', kopi: 'agrikultur', teh: 'agrikultur', kakao: 'agrikultur', tebu: 'agrikultur', karet: 'agrikultur',
    udang: 'perikanan', ikan: 'perikanan', mutiara: 'perikanan',
    air_mineral: 'olahan pangan', gula: 'olahan pangan', roti: 'olahan pangan', pengolahan_daging: 'olahan pangan', mie_instan: 'olahan pangan', minyak_goreng: 'olahan pangan', susu: 'olahan pangan',
  };

  const handleBuildClick = (buildingKey: string) => {
    const targetTab = COMMODITY_PRODUCTION_TAB_MAP[buildingKey];
    if (!onGotoProduction || !targetTab) return;
    onGotoProduction(targetTab, buildingKey);
  };

  const handleCommodityClick = (commodityKey: string) => {
    const targetTab = COMMODITY_PRODUCTION_TAB_MAP[commodityKey];
    if (!onGotoProduction || !targetTab) return;
    onGotoProduction(targetTab, commodityKey);
  };

  const handleDeficitClick = (commodityKey: string) => {
    const recommendation = calculateDeficitRecommendation(commodityKey, countryDetail, metadata, population);
    if (recommendation) {
      setDeficitDetailData(recommendation);
    }
  };

  const openCommodityInfo = (key: string, label: string, production: number, consumption: number, balance: number) => {
    setSelectedCommodityInfo({ key, label, population, consumptionPerCapita: FOOD_CONSUMPTION_PER_CAPITA[key] ?? 0, production, consumption, balance });
  };

  const analyzeSector = (sectorId: string) => {
    const result = generateSectorAnalysis(sectorId, countryDetail, metadata, population);
    if (result) setAiSectorAnalysis(result);
  };

  const toggleRow = (index: number) => {
    if (expandedRows === 'all') setExpandedRows(new Set([index]));
    else {
      const newSet = new Set(expandedRows);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      setExpandedRows(newSet);
    }
  };

  const userCountryName = (countryDetail?.name_id || countryDetail?.nama || countryDetail?.country || countryDetail?.name_en || '').toLowerCase().trim();

  const globalFoodData = allCountries.map((country, index) => {
    const { totalProduction, totalConsumption, balance } = calculateCountryFoodAggregate(country, metadata);
    const countryPopulation = normalizePopulationFromProfile(country, profilePopulationMap);
    let rawName = country?.name_id || country?.name_en || country?.nama || country?.country;
    if (!rawName && country?.__fileName) rawName = country.__fileName.replace(/^\d+_/, '').replace(/\.(ts|js|json)$/i, '').replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase());
    const countryName = rawName || 'Unknown';
    const isUser = Boolean(userCountryName && (countryName.toLowerCase().trim() === userCountryName || (country?.name_id && country.name_id.toLowerCase().trim() === userCountryName) || (country?.name_en && country.name_en.toLowerCase().trim() === userCountryName) || (country?.country && country.country.toLowerCase().trim() === userCountryName)));
    return { index: index + 1, name: countryName, population: countryPopulation, production: totalProduction, consumption: totalConsumption, balance, isUser, rawData: country };
  }).sort((a, b) => b.production - a.production);

  let sortedData = [...globalFoodData].sort((a, b) => {
    let aVal: any, bVal: any;
    switch (sortConfig.key) {
      case 'name': aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); break;
      case 'population': aVal = a.population; bVal = b.population; break;
      case 'production': aVal = a.production; bVal = b.production; break;
      case 'consumption': aVal = a.consumption; bVal = b.consumption; break;
      case 'balance': aVal = a.balance; bVal = b.balance; break;
      default: return 0;
    }
    if (sortConfig.direction === 'asc') return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    else return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
  });

  const filteredData = searchQuery.trim() === '' ? sortedData : sortedData.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSort = (column: SortConfig['key']) => {
    if (sortConfig.key === column) setSortConfig({ key: column, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    else setSortConfig({ key: column, direction: 'desc' });
  };

  const SortIndicator = ({ column }: { column: SortConfig['key'] }) => {
    if (sortConfig.key !== column) return <span className="text-[#8b7e66]/30 ml-1 text-xs">⇅</span>;
    if (sortConfig.direction === 'asc') return <ChevronUp className="h-3 w-3 ml-1 inline text-emerald-700" />;
    return <ChevronDown className="h-3 w-3 ml-1 inline text-emerald-700" />;
  };

  return (
    <>
      {/* 🔥 RENDER MODAL DETAIL DEFISIT */}
      <AIDetailDefisitModal
        isOpen={deficitDetailData !== null}
        onClose={() => setDeficitDetailData(null)}
        data={deficitDetailData}
        onGotoProduction={onGotoProduction}
      />

      <AISuggestModal
        isOpen={aiSectorAnalysis !== null}
        onClose={() => setAiSectorAnalysis(null)}
        sectorLabel={aiSectorAnalysis?.sectorLabel || ''}
        totalDeficit={aiSectorAnalysis?.totalDeficit || 0}
        totalSurplus={aiSectorAnalysis?.totalSurplus || 0}
        commodities={aiSectorAnalysis?.commodities || []}
        onCommodityClick={handleCommodityClick}
        onDeficitClick={handleDeficitClick}
      />

      {selectedCommodityInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/35 pointer-events-auto">
          <div className="w-full max-w-md bg-[#FAF6EE] border-4 border-[#C4B49C] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#C4B49C]/30 bg-[#e4dac3]/40">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#5c3c10]">Detail Food Konsumsi</h3>
                <p className="text-[10px] font-bold text-[#8b7e66] uppercase tracking-wider">{selectedCommodityInfo.label}</p>
              </div>
              <button onClick={() => setSelectedCommodityInfo(null)} className="p-2 rounded-lg border border-[#C4B49C] text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-[#5c3c10]">
              <div className="rounded-xl bg-[#f7f3e8] p-3 border border-[#C4B49C]/20">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-[#8b7e66]">Negara</span>
                  <span className="font-black text-[#5c3c10]">{countryDetail?.name_id || countryDetail?.name_en || countryDetail?.nama || countryDetail?.country || 'Negara'}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-[#8b7e66]">Populasi</span>
                  <span className="font-black text-[#5c3c10]">{formatNumber(selectedCommodityInfo.population)} Jiwa</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-emerald-50/80 p-3 border border-emerald-200/60">
                  <div className="text-[9px] font-bold text-emerald-800 uppercase tracking-tight">Produksi</div>
                  <div className="mt-1 font-black text-emerald-700">{formatColoredNumber(selectedCommodityInfo.production, true)}</div>
                </div>
                <div className="rounded-xl bg-rose-50/80 p-3 border border-rose-200/60">
                  <div className="text-[9px] font-bold text-rose-800 uppercase tracking-tight">Konsumsi</div>
                  <div className="mt-1 font-black text-rose-700">{formatColoredNumber(selectedCommodityInfo.consumption, false)}</div>
                </div>
              </div>
              <div className="rounded-xl bg-[#e4dac3]/25 p-3 border border-[#C4B49C]/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-[#8b7e66]">Konsumsi / Kapita</span>
                  <span className="font-black text-[#5c3c10]">{selectedCommodityInfo.consumptionPerCapita}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-[#8b7e66]">Perhitungan</span>
                  <span className="font-black text-[#5c3c10]">{formatNumber(selectedCommodityInfo.population)} × {selectedCommodityInfo.consumptionPerCapita}</span>
                </div>
                <div className="mt-2 flex justify-between items-center border-t border-[#C4B49C]/30 pt-2">
                  <span className="font-black uppercase tracking-wider text-[#5c3c10]">Netto</span>
                  <span className={`font-black ${selectedCommodityInfo.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {selectedCommodityInfo.balance >= 0 ? '+' : '-'}{formatColoredNumber(Math.abs(selectedCommodityInfo.balance), selectedCommodityInfo.balance >= 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />
          {/* HEADER */}
          <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#5c3c10]/10 rounded-xl border border-[#5c3c10]/20"><Utensils className="h-6 w-6 text-[#5c3c10]" /></div>
              <div><h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Industri Pangan & Konsumsi Masyarakat</h2><p className="text-xs text-[#8b7e66] mt-1">Neraca produksi dan kebutuhan pasokan makanan nasional</p></div>
            </div>
            <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* CONTENT */}
          <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 space-y-6 no-scrollbar">
            <div className="bg-[#e4dac3]/40 p-1 rounded-xl border border-[#C4B49C]/40 inline-flex mb-2 shadow-sm">
              <button onClick={() => setActiveTab("my")} className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "my" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20" : "text-[#8b7e66] hover:text-[#5c3c10]"}`}><User className="w-3.5 h-3.5 inline mr-2 -mt-0.5" /> Data Saya</button>
              <button onClick={() => setActiveTab("global")} className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "global" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20" : "text-[#8b7e66] hover:text-[#5c3c10]"}`}><Globe className="w-3.5 h-3.5 inline mr-2 -mt-0.5" /> Data Global ({allCountries.length || 207} Negara)</button>
            </div>
            {activeTab === "my" ? (
              <div className="space-y-6">
                {Object.entries(SECTOR_MAP).map(([sectorId, sectorData]) => {
                  const SectorIcon = sectorData.icon;
                  const sectorItems = sectorData.items.filter(key => FOOD_CONSUMPTION_PER_CAPITA[key] !== undefined);
                  if (sectorItems.length === 0) return null;
                  let deficitCount = 0; let surplusCount = 0;
                  sectorItems.forEach(key => { const prod = calculateProduction(key, countryDetail, metadata); const cons = calculateConsumption(population, FOOD_CONSUMPTION_PER_CAPITA[key]); if (prod - cons < 0) deficitCount++; else if (prod - cons > 0) surplusCount++; });
                  return (
                    <div key={sectorId} className="border-2 border-[#4a7a7a] rounded-2xl overflow-hidden shadow-md bg-white">
                      <div className="flex items-center justify-between px-6 py-3.5 bg-[#4a7a7a] border-b border-[#3d6868] text-white">
                        <div className="flex items-center gap-3"><div className="p-1 bg-white/20 rounded-lg"><SectorIcon className="w-5 h-5 text-white" /></div><h4 className="text-sm font-black uppercase tracking-wider">{sectorData.label} ({sectorItems.length} Komoditas)</h4></div>
                        <button onClick={() => analyzeSector(sectorId)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20 group cursor-pointer" title="Analisis AI untuk sektor ini"><div className="relative"><MessageSquare className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" /><span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-[#4a7a7a] ${deficitCount > 0 ? 'bg-rose-400 animate-pulse' : surplusCount > 0 ? 'bg-emerald-400' : 'bg-gray-400'}`} /></div><span className="text-[9px] font-bold uppercase tracking-wider text-white/80 group-hover:text-white">AI</span></button>
                      </div>
                      {/* Grid Items */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e6dcd0]">
                        {sectorItems.map((key) => {
                          const consumptionPerCapita = FOOD_CONSUMPTION_PER_CAPITA[key];
                          const production = calculateProduction(key, countryDetail, metadata);
                          const consumption = calculateConsumption(population, consumptionPerCapita);
                          const netBalance = production - consumption;
                          const label = metadata?.[key]?.label || key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
                          return (
                            <div key={key} className="bg-[#f7f3e8] p-3.5 flex flex-col gap-2 border-r border-[#C4B49C]/20 last:border-r-0">
                              <div className="flex items-center justify-between pb-1 border-b border-[#C4B49C]/20">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <button type="button" onClick={(e) => { e.stopPropagation(); openCommodityInfo(key, label, production, consumption, netBalance); }} title={`Detail konsumsi ${label}`} className="p-1 rounded-lg border border-[#C4B49C] bg-[#FAF6EE] text-[#5c3c10] hover:bg-[#e4dac3] transition-all cursor-pointer shrink-0"><Info className="w-3.5 h-3.5" /></button>
                                  <span className="text-xs font-black text-[#5c3c10] uppercase tracking-wider truncate">{label}</span>
                                </div>
                                {onGotoProduction && (<button onClick={() => handleBuildClick(key)} title={`Bangun ${label}`} className="p-1 rounded-lg bg-[#5c3c10] text-[#FAF6EE] hover:bg-[#8b7e66] transition-all cursor-pointer shadow-xs"><Plus className="w-3.5 h-3.5" /></button>)}
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between items-center bg-emerald-50/80 px-2 py-1 rounded-md border border-emerald-200/60"><span className="text-[9px] font-bold text-emerald-800 uppercase tracking-tight">Total Produksi</span>{formatColoredNumber(production, true)}</div>
                                <div className="flex justify-between items-center bg-rose-50/80 px-2 py-1 rounded-md border border-rose-200/60"><span className="text-[9px] font-bold text-rose-800 uppercase tracking-tight">Total Konsumsi</span>{formatColoredNumber(consumption, false)}</div>
                              </div>
                              <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-[#C4B49C]/30 mt-0.5"><span className="font-bold text-[#8b7e66] uppercase tracking-wider">Netto:</span>{formatColoredNumber(netBalance, netBalance >= 0)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* 🔥 INDEKS KEPUASAN PANGAN */}
                <div className="p-5 rounded-xl border-3 border-[#5c3c10]/40 bg-gradient-to-r from-amber-50 to-amber-100/70 shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-[#5c3c10] uppercase tracking-widest">
                      Indeks Kepuasan Rakyat (Pangan)
                    </span>
                    <span className="text-3xl font-black text-amber-700">
                      {foodSatisfaction} / 100
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-200"
                      style={{ width: `${foodSatisfaction}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-amber-700 font-bold mt-3">
                    {foodSatisfaction >= 80
                      ? "✅ Ketersediaan pangan mencukupi, rakyat sejahtera."
                      : foodSatisfaction >= 50
                        ? "⚠️ Ketersediaan pangan pas-pasan, perlu peningkatan produksi."
                        : "🔴 Defisit pangan parah, rakyat terancam kelaparan."}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-amber-800/80">
                    <div>Rata-rata rasio produksi/konsumsi: <span className="font-bold">
                      {(foodSatisfaction / 100 * 2).toFixed(2)}
                    </span></div>
                    <div>Populasi: <span className="font-bold">{formatNumber(population)} jiwa</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#e4dac3]/40 border-2 border-[#C4B49C]/50 flex justify-between items-center shadow-sm"><div className="flex items-center gap-2 text-[#5c3c10] font-black text-xs uppercase tracking-wider">👥 Total Populasi & Kebutuhan Pangan Harian</div><div className="px-4 py-1.5 rounded-lg bg-[#5c3c10] text-[#FAF6EE]"><span className="text-xs font-black tracking-wider">{formatNumber(population)} Jiwa</span></div></div>
              </div>
            ) : (
              <div className="bg-[#FAF6EE] border-2 border-[#C4B49C]/40 p-6 rounded-2xl shadow-sm w-full">
                <div className="flex items-center gap-3 mb-4"><div className="p-3 rounded-2xl bg-[#5c3c10]/10 text-[#5c3c10]"><Globe className="h-5 w-5" /></div><div><h3 className="text-lg font-black text-[#5c3c10] uppercase tracking-wide">Neraca Pangan {allCountries.length || 207} Negara</h3><p className="text-[10px] text-[#8b7e66] uppercase tracking-wider">Klik nama negara untuk melihat rincian 26 komoditas.</p></div></div>
                <div className="mb-4 relative"><Search className="absolute left-3 top-3 h-4 w-4 text-[#8b7e66] pointer-events-none" /><input type="text" placeholder="Cari nama negara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-[#C4B49C]/40 bg-[#FAF6EE] text-[#5c3c10] placeholder-[#8b7e66] focus:outline-none focus:border-[#5c3c10] focus:ring-2 focus:ring-[#5c3c10]/20 transition-all font-semibold text-sm" />{searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-[#8b7e66] hover:text-[#5c3c10] transition-colors">✕</button>}</div>
                <div className="border border-[#C4B49C]/30 rounded-xl bg-[#FAF6EE]/50 shadow-sm"><table className="w-full text-xs"><thead className="bg-[#5c3c10]/5 border-b-2 border-[#C4B49C]/30"><tr><th className="px-4 py-3 text-left font-black text-[#5c3c10] uppercase tracking-wider w-12">No</th><th onClick={() => handleSort('name')} className="px-4 py-3 text-left font-black text-[#5c3c10] uppercase tracking-wider cursor-pointer hover:bg-[#5c3c10]/10 transition-colors">Negara <SortIndicator column="name" /></th><th onClick={() => handleSort('population')} className="px-4 py-3 text-right font-black text-[#5c3c10] uppercase tracking-wider cursor-pointer hover:bg-[#5c3c10]/10 transition-colors">Populasi <SortIndicator column="population" /></th><th onClick={() => handleSort('production')} className="px-4 py-3 text-right font-black text-emerald-700 uppercase tracking-wider cursor-pointer hover:bg-emerald-700/10 transition-colors">Prod. Pangan <SortIndicator column="production" /></th><th onClick={() => handleSort('consumption')} className="px-4 py-3 text-right font-black text-rose-700 uppercase tracking-wider cursor-pointer hover:bg-rose-700/10 transition-colors">Kons. Pangan <SortIndicator column="consumption" /></th><th onClick={() => handleSort('balance')} className="px-4 py-3 text-right font-black text-[#5c3c10] uppercase tracking-wider cursor-pointer hover:bg-[#5c3c10]/10 transition-colors">Neraca Pangan <SortIndicator column="balance" /></th></tr></thead><tbody className="divide-y divide-[#C4B49C]/20">
                  {allCountries.length === 0 ? <tr><td colSpan={6} className="px-4 py-6 text-center text-xs font-bold text-[#8b7e66]">📡 Memuat data 207 negara...</td></tr> : filteredData.length > 0 ? filteredData.map((country, rowIndex) => {
                    const isUserCountry = country.isUser; const isExpanded = expandedRows === 'all' || (expandedRows instanceof Set && expandedRows.has(country.index)); const details = calculateCountryFoodDetails(country.rawData, metadata);
                    return (<React.Fragment key={`country-${country.index}`}><tr className={`transition-colors cursor-pointer hover:brightness-95 ${isUserCountry ? 'bg-emerald-100/80 font-black border-l-4 border-l-emerald-600' : rowIndex % 2 === 0 ? 'bg-[#FAF6EE]' : 'bg-[#e4dac3]/10'}`} onClick={() => toggleRow(country.index)}><td className={`px-4 py-3 font-bold ${isUserCountry ? 'text-emerald-900 font-black' : 'text-[#8b7e66]'}`}>{country.index}</td><td className={`px-4 py-3 font-bold ${isUserCountry ? 'text-emerald-900 font-black flex items-center gap-2' : 'text-[#5c3c10] flex items-center gap-2'}`}><span>{country.name}</span>{isUserCountry && <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">Negara Anda</span>}<span className="ml-auto text-[#5c3c10] opacity-80 hover:opacity-100 transition-opacity">{isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</span></td><td className="px-4 py-3 font-bold text-[#5c3c10] text-right">{formatNumber(country.population)}</td><td className="px-4 py-3 font-bold text-emerald-700 text-right">{formatNumber(country.production)}</td><td className="px-4 py-3 font-bold text-rose-700 text-right">{formatNumber(country.consumption)}</td><td className={`px-4 py-3 font-black text-right ${country.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{country.balance >= 0 ? '+' : '-'}{formatNumber(Math.abs(country.balance))}</td></tr>{isExpanded && (<tr><td colSpan={6} className="p-0 bg-[#FAF6EE] border-b-2 border-[#C4B49C]/20"><div className="p-6 max-h-[50vh] overflow-y-auto"><div className="space-y-4">{Object.entries(SECTOR_MAP).map(([sectorId, sectorData]) => { const sectorItems = sectorData.items.map(key => details.find(d => d.key === key)).filter(Boolean) as any[]; if (sectorItems.length === 0) return null; return (<div key={sectorId} className="border border-[#C4B49C]/30 rounded-xl overflow-hidden shadow-sm bg-white"><div className="bg-[#4a7a7a] text-white px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider"><sectorData.icon className="w-4 h-4" />{sectorData.label} ({sectorItems.length} Komoditas)</div><div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[#e6dcd0]">{sectorItems.map((item: any) => (<div key={item.key} className="bg-[#f7f3e8] p-3 flex flex-col gap-1 border-r border-[#C4B49C]/20 last:border-r-0 text-[10px]"><span className="font-black text-[#5c3c10] uppercase tracking-tight">{item.label}</span><div className="flex justify-between"><span className="text-[#8b7e66]">Produksi:</span>{formatColoredNumber(item.production, true)}</div><div className="flex justify-between"><span className="text-[#8b7e66]">Konsumsi:</span>{formatColoredNumber(item.consumption, false)}</div><div className="flex justify-between border-t border-[#C4B49C]/20 mt-1 pt-1"><span className="font-black text-[#5c3c10]">Netto:</span>{formatColoredNumber(item.balance, item.balance >= 0)}</div></div>))}</div></div>); })}</div></div></td></tr>)}</React.Fragment>);
                  }) : <tr><td colSpan={6} className="px-4 py-6 text-center text-xs font-bold text-[#8b7e66]">{searchQuery ? `Tidak ada negara yang cocok dengan "${searchQuery}"` : 'Tidak ada data tersedia'}</td></tr>}</tbody></table></div>
                {filteredData.length > 0 && (<div className="mt-4 p-4 bg-[#e4dac3]/20 border border-[#C4B49C]/30 rounded-lg text-xs text-[#8b7e66]"><p className="font-bold">📊 Total: {filteredData.length} negara {searchQuery && `(difilter dari ${globalFoodData.length})`}</p><p className="mt-1">Total Produksi Pangan: <span className="font-black text-emerald-700">{formatNumber(filteredData.reduce((sum, c) => sum + safeNumber(c.production), 0))}</span></p><p>Total Konsumsi Pangan: <span className="font-black text-rose-700">{formatNumber(filteredData.reduce((sum, c) => sum + safeNumber(c.consumption), 0))}</span></p></div>)}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}