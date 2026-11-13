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
import { getProductionBonusMultiplier } from "../../../../bonus_logic";
import { getIslamProductionMultiplier } from "../../../../bonus_logic/agama_bonus_logic/islam";
import { getShintoElectricityProductionMultiplier } from "../../../../bonus_logic/agama_bonus_logic/shinto";
import { getCommunismProductionMultiplier, COMMUNISM_PRODUCTION_BONUS } from "../../../../bonus_logic/ideologi_bonus_logic/komunisme";
import { isMemberOfFAO, FAO_BONUS_RESOURCES } from "../../../../bonus_logic/organisasi_bonus_logic/organisasi_pbb/fao";
import { applyNpcCountrySimulationState } from "@/app/logic/npc_country_simulation/npcCountrySimulation";
import { calculatePanganScore } from "@/app/logic/kepuasanCalculator";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";

import AISuggestModal from "./AI_suggest_modals";
import AIDetailDefisitModal from "./AI_detail_defisit";
import NotebookModalWrapper from "../../NotebookModalWrapper";
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
  if (parsed === 0) return <span className="font-black text-root-subtle">0</span>;
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
  const [isMenuInfoOpen, setIsMenuInfoOpen] = useState(false);
  const [selectedCommodityInfo, setSelectedCommodityInfo] = useState<{ key: string; label: string; production: number; consumption: number; balance: number; bonusDescription: string | null; } | null>(null);

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
        setAllCountries(prefetchedAllCountries.map(country => applyNpcCountrySimulationState(country)));
        return;
      }
      (async () => {
        try {
          const res = await fetch('/api/country-data?all=true', { cache: 'no-store' });
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAllCountries(data.map(country => applyNpcCountrySimulationState(country)));
          }
        } catch (error) { console.error('Error fetching all countries data:', error); }
      })();
    }
  }, [isOpen, prefetchedAllCountries, allCountries.length]);

  if (!isOpen) return null;

  const population = normalizePopulationFromProfile(countryDetail, profilePopulationMap);

  // --- HITUNG INDEKS KEPUASAN PANGAN ---
  const foodSatisfaction = useMemo(() => {
    return calculatePanganScore(countryDetail, metadata);
  }, [countryDetail, metadata]);

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

  const getCommodityBonusDescription = (key: string): string | null => {
    const countryName = countryDetail?.country || countryDetail?.nama || "";
    const normalizedKey = key.trim().toLowerCase().replace(/^\d+_/, "");
    const religion = String(countryDetail?.religion ?? countryDetail?.agama_utama ?? countryDetail?.agama ?? "").trim().toLowerCase();
    const bonusParts: string[] = [];

    if (getCommunismProductionMultiplier(key, countryDetail?.ideology) > 1) {
      bonusParts.push(`${COMMUNISM_PRODUCTION_BONUS * 100}% oleh bonus ideologi Komunisme`);
    }
    if (religion === "shinto" && getShintoElectricityProductionMultiplier(key) > 1) {
      bonusParts.push("10% oleh bonus agama Shinto");
    }
    if (religion === "islam" && getIslamProductionMultiplier(key) > 1) {
      bonusParts.push("10% oleh bonus agama Islam");
    }
    if (isMemberOfFAO(countryName) && FAO_BONUS_RESOURCES.has(normalizedKey)) {
      bonusParts.push("10% oleh bonus keanggotaan FAO");
    }

    return bonusParts.length > 0 ? `Produksi ditingkatkan ${bonusParts.join(" dan ")}.` : null;
  };

  const openCommodityInfo = (key: string, label: string, production: number, consumption: number, balance: number) => {
    setSelectedCommodityInfo({
      key,
      label,
      production,
      consumption,
      balance,
      bonusDescription: getCommodityBonusDescription(key),
    });
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
        <NotebookModalWrapper
          compact
          onClose={() => setSelectedCommodityInfo(null)}
        >
          <div className="food-industry-modal flex min-w-0 flex-col overflow-hidden">
            {/* HEADER */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
                  <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
                </div>
                <div className="min-w-0">
                  <h2 className={rootModalTypography.title}>{selectedCommodityInfo.label}</h2>
                </div>
              </div>
              <RootModalCloseButton onClick={() => setSelectedCommodityInfo(null)} />
            </div>
            {/* CONTENT */}
            <div className="root-no-scrollbar-glow overflow-y-auto p-3.5 lg:p-5 2xl:p-8 bg-root-canvas/80 relative z-10 neon-scrollbar space-y-3.5 lg:space-y-4.5 2xl:space-y-6">
              <div className="grid grid-cols-2 gap-1.5 lg:gap-2">
                <div className={`bg-emerald-950/40 p-2 lg:p-2.5 2xl:p-3.5 border border-emerald-500/30 ${rootBorderRadius.card} flex flex-col justify-between gap-1`}>
                  <span className={rootModalTypography.label}>Total Produksi</span>
                  <div className="text-[10px] lg:text-[11px] 2xl:text-xs font-black">{formatColoredNumber(selectedCommodityInfo.production, true)}</div>
                </div>
                <div className={`bg-rose-950/40 p-2 lg:p-2.5 2xl:p-3.5 border border-rose-500/30 ${rootBorderRadius.card} flex flex-col justify-between gap-1`}>
                  <span className={rootModalTypography.label}>Total Konsumsi</span>
                  <div className="text-[10px] lg:text-[11px] 2xl:text-xs font-black">{formatColoredNumber(selectedCommodityInfo.consumption, false)}</div>
                </div>
              </div>
              {selectedCommodityInfo.bonusDescription && (
                <div className={`bg-emerald-500/10 p-2 lg:p-2.5 2xl:p-3.5 border border-emerald-500/30 ${rootBorderRadius.card} text-emerald-300 font-medium ${rootModalTypography.body}`}>
                  {selectedCommodityInfo.bonusDescription}
                </div>
              )}
              <div className={`bg-root-canvas p-2 lg:p-2.5 2xl:p-3.5 border border-root-accent/20 ${rootBorderRadius.card}`}>
                <div className="flex justify-between items-center text-[10px] lg:text-[11px] 2xl:text-xs">
                  <span className={rootModalTypography.label}>Netto:</span>
                  {formatColoredNumber(selectedCommodityInfo.balance, selectedCommodityInfo.balance >= 0)}
                </div>
              </div>
            </div>
          </div>
        </NotebookModalWrapper>
      )}

      {!selectedCommodityInfo && !isMenuInfoOpen && (
      <NotebookModalWrapper onClose={onClose}>
        <div className="food-industry-modal flex h-full min-w-0 flex-col overflow-hidden">
          {/* HEADER */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
                <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
              </div>
              <div className="min-w-0">
                <h2 className={rootModalTypography.title}>Industri Pangan</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setIsMenuInfoOpen(true)} title="Informasi industri pangan dan konsumsi" aria-label="Informasi industri pangan dan konsumsi" className="root-modal-info-button flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-root-accent/50 bg-root-canvas p-1 text-root-accent transition-all hover:bg-root-accent hover:text-root-canvas">
                <Info className="h-3.5 w-3.5" />
              </button>
              <RootModalCloseButton onClick={onClose} />
            </div>
          </div>
          {/* CONTENT */}
          <div className="root-no-scrollbar-glow flex-1 min-h-0 overflow-y-auto p-2 lg:p-5 2xl:p-8 bg-root-canvas/80 relative z-10 neon-scrollbar">
            <div className="space-y-2 lg:space-y-4.5 2xl:space-y-6">
              {Object.entries(SECTOR_MAP).map(([sectorId, sectorData]) => {
                const SectorIcon = sectorData.icon;
                const sectorItems = sectorData.items.filter(key => FOOD_CONSUMPTION_PER_CAPITA[key] !== undefined);
                if (sectorItems.length === 0) return null;
                let deficitCount = 0; let surplusCount = 0;
                sectorItems.forEach(key => { const prod = calculateProduction(key, countryDetail, metadata); const cons = calculateConsumption(population, FOOD_CONSUMPTION_PER_CAPITA[key]); if (prod - cons < 0) deficitCount++; else if (prod - cons > 0) surplusCount++; });
                return (
                  <div key={sectorId} className={`min-w-0 border border-root-accent/20 ${rootBorderRadius.card} overflow-hidden bg-root-canvas`}>
                    <div className="flex items-center justify-between px-3.5 lg:px-4.5 2xl:px-6 py-2 lg:py-2.5 2xl:py-3.5 bg-root-canvas border-b border-root-accent/20 text-root-accent">
                      <div className="flex min-w-0 items-center gap-2 lg:gap-3"><div className="p-1 lg:p-1.5 bg-root-accent/10 rounded-lg border border-root-accent/30"><SectorIcon className="w-4 h-4 lg:w-4.5 lg:w-4.5 2xl:w-5 2xl:h-5 text-root-accent" /></div><h4 className={`${rootModalTypography.sectionTitle} min-w-0 break-words`}>{sectorData.label} ({sectorItems.length} Komoditas)</h4></div>
                      <button onClick={() => analyzeSector(sectorId)} className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full bg-root-accent/10 hover:bg-root-accent/20 transition-colors border border-root-accent/30 group cursor-pointer" title="Analisis AI untuk sektor ini"><div className="relative"><MessageSquare className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-root-accent group-hover:scale-110 transition-transform" /><span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${deficitCount > 0 ? 'bg-rose-400 animate-pulse' : surplusCount > 0 ? 'bg-emerald-400' : 'bg-gray-400'}`} /></div><span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-wider text-root-accent">AI</span></button>
                    </div>
                    {/* Grid Items */}
                    <div className="grid grid-cols-4 gap-1 p-1.5 lg:gap-2 lg:p-2.5 2xl:p-3 bg-root-surface">
                      {sectorItems.map((key) => {
                        const consumptionPerCapita = FOOD_CONSUMPTION_PER_CAPITA[key];
                        const production = calculateProduction(key, countryDetail, metadata);
                        const consumption = calculateConsumption(population, consumptionPerCapita);
                        const netBalance = production - consumption;
                        const label = metadata?.[key]?.label || key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
                        return (
                          <div key={key} className={`min-w-0 bg-root-canvas p-1.5 lg:p-2.5 2xl:p-3.5 flex flex-col justify-between gap-1 lg:gap-2 ${rootBorderRadius.card} border border-root-accent/20`}>
                            <div className="flex items-start justify-between pb-1 border-b border-root-accent/10 gap-1 min-h-[24px] lg:min-h-[30px] 2xl:min-h-[34px]">
                              <div className="flex min-w-0 flex-1 items-start gap-1 pr-0.5 lg:gap-1.5">
                                <button type="button" onClick={(e) => { e.stopPropagation(); openCommodityInfo(key, label, production, consumption, netBalance); }} title={`Detail konsumsi ${label}`} className="p-0.5 lg:p-1 rounded-md lg:rounded-lg border border-root-accent/30 bg-root-surface text-root-accent hover:bg-root-accent hover:text-root-canvas transition-all cursor-pointer shrink-0"><Info className="w-3 h-3 lg:w-3.5 lg:h-3.5" /></button>
                                <span className={`${rootModalTypography.label} food-commodity-mobile-title min-w-0 whitespace-normal break-words leading-tight`}>{label}</span>
                              </div>
                              {onGotoProduction && (<button onClick={() => handleBuildClick(key)} title={`Bangun ${label}`} className="self-start p-0.5 lg:p-1 rounded-md lg:rounded-lg bg-root-accent text-root-canvas hover:bg-root-accent/80 transition-all cursor-pointer shrink-0"><Plus className="w-3 h-3 lg:w-3.5 lg:h-3.5 font-bold" /></button>)}
                            </div>
                            <div className="food-commodity-mobile-value space-y-1 text-[10px] lg:text-[11px] 2xl:text-xs">
                              <div className={`flex flex-col items-start lg:flex-row lg:items-center lg:justify-between bg-emerald-950/40 px-1 lg:px-2 py-0.5 lg:py-1 ${rootBorderRadius.card} border border-emerald-500/30`}><span className={`${rootModalTypography.label} food-commodity-mobile-label`}>Total Produksi</span>{formatColoredNumber(production, true)}</div>
                              <div className={`flex flex-col items-start lg:flex-row lg:items-center lg:justify-between bg-rose-950/40 px-1 lg:px-2 py-0.5 lg:py-1 ${rootBorderRadius.card} border border-rose-500/30`}><span className={`${rootModalTypography.label} food-commodity-mobile-label`}>Total Konsumsi</span>{formatColoredNumber(consumption, false)}</div>
                            </div>
                            <div className="food-commodity-mobile-value flex flex-col items-start lg:flex-row lg:items-center lg:justify-between pt-1 border-t border-root-accent/10 mt-0.5 text-[10px] lg:text-[11px] 2xl:text-xs"><span className={`${rootModalTypography.label} food-commodity-mobile-label`}>Netto:</span>{formatColoredNumber(netBalance, netBalance >= 0)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* INDEKS KEPUASAN PANGAN */}
              <div className={`p-3.5 lg:p-4 2xl:p-5 border border-root-accent/30 bg-root-canvas ${rootBorderRadius.card}`}>
                <div className="flex justify-between items-center">
                  <span className={rootModalTypography.sectionTitle}>
                    Indeks Kepuasan Rakyat (Pangan)
                  </span>
                  <span className="text-lg lg:text-xl 2xl:text-2xl font-semibold text-root-accent">
                    {foodSatisfaction} / 100
                  </span>
                </div>
                <div className="w-full h-2.5 lg:h-3 bg-root-surface rounded-full mt-2 lg:mt-3 overflow-hidden border border-root-accent/20">
                  <div
                    className="h-full rounded-full bg-root-accent transition-all duration-200"
                    style={{ width: `${foodSatisfaction}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </NotebookModalWrapper>
      )}
      <MenuInfoModal
        isOpen={isMenuInfoOpen}
        onClose={() => setIsMenuInfoOpen(false)}
        title="Informasi Industri Pangan & Konsumsi Masyarakat"
        description="Tinjau produksi, konsumsi, dan neraca bersih komoditas pangan menurut sektor. Gunakan tombol informasi pada komoditas untuk melihat rinciannya, atau tombol tambah untuk menuju menu produksi."
      />
    </>
  );
}