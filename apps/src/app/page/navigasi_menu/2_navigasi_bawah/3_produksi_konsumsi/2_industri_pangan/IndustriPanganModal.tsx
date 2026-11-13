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
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
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
  if (parsed === 0) return <span className={"root-modal-util-45beb2b6f2"}>0</span>;
  const absValue = Math.abs(parsed);
  const formatted = absValue.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  const mainColor = isPositive ? "root-modal-util-edbfd1c508" : "root-modal-util-35f302741d";
  const sign = isPositive ? '+' : '-';
  return <span className={`root-modal-util-7fbb85697d ${mainColor}`}>{sign}{formatted}</span>;
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
    if (sortConfig.key !== column) return <span className={"root-modal-util-b5b1d5164b"}>⇅</span>;
    if (sortConfig.direction === 'asc') return <ChevronUp className={"root-modal-util-4bb26683ea"} />;
    return <ChevronDown className={"root-modal-util-4bb26683ea"} />;
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
          <div className={"food-industry-modal root-modal-util-1a8b37d835"}>
            {/* HEADER */}
            <div className={"root-modal-util-99feb978ac"}>
              <div className={"root-modal-util-1117664efc"}>
                <div className={"root-modal-util-170d7abee6"}>
                  <Utensils className={"root-modal-util-e520c3c92e"} />
                </div>
                <div className={"root-modal-util-7e0b7cdf1a"}>
                  <h2 className={"root-modal-util-6b4648c53a"}>{selectedCommodityInfo.label}</h2>
                </div>
              </div>
              <RootModalCloseButton onClick={() => setSelectedCommodityInfo(null)} />
            </div>
            {/* CONTENT */}
            <div className={"root-no-scrollbar-glow root-modal-util-442b6700f1 neon-scrollbar"}>
              <div className={"root-modal-util-83c631f722"}>
                <div className={`root-modal-util-548951b485 root-modal-util-5f22e64f22 root-modal-util-9274009d5e `}>
                  <span className={"root-modal-util-14d6efe9ef"}>Total Produksi</span>
                  <div className={"root-modal-util-76e5b7f137"}>{formatColoredNumber(selectedCommodityInfo.production, true)}</div>
                </div>
                <div className={`root-modal-util-057a5de724 root-modal-util-5f22e64f22 root-modal-util-9274009d5e `}>
                  <span className={"root-modal-util-14d6efe9ef"}>Total Konsumsi</span>
                  <div className={"root-modal-util-76e5b7f137"}>{formatColoredNumber(selectedCommodityInfo.consumption, false)}</div>
                </div>
              </div>
              {selectedCommodityInfo.bonusDescription && (
                <div className={`root-modal-util-f592c4fbb0 root-modal-util-5f22e64f22 root-modal-util-19666cda60 root-modal-util-8ff7188727`}>
                  {selectedCommodityInfo.bonusDescription}
                </div>
              )}
              <div className={`root-modal-util-c3dd845bb0 root-modal-util-5f22e64f22`}>
                <div className={"root-modal-util-f1cb411495"}>
                  <span className={"root-modal-util-14d6efe9ef"}>Netto:</span>
                  {formatColoredNumber(selectedCommodityInfo.balance, selectedCommodityInfo.balance >= 0)}
                </div>
              </div>
            </div>
          </div>
        </NotebookModalWrapper>
      )}

      {!selectedCommodityInfo && !isMenuInfoOpen && (
      <NotebookModalWrapper onClose={onClose}>
        <div className={"food-industry-modal root-modal-util-35cc3749b1"}>
          {/* HEADER */}
          <RootInfoModalHeader
            title="Industri Pangan"
            onClose={onClose}
            size="standard"
            icon={<Utensils aria-hidden="true" className={"root-modal-util-08cc358851"} />}
            actions={
              <button type="button" onClick={() => setIsMenuInfoOpen(true)} title="Informasi industri pangan dan konsumsi" aria-label="Informasi industri pangan dan konsumsi" className={"root-modal-info-button root-modal-util-be617bb95e"}>
                <Info className={"root-modal-util-ce72f65c94"} />
              </button>
            }
          />
          {/* CONTENT */}
          <div className={"root-no-scrollbar-glow root-modal-util-9dc0c98e81 neon-scrollbar"}>
            <div className={"root-modal-util-ffeb68166b"}>
              {Object.entries(SECTOR_MAP).map(([sectorId, sectorData]) => {
                const SectorIcon = sectorData.icon;
                const sectorItems = sectorData.items.filter(key => FOOD_CONSUMPTION_PER_CAPITA[key] !== undefined);
                if (sectorItems.length === 0) return null;
                let deficitCount = 0; let surplusCount = 0;
                sectorItems.forEach(key => { const prod = calculateProduction(key, countryDetail, metadata); const cons = calculateConsumption(population, FOOD_CONSUMPTION_PER_CAPITA[key]); if (prod - cons < 0) deficitCount++; else if (prod - cons > 0) surplusCount++; });
                return (
                  <div key={sectorId} className={`root-modal-util-5298bdd041 root-modal-util-5f22e64f22 root-modal-util-23cdffb29e `}>
                    <div className={"root-modal-util-46d52ba86c"}>
                      <div className={"root-modal-util-d4cd52ca73"}><div className={"root-modal-util-a27f83ec88"}><SectorIcon className={"root-modal-util-f541a30647"} /></div><h4 className={`root-modal-util-9361ef65fc root-modal-util-3d9a1150e3 `}>{sectorData.label} ({sectorItems.length} Komoditas)</h4></div>
                      <button onClick={() => analyzeSector(sectorId)} className={"root-modal-util-60a67fef2a group"} title="Analisis AI untuk sektor ini"><div className={"root-modal-util-d89972fe17"}><MessageSquare className={"root-modal-util-267d2a941e"} /><span className={`root-modal-util-54a9c5af4a ${deficitCount > 0 ? "root-modal-util-e9c97db68c" : surplusCount > 0 ? "root-modal-util-6f845a7c2f" : "root-modal-util-5237703dd5"}`} /></div><span className={"root-modal-util-615ecd8200"}>AI</span></button>
                    </div>
                    {/* Grid Items */}
                    <div className={"root-modal-util-d330c4f8fa"}>
                      {sectorItems.map((key) => {
                        const consumptionPerCapita = FOOD_CONSUMPTION_PER_CAPITA[key];
                        const production = calculateProduction(key, countryDetail, metadata);
                        const consumption = calculateConsumption(population, consumptionPerCapita);
                        const netBalance = production - consumption;
                        const label = metadata?.[key]?.label || key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
                        return (
                          <div key={key} className={`root-modal-util-7ffb0bad63 root-modal-util-5f22e64f22 root-modal-util-e1012a77bf `}>
                            <div className={"root-modal-util-a5a609ec40"}>
                              <div className={"root-modal-util-32533cb404"}>
                                <button type="button" onClick={(e) => { e.stopPropagation(); openCommodityInfo(key, label, production, consumption, netBalance); }} title={`Detail konsumsi ${label}`} className={"root-modal-util-182614346b"}><Info className={"root-modal-util-7b11a622cc"} /></button>
                                <span className={`root-modal-util-14d6efe9ef food-commodity-mobile-title root-modal-util-e0b60b8e1d `}>{label}</span>
                              </div>
                              {onGotoProduction && (<button onClick={() => handleBuildClick(key)} title={`Bangun ${label}`} className={"root-modal-util-44803908b4"}><Plus className={"root-modal-util-a35739b19e"} /></button>)}
                            </div>
                            <div className={"food-commodity-mobile-value root-modal-util-a8f233d4d7"}>
                              <div className={`root-modal-util-3b859a66cf root-modal-util-5f22e64f22 root-modal-util-1b774baba7 `}><span className={`root-modal-util-14d6efe9ef food-commodity-mobile-label`}>Total Produksi</span>{formatColoredNumber(production, true)}</div>
                              <div className={`root-modal-util-a4b253bd54 root-modal-util-5f22e64f22 root-modal-util-4b89a46abe `}><span className={`root-modal-util-14d6efe9ef food-commodity-mobile-label`}>Total Konsumsi</span>{formatColoredNumber(consumption, false)}</div>
                            </div>
                            <div className={"food-commodity-mobile-value root-modal-util-1eaefe7a3f"}><span className={`root-modal-util-14d6efe9ef food-commodity-mobile-label`}>Netto:</span>{formatColoredNumber(netBalance, netBalance >= 0)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* INDEKS KEPUASAN PANGAN */}
              <div className={`root-satisfaction-index root-modal-util-2e2a9db707 root-modal-util-5f22e64f22`}>
                <div className={"root-modal-util-56e6b92b69"}>
                  <span className={"root-satisfaction-index-title root-modal-util-84cf691742"}>
                    Indeks Kepuasan Rakyat (Pangan)
                  </span>
                  <span className={"root-satisfaction-index-value root-modal-util-9a9af14778"}>
                    {foodSatisfaction} / 100
                  </span>
                </div>
                <div className={"root-modal-util-a66208a3cc"}>
                  <div
                    className={"root-modal-progress-fill root-modal-util-0131747055"}
                    style={{ "--root-modal-progress-value": `${foodSatisfaction}%` } as React.CSSProperties}
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