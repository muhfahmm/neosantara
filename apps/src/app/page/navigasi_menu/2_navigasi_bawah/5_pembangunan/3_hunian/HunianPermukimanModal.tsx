"use client";
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { fetchBuildingMetadata } from '../../../../../../lib/buildingMetadata';
import { getBuildingCardImage } from "../../buildingCardImages";
import { X, Home, TrendingUp, TrendingDown, Hammer, AlertCircle, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalSidebarLayout from "@/app/page/root_modals_design_menu/RootModalSidebarLayout";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";
import { RootAISuggestionsButton } from "@/app/page/root_modals_design_menu/RootAISuggestionsModal";
import ServiceAISuggestionsModal from "../ai_suggestions/ServiceAISuggestionsModal";
import { generateHunianAIAnalysis } from "../ai_suggestions/serviceAISuggestionsLogic";
import InfoBangunanModal from "./1_modals_info_bangunan/info_bangunan_modals";
import KonfirmasiPembangunanModal from "./2_modals_konfirmasi_pembangunan/modalsKonfirmasiPembangunan";
import {
  useMaterialProduction,
  getMaterialStock as getMaterialStockFromBuildLogic,
  deductBuildingMaterials,
  calculateMaxBuildQuantity,
  getBulkBuildQuantityTarget,
} from "../build_logic/build_logic";
import { getCountryConsumptionBreakdown } from "../../3_produksi_konsumsi/1_grid_nasional/consumptionLogic";
import {
  getTotalHousingCapacityBonusPercent,
  applyTotalHousingCapacityBonus,
} from "@/app/page/bonus_logic";
import { BuildingCardRoot } from "@/app/page/root_modals_design_menu/card_building_root";
import { recordFacilityMissionProgress } from "@/app/page/menus/mission/missionModals";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
import { roundNeo } from "@/app/logic/economic_logic/neoCurrency";

const DEFAULT_ELECTRICITY_CONSUMPTION: Record<string, number> = {
  rumah_subsidi: 0.0009,
  apartemen: 0.0022,
  mansion: 0.0055,
};

// 🟢 IMPOR REQUIREMENTS
import * as perumahanSubsidiRequirements from "./construction_support/1_perumahan_subsidi/requirements";
import * as apartemenRequirements from "./construction_support/2_apartement/requirements";
import * as mansionRequirements from "./construction_support/3_mansion/requirements";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  onGotoProduction?: (tab: string, key: string) => void;
  currentDate?: string | Date;
  initialTab?: string;
}

interface MaterialRequirement {
  resourceKey: string;
  label: string;
  group: string;
  amount?: number;
}

interface BuildingRequirements {
  requirements: MaterialRequirement[];
}

const REQUIREMENTS_MODULES: Record<string, any> = {
  rumah_subsidi: perumahanSubsidiRequirements,
  perumahan_subsidi: perumahanSubsidiRequirements,
  apartemen: apartemenRequirements,
  mansion: mansionRequirements,
};

const CARD_TAB_MAP: Record<string, string> = {
  kayu: 'manufaktur',
  semen_beton: 'manufaktur',
  batu_bata: 'manufaktur',
  bijih_besi: 'mineral',
  gas_alam: 'mineral',
  emas: 'mineral',
  uranium: 'mineral',
  batu_bara: 'mineral',
  minyak_bumi: 'mineral',
  garam: 'mineral',
  litium: 'mineral',
  logam_tanah_jarang: 'mineral',
  pabrik_semikonduktor: 'manufaktur',
  pabrik_mesin: 'manufaktur',
  pabrik_besi: 'manufaktur',
};

const RESOURCE_KEY_ALIASES: Record<string, string> = {};
const normalizeResourceKey = (key: string) => RESOURCE_KEY_ALIASES[key] || key;

// Utility safeNumber & formatNumber
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

const formatNumber = (value: any) => {
  const parsed = safeNumber(value);
  return Number.isFinite(parsed) ? parsed.toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '0';
};

