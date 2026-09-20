// BaseProduksiGrid.tsx
"use client";
import React from "react";
import { Info } from "lucide-react";
import { getKelistrikanFuelRequirements } from "./requirements_logic/1_produksi/1_kelistrikan/fuelLogic";
import { getDaysElapsed, formatDate } from '@/app/logic/production_logic';
import InfoBangunan from "./1_modals_info_bangunan/info_bangunan_modals";
import { getMaterialStock } from "../build_logic/build_logic";
import {
  FOOD_CONSUMPTION_PER_CAPITA,
  calculateProduction,
  calculateConsumption,
} from "../../3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic";

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
  onBuildClick: (key: string, label: string) => void;
  hoveredBuildingKey: string | null;
  setHoveredBuildingKey: (key: string | null) => void;
  isBuildingAvailable?: (buildingKey: string, countryName: string) => boolean;
  isElectricityTab: boolean;
  highlightedCardKey?: string | null;
  ongoingConstructions?: any[];
  currentDate?: string | Date;
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

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Icon className="h-6 w-6 text-[#5c3c10]" />
        <h3 className="text-lg font-black text-[#5c3c10] uppercase tracking-wide">{title}</h3>
      </div>

      <div className="grid grid-cols-4 gap-4">
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
              className={`relative rounded-2xl overflow-visible flex flex-col flex-grow justify-between transition-all bg-white/90 border shadow-sm ${
                isAvailable ? 'border-[#C4B49C]/30 hover:shadow-md cursor-pointer' : 'border-rose-300 bg-rose-50/60 opacity-90 cursor-not-allowed'
              } ${isHighlighted ? 'border-emerald-500 border-2 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]' : ''}`}
            >
              {/* Badge Tanggal */}
              {isBuilding && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#2e261a] text-[#FAF6EE] text-[10px] font-bold px-2 py-1 border border-[#C4B49C] rounded-sm shadow-md tracking-wider whitespace-nowrap">
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
                />
              )}

              <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-[10px] font-black uppercase text-[#8b7e66] tracking-wider">{label}</p>
                    <button
                      className={`flex items-center justify-center w-5 h-5 rounded-full transition-colors cursor-pointer ${
                        isFuelResource ? 'bg-[#7f1d1d]/10 hover:bg-[#7f1d1d]/20 text-[#7f1d1d]' : 'bg-[#5c3c10]/10 hover:bg-[#5c3c10]/20 text-[#5c3c10]'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHoveredBuildingKey(hoveredBuildingKey === key ? null : key);
                      }}
                      title="Info bangunan"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Indikator +1, +2 */}
                  <div className="flex items-end gap-1.5 mt-2 flex-wrap">
                    <span className="text-base sm:text-lg lg:text-xl font-black text-[#2e261a] leading-tight break-words">{perCount}</span>
                    {isBuilding && (
                      <span className="text-xs sm:text-sm font-bold text-emerald-600 leading-none">
                        +{queueCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] mt-1 font-bold text-[#8b7e66]">{perCount} bangunan</p>
                </div>

                {/* FOOTER LISTRIK */}
                {isElectricityTab && (
                  <div className="border-t border-[#C4B49C]/20 mt-auto pt-2 pb-1 text-center min-h-[64px] flex flex-col justify-center">
                    <span className={`font-black text-xs sm:text-sm lg:text-base leading-tight break-words ${isProductionZero ? 'text-rose-600' : 'text-[#2e261a]'}`}>
                      {rawProduction.toLocaleString('id-ID')} MW
                    </span>
                    {isProductionZero && (
                      <span className="text-[9px] font-bold text-rose-500">(bahan bakar defisit)</span>
                    )}
                  </div>
                )}

                {/* FOOTER NON-LISTRIK */}
                {!isElectricityTab && (
                  <div className="border-t border-[#C4B49C]/20 mt-auto pt-2 pb-1 text-center min-h-[64px] flex flex-col justify-center gap-1">
                    {(() => {
                      // Emas: tampilkan produksi tetap (tidak berubah-ubah seperti stok)
                      if (key === 'emas') {
                        const fixedProd = Number(bMeta?.produksi || 0) * perCount;
                        return (
                          <span className="font-black text-xs sm:text-sm lg:text-base text-[#2e261a] leading-tight break-words">
                            {fixedProd.toLocaleString('id-ID')}
                          </span>
                        );
                      }

                      const isFoodCommodity = FOOD_CONSUMPTION_PER_CAPITA[key] !== undefined;
                      if (isFoodCommodity) {
                        // Baca inventory yang sudah diakumulasi (Netto harian ditambah setiap hari)
                        const accumulated = getMaterialStock(countryDetail, key);
                        return (
                          <>
                            <span className="font-black text-xs sm:text-sm lg:text-base text-[#2e261a] leading-tight break-words">
                              {accumulated.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                            </span>
                          </>
                        );
                      }

                      const stock = getMaterialStock(countryDetail, key);
                      const isFuel = ELECTRICITY_FUEL_RESOURCE_KEYS.includes(key);
                      const colorClass = (isFuel && stock > 0) ? 'text-emerald-600' : 'text-[#2e261a]';
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
          <div className="rounded-xl border border-[#C4B49C]/30 bg-[#FAF6EE] p-4 text-sm text-[#8b7e66]">
            Data untuk kategori ini tidak tersedia.
          </div>
        )}
      </div>
    </div>
  );
}