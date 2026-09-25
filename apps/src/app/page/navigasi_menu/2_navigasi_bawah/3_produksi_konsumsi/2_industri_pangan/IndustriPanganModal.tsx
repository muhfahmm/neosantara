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
  if (parsed === 0) return <span className="font-black text-[#6B8A8A]">0</span>;
  const absValue = Math.abs(parsed);
  const formatted = absValue.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  const mainColor = isPositive ? 'text-emerald-400' : 'text-rose-400';
  const sign = isPositive ? '+' : '-';
  return <span className={`font-black ${mainColor}`}>{sign}{formatted}</span>;
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
    air_mineral: 'olahan pangan', gula: 'olahan pangan', roti: 'olahan pangan', pengolahan_daging: 'olahan pangan', mie_instan: 'olahan pangan', minyak_goreng: 'olahan pangan', susu: 'olahan pangan', beras: 'olahan pangan',
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
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
          <div className="w-full max-w-md bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#00FFAA]/20 bg-[#0A1A1A]">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#00FFAA]">Detail Food Konsumsi</h3>
                <p className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider">{selectedCommodityInfo.label}</p>
              </div>
              <button onClick={() => setSelectedCommodityInfo(null)} className="p-2 rounded-lg border border-[#00FFAA]/30 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-[#E0E0E0]">
              <div className="rounded-xl bg-[#0A1A1A] p-3 border border-[#00FFAA]/20">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-[#6B8A8A]">Negara</span>
                  <span className="font-black text-[#E0E0E0]">{countryDetail?.name_id || countryDetail?.name_en || countryDetail?.nama || countryDetail?.country || 'Negara'}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-[#6B8A8A]">Populasi</span>
                  <span className="font-black text-[#00FFAA]">{formatNumber(selectedCommodityInfo.population)} Jiwa</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-emerald-950/40 p-3 border border-emerald-500/30">
                  <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight">Produksi</div>
                  <div className="mt-1 font-black text-emerald-400">{formatColoredNumber(selectedCommodityInfo.production, true)}</div>
                </div>
                <div className="rounded-xl bg-rose-950/40 p-3 border border-rose-500/30">
                  <div className="text-[9px] font-bold text-rose-400 uppercase tracking-tight">Konsumsi</div>
                  <div className="mt-1 font-black text-rose-400">{formatColoredNumber(selectedCommodityInfo.consumption, false)}</div>
                </div>
              </div>
              <div className="rounded-xl bg-[#0A1A1A] p-3 border border-[#00FFAA]/20">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-[#6B8A8A]">Konsumsi / Kapita</span>
                  <span className="font-black text-[#E0E0E0]">{selectedCommodityInfo.consumptionPerCapita}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-[#6B8A8A]">Perhitungan</span>
                  <span className="font-black text-[#E0E0E0]">{formatNumber(selectedCommodityInfo.population)} × {selectedCommodityInfo.consumptionPerCapita}</span>
                </div>
                <div className="mt-2 flex justify-between items-center border-t border-[#00FFAA]/20 pt-2">
                  <span className="font-black uppercase tracking-wider text-[#E0E0E0]">Netto</span>
                  {formatColoredNumber(selectedCommodityInfo.balance, selectedCommodityInfo.balance >= 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
          {/* HEADER */}
          <div className="px-4 lg:px-6 2xl:px-8 py-3.5 lg:py-4.5 2xl:py-6 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10">
            <div className="flex items-center gap-2.5 lg:gap-3">
              <div className="p-1.5 lg:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30"><Utensils className="h-4 w-4 lg:h-5 lg:w-5 2xl:h-6 2xl:w-6 text-[#00FFAA]" /></div>
              <div><h2 className="text-base lg:text-xl 2xl:text-2xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Industri Pangan & Konsumsi Masyarakat</h2></div>
            </div>
            <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* CONTENT */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 lg:p-5 2xl:p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
            <div className="space-y-3.5 lg:space-y-4.5 2xl:space-y-6">
                {Object.entries(SECTOR_MAP).map(([sectorId, sectorData]) => {
                  const SectorIcon = sectorData.icon;
                  const sectorItems = sectorData.items.filter(key => FOOD_CONSUMPTION_PER_CAPITA[key] !== undefined);
                  if (sectorItems.length === 0) return null;
                  let deficitCount = 0; let surplusCount = 0;
                  sectorItems.forEach(key => { const prod = calculateProduction(key, countryDetail, metadata); const cons = calculateConsumption(population, FOOD_CONSUMPTION_PER_CAPITA[key]); if (prod - cons < 0) deficitCount++; else if (prod - cons > 0) surplusCount++; });
                  return (
                    <div key={sectorId} className="border border-[#00FFAA]/20 rounded-xl 2xl:rounded-2xl overflow-hidden bg-[#0A1A1A]">
                      <div className="flex items-center justify-between px-3.5 lg:px-4.5 2xl:px-6 py-2 lg:py-2.5 2xl:py-3.5 bg-[#0A1A1A] border-b border-[#00FFAA]/20 text-[#00FFAA]">
                        <div className="flex items-center gap-2 lg:gap-3"><div className="p-1 lg:p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/30"><SectorIcon className="w-4 h-4 lg:w-4.5 lg:w-4.5 2xl:w-5 2xl:h-5 text-[#00FFAA]" /></div><h4 className="text-xs lg:text-xs 2xl:text-sm font-black uppercase tracking-wider text-[#00FFAA]">{sectorData.label} ({sectorItems.length} Komoditas)</h4></div>
                        <button onClick={() => analyzeSector(sectorId)} className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full bg-[#00FFAA]/10 hover:bg-[#00FFAA]/20 transition-colors border border-[#00FFAA]/30 group cursor-pointer" title="Analisis AI untuk sektor ini"><div className="relative"><MessageSquare className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#00FFAA] group-hover:scale-110 transition-transform" /><span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${deficitCount > 0 ? 'bg-rose-400 animate-pulse' : surplusCount > 0 ? 'bg-emerald-400' : 'bg-gray-400'}`} /></div><span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-wider text-[#00FFAA]">AI</span></button>
                      </div>
                      {/* Grid Items */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 lg:gap-2 p-2 lg:p-2.5 2xl:p-3 bg-[#0F2424]">
                        {sectorItems.map((key) => {
                          const consumptionPerCapita = FOOD_CONSUMPTION_PER_CAPITA[key];
                          const production = calculateProduction(key, countryDetail, metadata);
                          const consumption = calculateConsumption(population, consumptionPerCapita);
                          const netBalance = production - consumption;
                          const label = metadata?.[key]?.label || key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
                          return (
                            <div key={key} className="bg-[#0A1A1A] p-2 lg:p-2.5 2xl:p-3.5 flex flex-col justify-between gap-1.5 lg:gap-2 rounded-lg 2xl:rounded-xl border border-[#00FFAA]/20">
                              <div className="flex items-center justify-between pb-1 border-b border-[#00FFAA]/10 gap-1 min-h-[28px] lg:min-h-[30px] 2xl:min-h-[34px]">
                                <div className="flex items-center gap-1 lg:gap-1.5 min-w-0 flex-1 pr-0.5">
                                  <button type="button" onClick={(e) => { e.stopPropagation(); openCommodityInfo(key, label, production, consumption, netBalance); }} title={`Detail konsumsi ${label}`} className="p-0.5 lg:p-1 rounded-md lg:rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer shrink-0"><Info className="w-3 h-3 lg:w-3.5 lg:h-3.5" /></button>
                                  <span className="text-[8px] lg:text-[9px] 2xl:text-[10.5px] font-black text-[#E0E0E0] uppercase tracking-tight leading-tight whitespace-normal break-words">{label}</span>
                                </div>
                                {onGotoProduction && (<button onClick={() => handleBuildClick(key)} title={`Bangun ${label}`} className="p-0.5 lg:p-1 rounded-md lg:rounded-lg bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 transition-all cursor-pointer shrink-0"><Plus className="w-3 h-3 lg:w-3.5 lg:h-3.5 font-bold" /></button>)}
                              </div>
                              <div className="space-y-1 text-[10px] lg:text-xs">
                                <div className="flex justify-between items-center bg-emerald-950/40 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md border border-emerald-500/30"><span className="text-[8px] lg:text-[9px] font-bold text-emerald-400 uppercase tracking-tight">Total Produksi</span>{formatColoredNumber(production, true)}</div>
                                <div className="flex justify-between items-center bg-rose-950/40 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md border border-rose-500/30"><span className="text-[8px] lg:text-[9px] font-bold text-rose-400 uppercase tracking-tight">Total Konsumsi</span>{formatColoredNumber(consumption, false)}</div>
                              </div>
                              <div className="flex justify-between items-center text-[9px] lg:text-[10px] pt-1 border-t border-[#00FFAA]/10 mt-0.5"><span className="font-bold text-[#6B8A8A] uppercase tracking-wider">Netto:</span>{formatColoredNumber(netBalance, netBalance >= 0)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* INDEKS KEPUASAN PANGAN */}
                <div className="p-3.5 lg:p-4 2xl:p-5 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs lg:text-xs 2xl:text-sm font-black text-[#00FFAA] uppercase tracking-widest">
                      Indeks Kepuasan Rakyat (Pangan)
                    </span>
                    <span className="text-xl lg:text-2xl 2xl:text-3xl font-black text-[#00FFAA]">
                      {foodSatisfaction} / 100
                    </span>
                  </div>
                  <div className="w-full h-2.5 lg:h-3 bg-[#0F2424] rounded-full mt-2 lg:mt-3 overflow-hidden border border-[#00FFAA]/20">
                    <div
                      className="h-full rounded-full bg-[#00FFAA] transition-all duration-200"
                      style={{ width: `${foodSatisfaction}%` }}
                    />
                  </div>
                  <p className="text-[9px] lg:text-[10px] text-[#00FFAA] font-bold mt-2 lg:mt-3">
                    {foodSatisfaction >= 80
                      ? "✅ Ketersediaan pangan mencukupi, rakyat sejahtera."
                      : foodSatisfaction >= 50
                        ? "⚠️ Ketersediaan pangan pas-pasan, perlu peningkatan produksi."
                        : "🔴 Defisit pangan parah, rakyat terancam kelaparan."}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[9px] lg:text-[10px] text-[#6B8A8A]">
                    <div>Rata-rata rasio produksi/konsumsi: <span className="font-bold text-[#00FFAA]">
                      {(foodSatisfaction / 100 * 2).toFixed(2)}
                    </span></div>
                    <div>Populasi: <span className="font-bold text-[#00FFAA]">{formatNumber(population)} jiwa</span></div>
                  </div>
                </div>

                <div className="p-3 lg:p-3.5 2xl:p-4 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20 flex justify-between items-center"><div className="flex items-center gap-2 text-[#00FFAA] font-black text-[10px] lg:text-xs uppercase tracking-wider">👥 Total Populasi & Kebutuhan Pangan Harian</div><div className="px-3 lg:px-4 py-1 lg:py-1.5 rounded-lg bg-[#00FFAA] text-[#0A1A1A]"><span className="text-[10px] lg:text-xs font-black tracking-wider">{formatNumber(population)} Jiwa</span></div></div>
              </div>
          </div>
        </div>
      </div>
    </>
  );
}