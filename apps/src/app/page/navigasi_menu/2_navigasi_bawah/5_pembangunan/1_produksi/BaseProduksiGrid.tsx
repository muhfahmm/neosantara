// BaseProduksiGrid.tsx
"use client";
import React, { useState } from "react";
import { Info, MessageSquare } from "lucide-react";
import { getKelistrikanFuelRequirements } from "./requirements_logic/1_produksi/1_kelistrikan/fuelLogic";
import { getDaysElapsed, formatDate } from '@/app/logic/production_logic';
import InfoBangunan from "./1_modals_info_bangunan/info_bangunan_modals";
import { getMaterialStock } from "../build_logic/build_logic";
import {
  FOOD_CONSUMPTION_PER_CAPITA,
  calculateProduction,
  calculateConsumption,
  isFoodRawMaterialDeficit,
} from "../../3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic";
import ProductionAISuggestionsModal from "./ai_suggestions/ProductionAISuggestionsModal";
import { generateProductionSectorAnalysis } from "./ai_suggestions/productionAISuggestionsLogic";

const ELECTRICITY_FUEL_RESOURCE_KEYS = [
  "gas_alam",
  "uranium",
  "batu_bara",
  "minyak_bumi",
];

const electricityFuelBuildings = [
  "pembangkit_listrik_tenaga_gas",
  "pembangkit_listrik_tenaga_nuklir",
  "pembangkit_listrik_tenaga_uap",
];

const calculateTotalFuelConsumption = (countryDetail: any) => {
  const totals: Record<string, number> = {
    gas_alam: 0,
    uranium: 0,
    batu_bara: 0,
    minyak_bumi: 0,
  };

  electricityFuelBuildings.forEach((buildingKey) => {
    const count = Number(countryDetail?.[buildingKey]) || 0;
    if (count === 0) return;
    switch (buildingKey) {
      case "pembangkit_listrik_tenaga_gas":
        totals.gas_alam += 2 * count;
        break;
      case "pembangkit_listrik_tenaga_nuklir":
        totals.uranium += 1 * count;
        break;
      case "pembangkit_listrik_tenaga_uap":
        totals.batu_bara += 50 * count;
        totals.minyak_bumi += 5 * count;
        break;
    }
  });

  return totals;
};

interface BaseProduksiGridProps {
  keys: string[];
  title: string;
  Icon: any;
  countryDetail: any;
  setCountryDetail?: (detail: any) => void;
  metadata: any;
  calculateProductionAmount: (key: string) => number;
  findMeta: (key: string) => any;
  onBuildClick: (key: string, label: string, quantity?: number) => void;
  hoveredBuildingKey: string | null;
  setHoveredBuildingKey: (key: string | null) => void;
  isBuildingAvailable?: (buildingKey: string, countryName: string) => boolean;
  isElectricityTab: boolean;
  highlightedCardKey?: string | null;
  ongoingConstructions?: any[];
  currentDate?: string | Date;
  onNavigateToTab?: (tabId: string, itemKey?: string) => void;
}