export default function HunianPermukimanModal({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
  onGotoProduction,
  currentDate,
  initialTab,
}: ModalProps) {
  const { t } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_construction_housing.${key}`, params);
  const translateConfirmation = (key: string, params?: Record<string, string | number>) => {
    if (key.startsWith("materials.")) {
      const resourceKey = key.slice("materials.".length);
      const rewardKey = `side_reward.items.${resourceKey}`;
      const translated = t(rewardKey);
      return translated === rewardKey ? key : translated;
    }
    return tr(`confirmation.${key}`, params);
  };
  const [activeTab, setActiveTab] = useState(initialTab || "rumah_subsidi");
  const [selectedItemInfo, setSelectedItemInfo] = useState<{
    title: string;
    baseCapacity: number;
    effectiveCapacity: number;
    bonusPercent: number;
  } | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [selectedBuilding, setSelectedBuilding] = useState<{ key: string; label: string } | null>(null);
  const [initialBuildQty, setInitialBuildQty] = useState<number>(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showMaterialWarningModal, setShowMaterialWarningModal] = useState(false);
  const [insufficientMaterials, setInsufficientMaterials] = useState<MaterialRequirement[]>([]);
  const [hoveredBuildingKey, setHoveredBuildingKey] = useState<string | null>(null);

  // 🤖 AI Suggestions State
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);

  const handleOpenAIModal = () => {
    setIsAIModalOpen(true);
  };

  const handleAIBuildClick = (buildingKey: string, label: string, qty?: number) => {
    const bMeta = findMeta(buildingKey);
    const buildLabel = label || bMeta?.label || buildingKey.replace(/_/g, " ").toUpperCase();
    setInitialBuildQty(qty || 1);
    setSelectedBuilding({ key: buildingKey, label: buildLabel });
    setShowConfirm(true);
    setIsAIModalOpen(false);
  };

  const { safeDateString } = useMaterialProduction(
    countryDetail,
    setCountryDetail,
    metadata,
    currentDate
  );

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

  useEffect(() => {
    if (!isOpen) return;
    fetchBuildingMetadata().then((m) => setMetadata(m || {}));
  }, [isOpen]);

  if (!isOpen) return null;

  const getSelectedBuildingRequirements = (): BuildingRequirements | undefined => {
    if (!selectedBuilding) return undefined;
    const module = REQUIREMENTS_MODULES[activeTab];
    return module?.findRequirements?.(selectedBuilding.key) || module?.findRequirements?.(activeTab);
  };

  const getMaterialStock = (resourceKey: string): number => {
    return getMaterialStockFromBuildLogic(countryDetail, resourceKey);
  };

  const handleMaterialClick = (resourceKey: string, label: string) => {
    const normalizedKey = normalizeResourceKey(resourceKey);
    const tabId = CARD_TAB_MAP[normalizedKey];
    if (!tabId) {
      setToast(tr("warning.materialTabMissing", { material: label }));
      setTimeout(() => setToast(null), 2000);
      return;
    }
    setShowConfirm(false);
    setSelectedBuilding(null);
    setToast(tr("warning.materialProducedInTab", { material: label, tab: tabId.toUpperCase() }));
    setTimeout(() => setToast(null), 2500);
    onGotoProduction?.(tabId, normalizedKey);
  };

  const handleBuild = (key: string, label: string) => {
    setShowMaterialWarningModal(false);
    setInsufficientMaterials([]);
    setSelectedBuilding({ key, label });
    setShowConfirm(true);
  };

  const confirmBuild = (buildQuantity: number = 1) => {
    if (!selectedBuilding) return;
    const { key, label } = selectedBuilding;
    const bMeta = metadata[key] || {};

    const buildingReq = getSelectedBuildingRequirements();
    const requirements = buildingReq?.requirements || [];
    const quantity = Number.isFinite(buildQuantity) ? Math.max(1, Math.floor(buildQuantity)) : 1;
    const missingMaterials = requirements.filter(
      (material) => getMaterialStock(material.resourceKey) < (Number(material.amount) || 0) * quantity
    );

    if (missingMaterials.length > 0) {
      setInsufficientMaterials(missingMaterials);
      setShowMaterialWarningModal(true);
      return;
    }

    const originalCost = Number(bMeta.biaya_pembangunan) || 0;
    const cost = originalCost;
    const anggaran = Number(countryDetail?.anggaran) || 0;
    const materialStocks = requirements.reduce<Record<string, number>>((stocks, material) => {
      stocks[material.resourceKey] = getMaterialStock(material.resourceKey);
      return stocks;
    }, {});
    const maxQuantity = calculateMaxBuildQuantity(
      cost,
      anggaran,
      requirements,
      materialStocks,
      getBulkBuildQuantityTarget(originalCost)
    );
    if (quantity > maxQuantity) {
      setToast(tr("warning.budgetOrMaterials", { max: maxQuantity }));
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const totalCost = roundNeo(cost * quantity);
    if (anggaran < totalCost) {
      setToast(tr("warning.insufficientFunds", { count: quantity, building: label }));
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const updatedDetail = deductBuildingMaterials(
      {
        ...countryDetail,
        anggaran: anggaran - totalCost,
        [key]: (Number(countryDetail?.[key]) || 0) + quantity,
        kepuasan: Math.min(100, (Number(countryDetail?.kepuasan) || 65.0) + (1.5 * quantity))
      },
      requirements,
      quantity
    );

    setCountryDetail(updatedDetail);
    recordFacilityMissionProgress(key, quantity);
    
    setShowConfirm(false);
    setSelectedBuilding(null);
    setToast(tr("warning.built", { count: quantity, building: label }));
    setTimeout(() => setToast(null), 2500);
  };

  const HUNIAN_KEYS = ["rumah_subsidi", "apartemen", "mansion"];
  const items = HUNIAN_KEYS.map((k) => {
    return {
      key: k,
      label: tr(`buildings.${k}`),
      detailDesc: tr(`descriptions.${k}`),
      value: Number(countryDetail?.[k]) || 0
    };
  });

  const getLabel = (k: string) => tr(`buildings.${k}`);

  const activeItem = items.find((it) => it.key === activeTab) || items[0];

  const aiAnalysisResult = useMemo(() => {
    if (!activeItem) return null;
    return generateHunianAIAnalysis(activeItem.key, activeItem.label, countryDetail, metadata);
  }, [activeItem, countryDetail, metadata]);
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const population = safeNumber(countryDetail?.jumlah_penduduk);

  // --- Hitung total kapasitas ---
  const DEFAULT_CAPACITIES: Record<string, number> = {
    rumah_subsidi: 5,
    apartemen: 6000,
    mansion: 10,
  };

  const housingBonusPercent = useMemo(() => {
    return getTotalHousingCapacityBonusPercent(countryDetail);
  }, [countryDetail]);

  const totalCapacity = useMemo(() => {
    let cap = 0;
    HUNIAN_KEYS.forEach((key) => {
      const count = Number(countryDetail?.[key]) || 0;
      const bMeta = findMeta(key);
      const baseCap = Number(bMeta?.kapasitas) || DEFAULT_CAPACITIES[key] || 0;
      const effectiveCap = applyTotalHousingCapacityBonus(baseCap, countryDetail);
      cap += count * effectiveCap;
    });
    return cap;
  }, [countryDetail, metadata]);

  const shortage = Math.max(0, population - totalCapacity);
  const isSufficient = totalCapacity >= population;
  const percentageMet = population > 0 ? Math.min(100, (totalCapacity / population) * 100) : 0;

  const capacityBreakdown = useMemo(() => {
    return HUNIAN_KEYS.map((key) => {
      const count = Number(countryDetail?.[key]) || 0;
      const bMeta = findMeta(key);
      const baseCap = Number(bMeta?.kapasitas) || DEFAULT_CAPACITIES[key] || 0;
      const effectiveCap = applyTotalHousingCapacityBonus(baseCap, countryDetail);
      const total = count * effectiveCap;
      return {
        key,
        label: getLabel(key),
        count,
        baseCapacityPerUnit: baseCap,
        capacityPerUnit: effectiveCap,
        totalCapacity: total,
        percentage: population > 0 ? (total / population) * 100 : 0,
      };
    });
  }, [countryDetail, population, metadata]);

  const housingSatisfaction = useMemo(() => {
    if (population <= 0) return 50;
    if (totalCapacity <= 0) return 1;
    const ratio = Math.min(totalCapacity / population, 1);
    return Math.min(100, Math.max(1, Math.round(ratio * 100)));
  }, [totalCapacity, population]);

  useEffect(() => {
    if (setCountryDetail && countryDetail) {
      if (countryDetail.tunawisma !== shortage || countryDetail?.satisfaction?.housing !== housingSatisfaction) {
        setCountryDetail({
          ...countryDetail,
          tunawisma: shortage,
          satisfaction: {
            ...(countryDetail?.satisfaction || {}),
            housing: housingSatisfaction,
          }
        });
      }
    }
  }, [shortage, housingSatisfaction]);

  // --- LOGIKA LISTRIK DINAMIS (terpusat via consumptionLogic) ---
  const { totalProductionMW, totalAllBreakdownConsumption } = useMemo(() => {
    return getCountryConsumptionBreakdown(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const estimatedConsumption = Math.round(totalAllBreakdownConsumption);


  return (
    <>
      {/* MODAL UTAMA */}
      <NotebookModalWrapper onClose={onClose}>
        <div className="root-modal-util-b74379da23 building-modal-layout">

          {/* HEADER */}
          <div className="satisfaction-modal-header root-modal-util-9462ce2345">
            <div className="satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar">
              <div className="root-modal-util-08dfbca033">
                <div className="root-modal-util-739d92b232">
                  <Home aria-hidden="true" className="root-modal-util-d252947d10" />
                </div>
                <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                  {tr("title")}
                </h2>
              </div>
            </div>
            <div className="root-modal-util-08dfbca033">
              <button
                type="button"
                onClick={() => {
                  if (!activeItem) return;
                  const activeMeta = findMeta(activeItem.key);
                  const baseCapacity = Number(activeMeta?.kapasitas) || DEFAULT_CAPACITIES[activeItem.key] || 0;
                  setSelectedItemInfo({
                    title: tr("actions.groupInfo", { building: tr(`buildings.${activeItem.key}`) }),
                    baseCapacity,
                    effectiveCapacity: applyTotalHousingCapacityBonus(baseCapacity, countryDetail),
                    bonusPercent: housingBonusPercent,
                  });
                }}
                aria-label={tr("actions.groupInfo", { building: activeItem?.label ?? "" })}
                title={tr("actions.groupInfo", { building: activeItem?.label ?? "" })}
                className="root-modal-info-button root-modal-util-1697100c43"
              >
                <Info aria-hidden="true" />
              </button>
              <SharedModalCloseButton onClick={onClose} />
            </div>
          </div>

          <RootModalSidebarLayout
            ariaLabel={tr("ariaLabel")}
            className="building-modal-body"
            sidebarClassName="building-modal-tabs"
            contentClassName="building-modal-content flex flex-col justify-between p-4 sm:p-5 lg:p-6"
            items={items.map((it) => ({
              id: it.key,
              isActive: activeTab === it.key,
              onSelect: () => setActiveTab(it.key),
              label: tr(`tabs.${it.key}`),
            }))}
          >
              <div>
                {activeItem && (
                  <div className="max-w-3xl">
                    <div className="mb-4 sm:mb-6 bg-root-canvas/60 p-3 sm:p-4 rounded-2xl border border-root-accent/20">
                      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
                        <div className="flex-1 min-w-[180px]">
                          <h3 className={`${rootModalTypography.sectionTitle} !text-root-accent font-black uppercase tracking-wider`}>{activeItem.label}</h3>
                        </div>

                        <RootAISuggestionsButton
                          onClick={handleOpenAIModal}
                          title={tr("actions.aiSuggestions")}
                        />
                      </div>
                      <p className="text-[11px] sm:text-xs text-root-text mt-3 leading-relaxed bg-root-canvas border border-root-accent/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl">{activeItem.detailDesc}</p>
                    </div>

                    <BuildingCardRoot
                      role="button"
                      tabIndex={0}
                      aria-label={tr("actions.build", { building: activeItem.label })}
                      onClick={() => handleBuild(activeItem.key, activeItem.label)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleBuild(activeItem.key, activeItem.label);
                        }
                      }}
                      className="housing-building-card flex flex-col justify-between w-28 sm:w-32 lg:w-40 p-2 sm:p-2.5 cursor-pointer"
                    >
                      {hoveredBuildingKey === activeItem.key && (() => {
                        const bMeta = findMeta(activeItem.key) || {};
                        const perCount = activeItem.value || 0;
                        const konsumsiUnit = Number(bMeta?.konsumsi_listrik) || DEFAULT_ELECTRICITY_CONSUMPTION[activeItem.key] || 0;
                        const biaya = Number(bMeta?.biaya_pembangunan) || 0;
                        const waktu = bMeta?.waktu_pembangunan;

                        return (
                          <InfoBangunanModal
                            label={activeItem.label}
                            perCount={perCount}
                            konsumsiUnit={konsumsiUnit}
                            biaya={biaya}
                            waktu={waktu}
                            onClose={() => setHoveredBuildingKey(null)}
                          />
                        );
                      })()}

                      <div>
                        <div className="building-card-header flex items-start justify-between mb-1.5 sm:mb-2">
                          <p className="building-card-label min-w-0 text-[9px] sm:text-[10px] font-black uppercase text-root-subtle tracking-wider flex-1 pr-1.5 leading-snug">
                            {activeItem.label}
                          </p>
                          <button
                            className="building-card-info-button flex-shrink-0 flex items-center justify-center rounded-full transition-colors cursor-pointer bg-root-surface border border-root-accent/30 hover:border-root-accent text-root-subtle hover:text-root-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHoveredBuildingKey(hoveredBuildingKey === activeItem.key ? null : activeItem.key);
                            }}
                            title={tr("actions.buildingInfo")}
                          >
                            <Info />
                          </button>
                        </div>

                        <div className="building-card-image-quantity-row flex flex-col items-center justify-center gap-1">
                          {getBuildingCardImage(activeItem.key) && (
                            <Image
                              src={getBuildingCardImage(activeItem.key)!}
                              alt=""
                              width={104}
                              height={104}
                              className="building-card-image housing-building-image h-10 w-10 sm:h-12 sm:w-12 shrink-0 object-contain"
                            />
                          )}
                        </div>
                      </div>

                      <div className="building-card-footer flex min-w-0 shrink-0 items-center justify-center gap-1 border-t border-root-accent/10 pt-1 text-center mt-1">
                        <p className="building-card-count text-xs sm:text-sm lg:text-base font-black text-root-text leading-tight">
                          {activeItem.value.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </BuildingCardRoot>
                    </div>
                )}
              </div>

              {/* FOOTER STATISTIK */}
            </RootModalSidebarLayout>
        </div>
      </NotebookModalWrapper>

      <MenuInfoModal
        isOpen={selectedItemInfo !== null}
        onClose={() => setSelectedItemInfo(null)}
        title={selectedItemInfo?.title ?? ""}
      >
        {selectedItemInfo && (
          <div className="-mt-2 space-y-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-root-subtle">{tr("info.totalHousingUnits")}</p>
                <p className="root-housing-capacity-value text-root-accent">{totalValue.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-root-subtle">{tr("info.population")}</p>
                <p className="root-housing-capacity-value text-root-text">{formatNumber(population)} {tr("actions.people")}</p>
              </div>
              <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-root-subtle">{tr("info.standardAICapacity")}</p>
                  {selectedItemInfo.bonusPercent > 0 && (
                    <span className="rounded border border-root-accent/40 bg-root-accent/20 px-1.5 py-0.5 text-[8px] font-black text-root-accent">
                      {tr("info.bonus", { percent: selectedItemInfo.bonusPercent })}
                    </span>
                  )}
                </div>
                <p className="root-housing-capacity-value mt-1 flex flex-wrap items-center gap-1.5 text-root-text">
                  <span>{tr("info.oneUnit")}</span>
                  {selectedItemInfo.effectiveCapacity !== selectedItemInfo.baseCapacity && (
                    <span className="font-bold text-rose-400 line-through">
                      {selectedItemInfo.baseCapacity.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                    </span>
                  )}
                  <span className="text-root-accent">
                    {selectedItemInfo.effectiveCapacity.toLocaleString("id-ID", { maximumFractionDigits: 2 })} {tr("actions.people")}
                  </span>
                </p>
              </div>
            </div>

            <section className="rounded-xl border border-root-accent/30 bg-root-canvas p-3 sm:p-4">
              <h3 className={`${rootModalTypography.sectionTitle} !text-root-accent flex items-center gap-2`}>
                <Home aria-hidden="true" className="h-4 w-4 shrink-0 text-root-accent" />
                {tr("info.capacityVsNeed")}
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                <div className="flex flex-col justify-between rounded-lg border border-root-accent/20 bg-root-surface p-2.5">
                  <p className="text-[8px] font-bold uppercase text-root-subtle">{tr("info.totalCapacity")}</p>
                  <p className="root-housing-capacity-value text-emerald-400">
                    {totalCapacity.toLocaleString('id-ID', { maximumFractionDigits: 2 })} <span className="text-[8px] font-bold text-root-subtle">{tr("actions.person")}</span>
                  </p>
                </div>
                <div className="flex flex-col justify-between rounded-lg border border-root-accent/20 bg-root-surface p-2.5">
                  <p className="text-[8px] font-bold uppercase text-root-subtle">{tr("info.populationNeed")}</p>
                  <p className={`root-housing-capacity-value ${isSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {population.toLocaleString('id-ID', { maximumFractionDigits: 2 })} <span className={`text-[8px] font-bold ${isSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>{tr("actions.person")}</span>
                  </p>
                </div>
                <div className={`flex flex-col justify-between rounded-lg border p-2.5 ${isSufficient ? 'border-emerald-500/30 bg-root-surface' : 'border-rose-500/30 bg-root-surface'}`}>
                  <p className="text-[8px] font-bold uppercase text-root-subtle">
                    {isSufficient ? tr("info.housingSurplus") : tr("info.homelessShortage")}
                  </p>
                  <p className={`root-housing-capacity-value ${isSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isSufficient
                      ? `+${(totalCapacity - population).toLocaleString('id-ID', { maximumFractionDigits: 2 })}`
                      : `-${shortage.toLocaleString('id-ID', { maximumFractionDigits: 2 })}`}
                    <span className={`text-[8px] font-bold block ${isSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isSufficient ? ` ${tr("info.surplus")}` : ` ${tr("info.homeless")}`}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col justify-between rounded-lg border border-root-accent/20 bg-root-surface p-2.5">
                  <p className="text-[8px] font-bold uppercase text-root-subtle">{tr("info.coverage")}</p>
                  <p className={`root-housing-capacity-value ${percentageMet >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {percentageMet.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="mt-3">
                {capacityBreakdown.filter((item) => item.key === activeTab).map((item) => (
                  <div
                    key={item.key}
                    className="root-housing-capacity-breakdown rounded-xl border border-root-accent bg-root-accent/10 p-3 sm:p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-1">
                      <p className="root-housing-breakdown-title font-black uppercase tracking-wider text-root-accent">
                        {item.label}
                      </p>
                      <span className="root-housing-breakdown-badge shrink-0 rounded-md bg-root-accent px-2 py-0.5 font-black uppercase text-root-canvas">
                        {tr("info.activeCategory")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="flex flex-col justify-between rounded-lg border border-root-accent/20 bg-root-surface p-2.5">
                        <span className="root-housing-breakdown-label font-bold uppercase text-root-subtle">{tr("info.registeredUnits")}</span>
                        <span className="root-housing-breakdown-value mt-1 font-black text-root-text">{item.count.toLocaleString('id-ID', { maximumFractionDigits: 2 })} {tr("actions.unit")}</span>
                      </div>
                      <div className="flex flex-col justify-between rounded-lg border border-root-accent/20 bg-root-surface p-2.5">
                        <span className="root-housing-breakdown-label font-bold uppercase text-root-subtle">{tr("info.unitCapacity")}</span>
                        <div className="mt-1 flex items-center gap-1.5">
                          {housingBonusPercent > 0 && item.capacityPerUnit !== item.baseCapacityPerUnit && (
                            <span className="root-housing-breakdown-previous-value font-bold text-rose-400 line-through opacity-80">
                              {item.baseCapacityPerUnit.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                            </span>
                          )}
                          <span className="root-housing-breakdown-value font-black text-root-text">
                            {item.capacityPerUnit.toLocaleString('id-ID', { maximumFractionDigits: 2 })} {tr("actions.people")}/{tr("actions.unit")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between rounded-lg border border-root-accent/20 bg-root-surface p-2.5">
                        <span className="root-housing-breakdown-label font-bold uppercase text-root-subtle">{tr("info.totalCategoryCapacity")}</span>
                        <span className="root-housing-breakdown-value mt-1 font-black text-root-accent">{item.totalCapacity.toLocaleString('id-ID', { maximumFractionDigits: 2 })} {tr("actions.people")}</span>
                      </div>
                    </div>

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full border border-root-accent/10 bg-root-canvas">
                      <div
                        className="h-full rounded-full bg-root-accent transition-all duration-300"
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                    <p className="root-housing-breakdown-note mt-1.5 font-semibold text-root-subtle">
                      {tr("info.accommodates", { percent: item.percentage.toFixed(1) })}
                    </p>
                  </div>
                ))}
              </div>

              {!isSufficient && (
                <div className="mt-3 rounded-xl border border-rose-500/30 bg-root-surface p-3 text-xs font-bold text-rose-400">
                  {tr("actions.shortage", {
                    count: shortage.toLocaleString('id-ID', { maximumFractionDigits: 2 }),
                    percent: Math.round(100 - percentageMet),
                  })}
                </div>
              )}
            </section>
            <div className="root-satisfaction-index rounded-xl border border-root-accent/30 bg-root-canvas p-4 shadow-md">
              <div className="flex items-center justify-between gap-3">
                <span className="root-satisfaction-index-title font-black uppercase tracking-wider text-root-subtle">
                  {tr("info.satisfactionHousing")}
                </span>
                <span className="root-satisfaction-index-value shrink-0 font-black text-root-accent">
                  {housingSatisfaction} / 100
                </span>
              </div>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full border border-root-accent/20 bg-root-surface">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    housingSatisfaction <= 40
                      ? "bg-rose-500"
                      : housingSatisfaction <= 75
                        ? "bg-amber-400"
                        : "bg-root-accent"
                  }`}
                  style={{ width: `${housingSatisfaction}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </MenuInfoModal>

      {/* TOAST */}
      {toast && <div className="fixed bottom-6 right-6 z-[80] bg-root-accent text-root-canvas font-black px-4 py-2 rounded-lg shadow-lg border border-root-accent">{toast}</div>}
      
      {/* KONFIRMASI PEMBANGUNAN */}
      {showConfirm && selectedBuilding && (() => {
        const bMeta = metadata[selectedBuilding.key] || {};
        const originalCost = Number(bMeta.biaya_pembangunan) || 0;
        const cost = originalCost;
        const buildingReq = getSelectedBuildingRequirements();
        const requirements = buildingReq?.requirements || [];
        const missingMaterials = requirements.filter(
          (mat) => getMaterialStock(mat.resourceKey) < (Number(mat.amount) || 0)
        );

        const materialStocks: Record<string, number> = {};
        requirements.forEach((mat) => {
          materialStocks[mat.resourceKey] = getMaterialStock(mat.resourceKey);
        });

        return (
          <KonfirmasiPembangunanModal
            isOpen={true}
            onClose={() => { setShowConfirm(false); setSelectedBuilding(null); setInitialBuildQty(1); }}
            buildingLabel={selectedBuilding.label}
            buildingDescription={bMeta?.deskripsi || bMeta?.desc}
            cost={cost}
            waktuPembangunan={bMeta?.waktu_pembangunan}
            dampakKepuasan={1.5}
            konsumsiListrik={bMeta?.konsumsi_listrik}
            requirements={requirements}
            materialStocks={materialStocks}
            anggaran={Number(countryDetail?.anggaran) || 0}
            missingMaterials={missingMaterials}
            onConfirm={confirmBuild}
            onMaterialClick={handleMaterialClick}
            loadingMetadata={false}
            initialQuantity={initialBuildQty}
            quantityTarget={getBulkBuildQuantityTarget(originalCost)}
            translate={translateConfirmation}
          />
        );
      })()}

      {/* MODAL PERINGATAN MATERIAL */}
      {showMaterialWarningModal && insufficientMaterials.length > 0 && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-transparent pointer-events-none">
          <div className="modal-responsive-shell bg-root-surface border border-root-accent/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto">
            <div className="px-6 py-5 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas relative z-10">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-base font-black uppercase tracking-wider">⚠️ {tr("warning.emptyMaterials")}</h3>
              </div>
              <SharedModalCloseButton onClick={() => setShowMaterialWarningModal(false)} className="text-root-subtle hover:text-root-accent" appearance="custom">
                <X className="h-5 w-5" />
              </SharedModalCloseButton>
            </div>
            <div className="p-6 relative z-10 flex-1 space-y-4">
              <p className="text-sm text-root-text">
                {tr("warning.cannotContinue", { building: selectedBuilding?.label || "" })}
              </p>
              <div className="bg-root-canvas border border-rose-500/30 rounded-xl p-4 flex flex-col gap-2 text-xs font-bold text-root-text">
                {insufficientMaterials.map((mat, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-root-text">{mat.label}</span>
                    <span className="text-rose-400 font-black">0</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-root-subtle italic">
                {tr("warning.clickMaterial")}
              </p>
            </div>
            <div className="p-4 bg-root-canvas border-t border-root-accent/20 flex justify-end relative z-10">
              <SharedModalCloseButton onClick={() => setShowMaterialWarningModal(false)} className="py-2.5 px-6 rounded-xl text-xs font-black uppercase transition-all text-center cursor-pointer bg-root-accent text-root-canvas hover:bg-root-accent/80 shadow-md" appearance="custom">{tr("warning.closeAndRestock")}</SharedModalCloseButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rekomendasi AI Hunian Permukiman */}
      {isAIModalOpen && (
        <ServiceAISuggestionsModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          hunianAnalysis={aiAnalysisResult}
          onBuildClick={handleAIBuildClick}
        />
      )}
    </>
  );
}