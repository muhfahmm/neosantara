"use client";
import React, { useState, useEffect } from "react";
import {
  Zap,
  BatteryCharging,
  MapPin,
  Search,
  ChevronUp,
  ChevronDown,
  Info,
  X,
} from "lucide-react";

import DetailKonsumsiTerestimasiModal from "./DetailKonsumsiTerestimasiModal";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import RootModalTabs from "@/app/page/root_modals_design_menu/RootModalTabs";
import {
  calculateActualElectricityProduction,
  ELECTRICITY_PLANT_KEYS,
  formatElectricityMW,
  getCountryConsumptionBreakdown,
  logElectricityProductionCalculation,
} from "./consumptionLogic";
import { applyNpcCountrySimulationState } from "@/app/logic/npc_country_simulation/npcCountrySimulation";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  metadata: any;
  prefetchedAllCountries?: any[];
  onNavigateToMenu?: (category: string, itemKey: string) => void;
}

interface SortConfig {
  key: 'name' | 'production' | 'consumption' | 'balance';
  direction: 'asc' | 'desc';
}

const POWER_SOURCE_DESCRIPTIONS: Record<string, string> = {
  "pembangkit_listrik_tenaga_nuklir": "Pembangkit Listrik Tenaga Nuklir (PLTN)",
  "pembangkit_listrik_tenaga_air": "Pembangkit Listrik Tenaga Air (PLTA)",
  "pembangkit_listrik_tenaga_surya": "Pembangkit Listrik Tenaga Surya (PLTS)",
  "pembangkit_listrik_tenaga_uap": "Pembangkit Listrik Tenaga Uap (PLTU)",
  "pembangkit_listrik_tenaga_gas": "Pembangkit Listrik Tenaga Gas (PLTG)",
  "pembangkit_listrik_tenaga_angin": "Pembangkit Listrik Tenaga Bayu (PLTB)",
  "pembangkit_listrik_tenaga_panas_bumi": "Pembangkit Listrik Tenaga Panas Bumi (PLTP)",
  "pembangkit_listrik_tenaga_hidrogen": "Pembangkit Listrik Tenaga Hidrogen (PLTH)",
  "pembangkit_listrik_tenaga_gelombang_laut": "Pembangkit Listrik Tenaga Gelombang Laut (PLTGL)",
  "pembangkit_listrik_tenaga_fusi_nuklir": "Pembangkit Listrik Tenaga Fusi Nuklir (PLTFN)",
};