export default function BaseProduksiGrid({
  keys,
  title,
  Icon,
  countryDetail,
  setCountryDetail,
  metadata,
  calculateProductionAmount,
  findMeta,
  onBuildClick,
  hoveredBuildingKey,
  setHoveredBuildingKey,
  highlightedCardKey,
  isBuildingAvailable,
  isElectricityTab,
  ongoingConstructions = [],
  currentDate,
  onNavigateToTab,
}: BaseProduksiGridProps) {
  const formatLabel = (key: string) => {
    const customLabels: Record<string, string> = {
      pembangkit_listrik_tenaga_nuklir: "PLT Nuklir (PLTN)",
      pembangkit_listrik_tenaga_air: "PLT Air (PLTA)",
      pembangkit_listrik_tenaga_surya: "PLT Surya (PLTS)",
      pembangkit_listrik_tenaga_uap: "PLT Uap (PLTU)",
      pembangkit_listrik_tenaga_gas: "PLT Gas (PLTG)",
      pembangkit_listrik_tenaga_angin: "PLT Angin (PLTB)",
    };
    if (customLabels[key]) return customLabels[key];
    return key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
  };

  // Format tanggal menjadi DD MMM, YYYY
  const formatBadgeDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const [y, m, d] = dateString.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      if (isNaN(date.getTime())) return dateString;
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      const parts = new Intl.DateTimeFormat('id-ID', options).formatToParts(date);
      const day = parts.find((p) => p.type === 'day')?.value || '';
      const month = parts.find((p) => p.type === 'month')?.value || '';
      const year = parts.find((p) => p.type === 'year')?.value || '';
      return `${day} ${month}, ${year}`;
    } catch {
      return dateString;
    }
  };

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  const SUPPORTED_AI_SECTORS = ["peternakan", "agrikultur", "perikanan", "olahan pangan"];
  const normalizedTitle = (title || "").toLowerCase().trim();
  const showAIButton = SUPPORTED_AI_SECTORS.includes(normalizedTitle);

  const handleOpenAISuggestions = () => {
    const analysis = generateProductionSectorAnalysis(normalizedTitle, title, keys, countryDetail, metadata);
    setAiAnalysisResult(analysis);
    setIsAIModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-[#00FFAA]" />
          <h3 className="text-lg font-black text-[#00FFAA] uppercase tracking-wider">{title}</h3>
        </div>

        {showAIButton && (
          <button
            type="button"
            onClick={handleOpenAISuggestions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00FFAA]/10 hover:bg-[#00FFAA]/20 transition-all border border-[#00FFAA]/30 group cursor-pointer shadow-sm"
            title={`Analisis AI untuk Sektor ${title}`}
          >
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-[#00FFAA] group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#00FFAA]">Rekomendasi AI</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {keys.map((key) => {
          const bMeta = findMeta(key) || {};
          const perCount = Number(countryDetail?.[key]) || 0;
          const label = formatLabel(key);
          const isHighlighted = highlightedCardKey === key;
          const isAvailable = isBuildingAvailable ? isBuildingAvailable(key, countryDetail?.country || '') : true;
          const fuelRequirements = isElectricityTab ? getKelistrikanFuelRequirements(key) : [];
          const isFuelResource = ELECTRICITY_FUEL_RESOURCE_KEYS.includes(key);

          const effectiveProduction = calculateProductionAmount(key);
          const isProductionZero = effectiveProduction === 0 && perCount > 0;
          const rawProduction = perCount * Number(bMeta?.produksi || 0);

          // Hitung jumlah antrean
          const buildingConstructions = ongoingConstructions.filter(
            (c: any) => c.buildingKey === key
          );
          const queueCount = buildingConstructions.length;
          const isBuilding = queueCount > 0;
          
          // Tampilkan tanggal selesai dari unit PALING AKHIR
          const lastEndDate = isBuilding ? buildingConstructions[buildingConstructions.length - 1].endDate : null;

          return (
            <div
              key={key}
              onClick={() => {
                if (!isAvailable) return;
                onBuildClick(key, label);
              }}
              role="button"
              tabIndex={0}
              className={`relative rounded-2xl overflow-visible flex flex-col flex-grow justify-between transition-all bg-[#0A1A1A] border shadow-sm ${
                isAvailable ? 'border-[#00FFAA]/20 hover:border-[#00FFAA]/50 hover:shadow-md cursor-pointer' : 'border-rose-500/30 bg-rose-500/10 opacity-70 cursor-not-allowed'
              } ${isHighlighted ? 'border-[#00FFAA] border-2 shadow-[0_0_12px_rgba(0,255,170,0.3)]' : ''}`}
            >
              {/* Badge Tanggal */}
              {isBuilding && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-[#00FFAA] text-[10px] font-bold px-2 py-1 border border-[#00FFAA]/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">
                  {formatBadgeDate(lastEndDate)}
                </div>
              )}

              {hoveredBuildingKey === key && (
                <InfoBangunan
                  buildingKey={key}
                  label={label}
                  perCount={perCount}
                  bMeta={bMeta}
                  countryDetail={countryDetail}
                  metadata={metadata}
                  findMeta={findMeta}
                  isElectricityTab={isElectricityTab}
                  isProductionZero={isProductionZero}
                  rawProduction={rawProduction}
                  onClose={() => setHoveredBuildingKey(null)}
                  onNavigateToTab={onNavigateToTab}
                />
              )}

              <div className="p-2.5 sm:p-3 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1 mb-0.5">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase text-[#6B8A8A] tracking-wider flex-1 pr-1 leading-snug">{label}</p>
                    <button
                      className="flex-shrink-0 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-colors cursor-pointer bg-[#0F2424] border border-[#00FFAA]/30 hover:border-[#00FFAA] text-[#6B8A8A] hover:text-[#00FFAA]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHoveredBuildingKey(hoveredBuildingKey === key ? null : key);
                      }}
                      title="Info bangunan"
                    >
                      <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>

                  {/* Indikator +1, +2 */}
                  <div className="flex items-end gap-1 mt-1 flex-wrap">
                    <span className="text-sm sm:text-base lg:text-lg font-black text-[#E0E0E0] leading-none">{perCount}</span>
                    {isBuilding && (
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-400 leading-none">
                        +{queueCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* FOOTER LISTRIK */}
                {isElectricityTab && (
                  <div className="border-t border-[#00FFAA]/10 mt-2 pt-1.5 pb-0.5 text-center min-h-[44px] flex flex-col justify-center">
                    <span className={`font-black text-xs sm:text-sm leading-tight break-words ${isProductionZero ? 'text-rose-400' : 'text-[#00FFAA]'}`}>
                      {rawProduction.toLocaleString('id-ID')} MW
                    </span>
                    {isProductionZero && (
                      <span className="text-[8px] sm:text-[9px] font-bold text-rose-400 leading-tight">(bahan bakar defisit)</span>
                    )}
                  </div>
                )}

                {/* FOOTER NON-LISTRIK */}
                {!isElectricityTab && (
                  <div className="border-t border-[#00FFAA]/10 mt-2 pt-1.5 pb-0.5 text-center min-h-[44px] flex flex-col justify-center gap-0.5">
                    {(() => {
                      // Emas: tampilkan produksi tetap (tidak berubah-ubah seperti stok)
                      if (key === 'emas') {
                        const fixedProd = Number(bMeta?.produksi || 0) * perCount;
                        return (
                          <span className="font-black text-xs sm:text-sm text-[#00FFAA] leading-tight break-words">
                            {fixedProd.toLocaleString('id-ID')}
                          </span>
                        );
                      }

                      const isFoodCommodity = FOOD_CONSUMPTION_PER_CAPITA[key] !== undefined;
                      if (isFoodCommodity) {
                        const isDeficit = isFoodRawMaterialDeficit(key, countryDetail, metadata);
                        const accumulated = getMaterialStock(countryDetail, key, metadata);
                        const displayVal = isDeficit ? 0 : accumulated;
                        const isRedText = isDeficit;

                        return (
                          <div className="flex flex-col items-center justify-center">
                            <span className={`font-black text-xs sm:text-sm lg:text-base leading-tight break-words ${isRedText ? 'text-rose-400' : 'text-[#00FFAA]'}`}>
                              {displayVal.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                            </span>
                            {isDeficit && (
                              <span className="text-[9px] font-bold text-rose-400 leading-none mt-0.5">(bahan baku defisit)</span>
                            )}
                          </div>
                        );
                      }

                      const stock = getMaterialStock(countryDetail, key);
                      const isFuel = ELECTRICITY_FUEL_RESOURCE_KEYS.includes(key);
                      const colorClass = (isFuel && stock > 0) ? 'text-emerald-400' : 'text-[#00FFAA]';
                      return (
                        <span className={`font-black text-xs sm:text-sm lg:text-base leading-tight break-words ${colorClass}`}>
                          {stock.toLocaleString('id-ID')}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {keys.length === 0 && (
          <div className="rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4 text-sm text-[#6B8A8A]">
            Data untuk kategori ini tidak tersedia.
          </div>
        )}
      </div>

      {/* ⚡ RINGKASAN KONSUMSI LISTRIK SEKTOR PRODUKSI & PEMBANGUNAN */}
      {(() => {
        let totalCategoryElectricityConsumption = 0;
        keys.forEach((key) => {
          const count = Number(countryDetail?.[key]) || 0;
          const bMeta = findMeta(key) || {};
          const konsumsiUnit = Number(bMeta?.konsumsi_listrik) || 0;
          totalCategoryElectricityConsumption += count * konsumsiUnit;
        });

        return (
          <div className="mt-6 p-4 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/30 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#00FFAA] uppercase tracking-wider">
                ⚡ Total Konsumsi Listrik {title}
              </span>
            </div>
            <div className="px-4 py-1.5 rounded-lg bg-[#0F2424] border border-rose-500/30">
              <span className="text-sm font-black text-rose-400">
                {Math.round(totalCategoryElectricityConsumption).toLocaleString('id-ID')} MW
              </span>
            </div>
          </div>
        );
      })()}

      {/* MODAL REKOMENDASI AI SEKTOR PRODUKSI */}
      <ProductionAISuggestionsModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        analysis={aiAnalysisResult}
        countryDetail={countryDetail}
        metadata={metadata}
        onBuildClick={(key, label, quantity) => {
          setIsAIModalOpen(false);
          onBuildClick(key, label, quantity);
        }}
      />
    </div>
  );
}