export default function KelistrikanModal({ isOpen, onClose, countryDetail, setCountryDetail, metadata, prefetchedAllCountries, onNavigateToMenu }: ModalProps) {
  const [activeTab, setActiveTab] = useState<"user" | "global">("user");
  const [allCountries, setAllCountries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'production', direction: 'desc' });
  const [isDetailKonsumsiOpen, setIsDetailKonsumsiOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (prefetchedAllCountries && prefetchedAllCountries.length > 0) {
      setAllCountries(prefetchedAllCountries.map(country => applyNpcCountrySimulationState(country)));
      return;
    }
    if (allCountries.length > 0) return;
    (async () => {
      try {
        const res = await fetch('/api/country-data?all=true', { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAllCountries(data.map(country => applyNpcCountrySimulationState(country)));
        }
      } catch (error) {
        console.error('Error fetching all countries data:', error);
      }
    })();
  }, [isOpen, prefetchedAllCountries, allCountries.length]);

  if (!isOpen) return null;

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

  const productionCalculation = calculateActualElectricityProduction(countryDetail, metadata);
  logElectricityProductionCalculation(productionCalculation, "modal");
  const powerSources = ELECTRICITY_PLANT_KEYS
    .map((key) => {
      const bMeta = findMeta(key);
      const count = Number(countryDetail?.[key]) || 0;
      const unitProduction = Number(bMeta?.produksi) || 0;
      const plantProduction = productionCalculation.perPlant[key];

      return {
        key,
        label: bMeta?.label || key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
        desc: POWER_SOURCE_DESCRIPTIONS[key] || bMeta?.desc || "Sumber energi listrik nasional.",
        value: count,
        unitProduction,
        actualProduction: plantProduction.actual,
        fuelShortage: plantProduction.fuelShortage,
      };
    })
    .filter((source) => source.value > 0 || source.unitProduction > 0);

  const totalCapacityMW = productionCalculation.actualTotal;

  const calculateBuildingElectricityConsumption = (country: any) => {
    if (!country) return 0;
    return getCountryConsumptionBreakdown(country, metadata).totalAllBreakdownConsumption;
  };

  const userBuildingConsumption = calculateBuildingElectricityConsumption(countryDetail);
  const populationDemand = 0;
  const estimatedConsumptionMW = Math.max(0, userBuildingConsumption + populationDemand);
  const balanceMW = totalCapacityMW - estimatedConsumptionMW;

  // --- HITUNG INDEKS KEPUASAN LISTRIK ---
  const electricitySatisfaction = (() => {
    const production = totalCapacityMW;
    const consumption = estimatedConsumptionMW;
    if (consumption <= 0) return 100;
    const coverage = Math.min(1, Math.max(0, production / consumption));
    return Math.round(coverage * 100);
  })();

  const globalElectricityData = activeTab === "global"
    ? allCountries.map((country, index) => {
      const calculation = calculateActualElectricityProduction(country, metadata);
      const totalProduction = calculation.actualTotal;
      const buildingConsumption = calculateBuildingElectricityConsumption(country);
      const totalConsumption = buildingConsumption > 0
        ? buildingConsumption
        : totalProduction * 0.7;
      const consumption = Math.max(0, totalConsumption);
      const balance = totalProduction - consumption;
      const userCountryName = (countryDetail?.name_id || countryDetail?.nama || countryDetail?.country || countryDetail?.name_en || '').toLowerCase().trim();
      let rawName = country?.name_id || country?.name_en || country?.nama || country?.country;
      if (!rawName && country?.__fileName) {
        rawName = country.__fileName
          .replace(/^\d+_/, '')
          .replace(/\.(ts|js|json)$/i, '')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char: string) => char.toUpperCase());
      }
      const name = rawName || 'Unknown';
      const isUser = Boolean(
        userCountryName && (
          name.toLowerCase().trim() === userCountryName ||
          country?.name_id?.toLowerCase().trim() === userCountryName ||
          country?.name_en?.toLowerCase().trim() === userCountryName ||
          country?.country?.toLowerCase().trim() === userCountryName
        )
      );
      return {
        index: index + 1,
        name,
        production: Number.isFinite(totalProduction) ? totalProduction : 0,
        consumption: Number.isFinite(consumption) ? consumption : 0,
        balance: Math.abs(balance) < 0.01 || !Number.isFinite(balance) ? 0 : balance,
        isUser,
      };
    }).sort((a, b) => b.production - a.production)
    : [];

  const sortedData = [...globalElectricityData].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    switch (sortConfig.key) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'consumption':
        aValue = a.consumption;
        bValue = b.consumption;
        break;
      case 'balance':
        aValue = a.balance;
        bValue = b.balance;
        break;
      default:
        aValue = a.production;
        bValue = b.production;
    }
    if (sortConfig.direction === 'asc') return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
  });

  const filteredData = searchQuery.trim() === ''
    ? sortedData
    : sortedData.filter(country => country.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSort = (column: SortConfig['key']) => {
    setSortConfig(current => ({
      key: column,
      direction: current.key === column && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const SortIndicator = ({ column }: { column: SortConfig['key'] }) => (
    sortConfig.key === column
      ? sortConfig.direction === 'asc'
        ? <ChevronUp className="h-3 w-3 ml-1 inline text-root-accent" />
        : <ChevronDown className="h-3 w-3 ml-1 inline text-root-accent" />
      : <span className="text-[#8b7e66]/30 ml-1 text-xs">⇅</span>
  );

  // Simpan indeks ke countryDetail
  useEffect(() => {
    if (setCountryDetail && countryDetail) {
      setCountryDetail({
        ...countryDetail,
        satisfaction: {
          ...(countryDetail?.satisfaction || {}),
          electricity: electricitySatisfaction,
        }
      });
    }
  }, [electricitySatisfaction]);

  return (
    <>
      {!isInfoOpen && <NotebookModalWrapper onClose={onClose}>
        <div className="flex h-full min-w-0 flex-col overflow-hidden">
          {/* HEADER */}
          <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-root-accent/20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 sm:gap-3 bg-root-canvas relative z-10 shrink-0">
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
              <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
              </div>
              <div className="min-w-0">
                <h2 className={rootModalTypography.title}>Grid Nasional</h2>
              </div>
            </div>

            <div className="min-w-0 flex justify-center">
              <RootModalTabs
                compact
                className="!flex-nowrap gap-0.5 whitespace-nowrap p-0.5"
                items={[
                  {
                    label: "Neraca User",
                    isActive: activeTab === "user",
                    onClick: () => setActiveTab("user"),
                    className: "!px-1.5 !text-[8px] !tracking-normal sm:!px-2.5 sm:!text-[9px]",
                  },
                  {
                    label: `Neraca ${allCountries.length || 212} Negara`,
                    isActive: activeTab === "global",
                    onClick: () => setActiveTab("global"),
                    className: "!px-1.5 !text-[8px] !tracking-normal sm:!px-2.5 sm:!text-[9px]",
                  },
                ]}
              />
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button type="button" onClick={() => setIsInfoOpen(true)} title="Informasi grid kelistrikan nasional" aria-label="Informasi grid kelistrikan nasional" className="flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-root-accent/50 bg-root-canvas p-1 text-root-accent transition-all hover:bg-root-accent hover:text-root-canvas">
                <Info className="h-3.5 w-3.5" />
              </button>
              <RootModalCloseButton onClick={onClose} />
            </div>
          </div>

          {/* BODY (SCROLLBAR HIJAU DITERAPKAN DI SINI) */}
          <div className="root-no-scrollbar-glow flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-3 lg:p-4 2xl:p-6 bg-root-canvas/80 relative z-10
            [&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 
            [&::-webkit-scrollbar-track]:bg-root-canvas
            [&::-webkit-scrollbar-track]:rounded-full 
            [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-root-accent/20
            [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-root-accent [&::-webkit-scrollbar-thumb]:to-[#00B37A]
            [&::-webkit-scrollbar-thumb]:rounded-full 
            [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-root-canvas
            hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-root-accent
            [&::-webkit-scrollbar-button]:hidden
          ">

            {activeTab === "user" ? (
              <div className="flex flex-col gap-3">
                
                {/* KOTAK 1: STATISTIK GRID (Memanjang ke kanan-kiri) */}
                <div className={`w-full bg-root-canvas border border-root-accent/20 p-3 lg:p-4 ${rootBorderRadius.card}`}>
                  <div className="flex items-center gap-2.5 mb-3 lg:mb-3.5">
                    <div className="p-2 rounded-lg bg-root-accent/10 text-root-accent border border-root-accent/30">
                      <BatteryCharging className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                    <div>
                      <h3 className={rootModalTypography.sectionTitle}>Statistik Grid</h3>
                    </div>
                    </div>
                  {/* Grid Card di dalamnya memanjang ke samping (3 kolom) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    <div className={`bg-emerald-950/40 border border-emerald-500/30 p-2.5 lg:p-3 ${rootBorderRadius.card}`}>
                      <p className={rootModalTypography.label}>✓ Total Produksi Listrik</p>
                      <p className="text-base lg:text-lg font-black text-emerald-400 mt-1.5">
                        {formatElectricityMW(totalCapacityMW)} MW
                      </p>
                    </div>
                    
                    <div
                      onClick={() => setIsDetailKonsumsiOpen(true)}
                      className={`bg-rose-950/40 border border-rose-500/30 hover:border-rose-400 hover:scale-[1.01] p-2.5 lg:p-3 ${rootBorderRadius.card} transition-all cursor-pointer group`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={rootModalTypography.label}>✗ Konsumsi Terestimasi</p>
                        <span className="text-[10px] text-rose-300 font-bold opacity-80 group-hover:opacity-100 transition-opacity">Detail →</span>
                      </div>
                      <p className="text-base lg:text-lg font-black text-rose-400 mt-1.5">
                        {formatElectricityMW(estimatedConsumptionMW)} MW
                      </p>
                    </div>

                    <div className={`p-2.5 lg:p-3 ${rootBorderRadius.card} border ${balanceMW > 0 ? 'bg-emerald-950/40 border-emerald-500/30' :
                        balanceMW < 0 ? 'bg-rose-950/40 border-rose-500/30' :
                          'bg-slate-900/40 border-slate-500/30'
                      }`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${balanceMW > 0 ? 'text-emerald-400' :
                          balanceMW < 0 ? 'text-rose-400' :
                            'text-slate-400'
                        }`}>Neraca Daya</p>
                      <p className={`text-base lg:text-lg font-black mt-1.5 ${balanceMW > 0 ? 'text-emerald-400' :
                          balanceMW < 0 ? 'text-rose-400' :
                            'text-slate-400'
                        }`}>
                        {balanceMW > 0 ? '+' : balanceMW < 0 ? '-' : ''}{formatElectricityMW(Math.abs(balanceMW))} MW
                      </p>
                    </div>
                  </div>
                </div>

                {/* KOTAK 2: RINGKASAN SUMBER DAYA (Di Bawah, Berbentuk Grid) */}
                <div className={`w-full bg-root-canvas border border-root-accent/20 p-3 lg:p-4 ${rootBorderRadius.card}`}>
                  <div className="flex items-center gap-2.5 mb-3 lg:mb-3.5">
                    <div className="p-2 rounded-lg bg-root-accent/10 text-root-accent border border-root-accent/30">
                      <MapPin className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                    <div>
                      <h3 className={rootModalTypography.sectionTitle}>Ringkasan Sumber Daya</h3>
                    </div>
                  </div>

                  {/* Card Sumber Daya dibuat Grid (2 atau 3 kolom) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                    {powerSources.length > 0 ? powerSources.map((source) => (
                      <div key={source.key} className={`flex items-center justify-between gap-2 p-2.5 lg:p-3 bg-root-surface border border-root-accent/20 ${rootBorderRadius.card}`}>
                        <div className="min-w-0">
                          <p className="text-[10px] lg:text-xs font-bold uppercase tracking-wide text-root-text">{source.label}</p>
                          <p className="text-[9px] lg:text-[10px] leading-snug text-root-muted">{source.desc}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs lg:text-sm font-black text-root-accent">
                            {formatElectricityMW(source.actualProduction)} MW
                          </p>
                          <p className="text-[9px] lg:text-[10px] text-root-subtle">
                            {source.fuelShortage
                              ? "Bahan bakar kurang — tidak berproduksi"
                              : source.value > 0 ? `${source.value} unit` : 'Tidak tersedia'}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className={`col-span-full border border-root-accent/20 bg-root-surface p-3 ${rootBorderRadius.card} ${rootModalTypography.body}`}>
                        Data pembangkit listrik tidak tersedia.
                      </div>
                    )}
                  </div>
                </div>

                {/* KOTAK 3: INDEKS KEPUASAN LISTRIK */}
                <div className={`w-full p-3 lg:p-4 border border-root-accent/30 bg-root-canvas ${rootBorderRadius.card}`}>
                  <div className="flex justify-between items-center">
                    <span className={rootModalTypography.sectionTitle}>
                      Indeks Kepuasan Rakyat (Listrik)
                    </span>
                    <span className="text-2xl lg:text-3xl font-black text-root-accent">
                      {electricitySatisfaction} / 100
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-root-surface rounded-full mt-2 overflow-hidden border border-root-accent/20">
                    <div
                      className="h-full rounded-full bg-root-accent transition-all duration-200"
                      style={{ width: `${electricitySatisfaction}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className={`w-full bg-root-canvas border border-root-accent/20 p-3 lg:p-4 ${rootBorderRadius.card}`}>
                <div className="relative mb-3 w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-root-subtle" />
                  <input
                    type="text"
                    placeholder="Cari nama negara..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full rounded-lg border border-root-accent/30 bg-root-surface py-2 pl-10 pr-3 text-xs font-semibold text-root-text placeholder-root-subtle transition-all focus:border-root-accent focus:outline-none sm:text-sm"
                  />
                </div>
                <div className={`root-no-scrollbar-glow max-h-[60vh] overflow-x-auto overflow-y-auto border border-root-accent/20 bg-root-surface ${rootBorderRadius.card}
                  [&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar]:h-1.5 sm:[&::-webkit-scrollbar]:h-2
                  [&::-webkit-scrollbar-track]:bg-root-surface
                  [&::-webkit-scrollbar-track]:rounded-full
                  [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-root-accent/10
                  [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-root-accent [&::-webkit-scrollbar-thumb]:to-[#00B37A]
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-root-surface
                  hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-root-accent
                  [&::-webkit-scrollbar-button]:hidden
                `}>
                  <table className="w-full min-w-[560px] text-[10px] sm:text-xs">
                    <thead className="sticky top-0 z-10 text-[9px] sm:text-xs">
                      <tr className="border-b border-root-accent/20 bg-root-canvas">
                        <th className="px-2.5 py-2 text-left font-black uppercase tracking-wider text-root-accent">No</th>
                        <th
                          onClick={() => handleSort('name')}
                          className="cursor-pointer px-2.5 py-2 text-left font-black uppercase tracking-wider text-root-accent hover:bg-root-surface"
                        >
                          Negara <SortIndicator column="name" />
                        </th>
                        <th
                          onClick={() => handleSort('production')}
                          className="cursor-pointer px-2.5 py-2 text-right font-black uppercase tracking-wider text-emerald-400 hover:bg-emerald-950/40"
                        >
                          Produksi (MW) <SortIndicator column="production" />
                        </th>
                        <th
                          onClick={() => handleSort('consumption')}
                          className="cursor-pointer px-2.5 py-2 text-right font-black uppercase tracking-wider text-rose-400 hover:bg-rose-950/40"
                        >
                          Konsumsi (MW) <SortIndicator column="consumption" />
                        </th>
                        <th
                          onClick={() => handleSort('balance')}
                          className="cursor-pointer px-2.5 py-2 text-right font-black uppercase tracking-wider text-root-accent hover:bg-root-surface"
                        >
                          Neraca Daya <SortIndicator column="balance" />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-root-accent/10 bg-root-surface">
                      {allCountries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center font-bold text-root-subtle">
                            Memuat data negara...
                          </td>
                        </tr>
                      ) : filteredData.length > 0 ? (
                        filteredData.map((country, rowIndex) => (
                          <tr
                            key={`${country.name}-${rowIndex}`}
                            className={country.isUser ? "border-l-4 border-l-emerald-400 bg-emerald-950/50 font-black" : "bg-root-surface"}
                          >
                            <td className={`px-2.5 py-2 font-bold ${country.isUser ? "text-emerald-400" : "text-root-subtle"}`}>
                              {rowIndex + 1}
                            </td>
                            <td className={`px-2.5 py-2 font-bold ${country.isUser ? "text-emerald-400" : "text-root-text"}`}>
                              <span>{country.name}</span>
                              {country.isUser && <span className="ml-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-black uppercase text-root-canvas">Negara Anda</span>}
                            </td>
                            <td className="px-2.5 py-2 text-right font-bold text-emerald-400">
                              {country.production <= 0 ? "0" : country.production.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-2.5 py-2 text-right font-bold text-rose-400">
                              {country.consumption <= 0 ? "0" : country.consumption.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                            </td>
                            <td className={`px-2.5 py-2 text-right font-black ${country.balance > 0.01 ? "text-emerald-400" : country.balance < -0.01 ? "text-rose-400" : "text-slate-400"}`}>
                              {country.balance === 0 ? "0" : `${country.balance > 0 ? "+" : "-"}${Math.abs(country.balance).toLocaleString("id-ID", { maximumFractionDigits: 2 })}`}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center font-bold text-root-subtle">
                            Tidak ada negara yang cocok dengan pencarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </NotebookModalWrapper>}

      <MenuInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title="Informasi Grid Kelistrikan Nasional"
        description="Pantau neraca daya negara Anda atau bandingkan produksi, konsumsi, dan neraca listrik dengan negara lain."
      />

      <DetailKonsumsiTerestimasiModal
        isOpen={isDetailKonsumsiOpen}
        onClose={() => setIsDetailKonsumsiOpen(false)}
        countryDetail={countryDetail}
        metadata={metadata}
        estimatedConsumptionMW={estimatedConsumptionMW}
        onNavigateToMenu={(category, itemKey) => {
          setIsDetailKonsumsiOpen(false);
          onClose();
          onNavigateToMenu?.(category, itemKey);
        }}
      />

    </>
  );
}