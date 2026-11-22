// ProduksiModal.tsx
"use client";
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Hammer, TrendingUp, TrendingDown, AlertCircle, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalSidebarLayout from "@/app/page/root_modals_design_menu/RootModalSidebarLayout";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";
import { useViewportMode } from "@/app/hooks/useViewportMode";
import { fetchBuildingMetadata } from '../../../../../../lib/buildingMetadata';
import { isBuildingAvailable } from '../../../../../logic';
import { calculateProductionIncrement, formatDate, getDaysElapsed } from '../../../../../logic/production_logic';
import { logger } from '../../../../../../lib/logger';
import { recordBuildingProgress } from '../../../../menus/mission/missionModals';

import KelistrikanTab from "./card_data/1_kelistrikan";
import MineralEnergiTab from "./card_data/2_mineral_energi";
import ManufakturTab from "./card_data/3_manufaktur";
import PeternakanTab from "./card_data/4_peternakan";
import AgrikulturTab from "./card_data/5_agrikultur";
import PerikananTab from "./card_data/6_perikanan";
import OlahanPanganTab from "./card_data/7_olahan_pangan";

import * as kelistrikanRequirements from "./construction_support/1_produksi/1_kelistrikan/requirements";
import * as mineralKritisRequirements from "./construction_support/1_produksi/2_mineral_kritis/requirements";
import * as manufakturRequirements from "./construction_support/1_produksi/3_manufaktur/requirements";
import * as peternakanRequirements from "./construction_support/1_produksi/4_peternakan/requirements";
import * as agrikulturRequirements from "./construction_support/1_produksi/5_agrikultur/requirements";
import * as perikananRequirements from "./construction_support/1_produksi/6_perikanan/requirements";
import * as olahanPanganRequirements from "./construction_support/1_produksi/7_olahan_pangan/requirements";

import { getKelistrikanFuelRequirements } from "./construction_support/1_produksi/1_kelistrikan/fuelLogic";
import KonfirmasiPembangunanModal from "./2_modals_konfirmasi_pembangunan/modalsKonfirmasiPembangunan";
import {
  useMaterialProduction,
  getMaterialStock as getMaterialStockFromBuildLogic,
  deductBuildingMaterials,
  calculateMaxBuildQuantity,
  getBulkBuildQuantityTarget,
} from "../build_logic/build_logic";
import { getCountryConsumptionBreakdown } from "../../3_produksi_konsumsi/1_grid_nasional/consumptionLogic";
import { getEconomicEmbargoIncomeMultiplier, getEconomicEmbargoProductionMultiplier } from "../../7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic";
import { loadActiveResolutions, isPassedResolutionActive, normalizePbbCountryName } from "../../7_geopolitik/1_PBB/1_resolusi_PBB/logic/resolusiPBBUILogic";
import { loadActiveSecurityCouncilItems } from "../../7_geopolitik/1_PBB/2_keamanan_PBB/logic/keamananPBBUILogic";
import {
  getEffectiveBuildTime,
  getProductionBonusMultiplier,
  getKementerianPendidikanProductionBonusPercent,
  getKementerianPembangunanBuildSpeedBonusPercent,
} from "../../../../bonus_logic";
import { applyJewishConstructionTimeDiscount } from "../../../../bonus_logic/agama_bonus_logic/yahudi";
import {
  getManufakturMaterialBonusPercent,
  getInfrastrukturMineralEnergiBonusPercent,
  getGenetikaPakanTernakBonusPercent,
  getAgrikulturTangguhBonusPercent,
  getTeknologiPerikananPascapanenBonusPercent,
  getIndustriPanganTerintegrasiBonusPercent,
  getKementerianInfrastrukturBuildSpeedBonusPercent,
} from "../../../../bonus_logic";
import {
  DEMOCRACY_TAX_REVENUE_BONUS,
} from "../../../../bonus_logic/ideologi_bonus_logic/demokrasi";
import { CAPITALISM_TAX_REVENUE_BONUS } from "../../../../bonus_logic/ideologi_bonus_logic/kapitalisme";
import { LIBERALISM_TAX_REVENUE_BONUS } from "../../../../bonus_logic/ideologi_bonus_logic/liberalisme";
import { CONSERVATISM_TAX_REVENUE_BONUS } from "../../../../bonus_logic/ideologi_bonus_logic/konservatisme";
import { COMMUNISM_PRODUCTION_BONUS } from "../../../../bonus_logic/ideologi_bonus_logic/komunisme";
import { isMemberOfFAO } from "../../../../bonus_logic";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
import { roundNeo } from "@/app/logic/economic_logic/neoCurrency";



interface MaterialRequirement {
  resourceKey: string;
  label: string;
  group: string;
  amount?: number;
}

interface BuildingRequirements {
  requirements: MaterialRequirement[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  currentDate?: string | Date;
  targetTab?: string | null;
  targetHighlightedKey?: string | null;
  onProductionDeepLinkHandled?: () => void;
}

export default function ProduksiModal({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
  currentDate,
  targetTab,
  targetHighlightedKey,
  onProductionDeepLinkHandled,
}: ModalProps) {
  const { t } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_construction_production.${key}`, params);
  const translateConfirmation = (key: string, params?: Record<string, string | number>) => {
    if (key.startsWith("materials.")) {
      const resourceKey = key.slice("materials.".length);
      const rewardKey = `side_reward.items.${resourceKey}`;
      const translated = t(rewardKey);
      return translated === rewardKey ? key : translated;
    }
    return tr(`confirmation.${key}`, params);
  };
  const [activeTab, setActiveTab] = useState<string>(targetTab || "kelistrikan");
  const viewportMode = useViewportMode();

  // Update tab when targetTab prop changes
  useEffect(() => {
    if (targetTab && targetTab !== activeTab) {
      setActiveTab(targetTab);
    }
  }, [targetTab]);
  const [selectedBuilding, setSelectedBuilding] = useState<{ key: string; label: string; initialQuantity?: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [hoveredBuildingKey, setHoveredBuildingKey] = useState<string | null>(null);
  const [productionCache, setProductionCache] = useState<Record<string, number>>({});
  const [lastCalculationDate, setLastCalculationDate] = useState<string>("");
  const lastCalculatedDateRef = useRef<string>("");
  const [highlightedCardKey, setHighlightedCardKey] = useState<string | null>(null);
  const [showMaterialWarningModal, setShowMaterialWarningModal] = useState(false);
  const [showSanctionInfo, setShowSanctionInfo] = useState(false);
  const [selectedTabInfo, setSelectedTabInfo] = useState<{ title: string; description: string } | null>(null);
  const [insufficientMaterials, setInsufficientMaterials] = useState<MaterialRequirement[]>([]);
  const [sdaStatus, setSdaStatus] = useState<Record<string, boolean> | null>(null);
  const playerCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.country_name || "";
  const normalizedPlayerCountry = normalizePbbCountryName(playerCountryName);
  const activeAssemblyEmbargoes = loadActiveResolutions().filter(item =>
    item.type === "economic_embargo" &&
    normalizePbbCountryName(item.target.name) === normalizedPlayerCountry &&
    isPassedResolutionActive(item)
  );
  const activeSecurityBlockades = loadActiveSecurityCouncilItems().filter(item =>
    ["economic", "naval", "full"].includes(item.type) &&
    normalizePbbCountryName(item.target.name) === normalizedPlayerCountry &&
    isPassedResolutionActive(item)
  );
  const hasActiveSanctions = activeAssemblyEmbargoes.length > 0 || activeSecurityBlockades.length > 0;
  const effectiveProductionReduction = Math.round(
    (1 - getEconomicEmbargoProductionMultiplier(playerCountryName, "uranium")) * 100
  );
  const effectiveIncomeReduction = Math.round(
    (1 - getEconomicEmbargoIncomeMultiplier(playerCountryName)) * 100
  );
  const currentReligion = String(countryDetail?.religion || "").trim();
  const currentReligionBonusKey: Record<string, string> = {
    islam: "islam",
    katolik: "catholic",
    protestan: "protestant",
    "kristen ortodoks": "orthodox",
    hindu: "hindu",
    buddha: "buddhist",
    yahudi: "jewish",
    shinto: "shinto",
    ateisme: "atheism",
  };
  const currentReligionBonus = currentReligionBonusKey[currentReligion.toLowerCase()]
    ? tr(`bonus.religions.${currentReligionBonusKey[currentReligion.toLowerCase()]}`)
    : undefined;
  const currentIdeology = String(countryDetail?.ideology || "").trim();
  const currentIdeologyBonusKey: Record<string, string> = {
    demokrasi: "democracy",
    monarki: "monarchy",
    kapitalisme: "capitalism",
    sosialisme: "socialism",
    komunisme: "communism",
    nasionalisme: "nationalism",
    konservatisme: "conservatism",
    liberalisme: "liberalism",
    otoritarianisme: "authoritarianism",
  };
  const ideologyBonusPercent: Record<string, number> = {
    demokrasi: DEMOCRACY_TAX_REVENUE_BONUS * 100,
    kapitalisme: CAPITALISM_TAX_REVENUE_BONUS * 100,
    konservatisme: CONSERVATISM_TAX_REVENUE_BONUS * 100,
    liberalisme: LIBERALISM_TAX_REVENUE_BONUS * 100,
    komunisme: COMMUNISM_PRODUCTION_BONUS * 100,
  };
  const currentIdeologyBonus = currentIdeologyBonusKey[currentIdeology.toLowerCase()]
    ? tr(`bonus.ideologies.${currentIdeologyBonusKey[currentIdeology.toLowerCase()]}`, {
        percent: ideologyBonusPercent[currentIdeology.toLowerCase()] ?? 0,
      })
    : undefined;
  const pendidikanProductionBonusPercent = getKementerianPendidikanProductionBonusPercent(
    countryDetail,
    "padi"
  );

  const RESOURCE_KEY_ALIASES: Record<string, string> = {};
  const normalizeResourceKey = (key: string) => RESOURCE_KEY_ALIASES[key] || key;

  const CARD_TAB_MAP: Record<string, string> = {
    emas: 'mineral',
    uranium: 'mineral',
    batu_bara: 'mineral',
    minyak_bumi: 'mineral',
    gas_alam: 'mineral',
    garam: 'mineral',
    litium: 'mineral',
    logam_tanah_jarang: 'mineral',
    bijih_besi: 'mineral',
    pabrik_semikonduktor: 'manufaktur',
    pabrik_mesin: 'manufaktur',
    pabrik_besi: 'manufaktur',
    semen_beton: 'manufaktur',
    kayu: 'manufaktur',
  };

  const REQUIREMENTS_MODULES: Record<string, any> = {
    kelistrikan: kelistrikanRequirements,
    mineral: mineralKritisRequirements,
    manufaktur: manufakturRequirements,
    peternakan: peternakanRequirements,
    agrikultur: agrikulturRequirements,
    perikanan: perikananRequirements,
    "olahan pangan": olahanPanganRequirements,
  };

  const getSelectedBuildingRequirements = (): BuildingRequirements | undefined => {
    if (!selectedBuilding) return undefined;
    const module = REQUIREMENTS_MODULES[activeTab];
    const normalizedKey = normalizeResourceKey(selectedBuilding.key);
    return module?.findRequirements?.(normalizedKey);
  };

  const getSelectedBuildingProduction = () => {
    if (!selectedBuilding) return 0;
    const module = REQUIREMENTS_MODULES[activeTab];
    const normalizedKey = normalizeResourceKey(selectedBuilding.key);
    return module?.getTotalProduction?.(normalizedKey, countryDetail, metadata) ?? 0;
  };

  const selectedBuildingRequirements = getSelectedBuildingRequirements();
  const selectedBuildingProduction = getSelectedBuildingProduction();

  const getMaterialStock = (resourceKey: string): number => {
    return getMaterialStockFromBuildLogic(countryDetail, resourceKey);
  };

  const ELECTRICITY_FUEL_BUILDINGS = [
    'pembangkit_listrik_tenaga_gas',
    'pembangkit_listrik_tenaga_nuklir',
    'pembangkit_listrik_tenaga_uap',
  ];

  const getTotalElectricityFuelConsumption = (): Record<string, number> => {
    const totals: Record<string, number> = {
      gas_alam: 0,
      uranium: 0,
      batu_bara: 0,
      minyak_bumi: 0,
    };

    ELECTRICITY_FUEL_BUILDINGS.forEach((buildingKey) => {
      const count = Number(countryDetail?.[buildingKey]) || 0;
      if (count === 0) return;
      switch (buildingKey) {
        case 'pembangkit_listrik_tenaga_gas':
          totals.gas_alam += 2 * count;
          break;
        case 'pembangkit_listrik_tenaga_nuklir':
          totals.uranium += 1 * count;
          break;
        case 'pembangkit_listrik_tenaga_uap':
          totals.batu_bara += 50 * count;
          totals.minyak_bumi += 5 * count;
          break;
      }
    });
    return totals;
  };

  const getFuelBalance = (fuelKey: string) => {
    const totalCons = getTotalElectricityFuelConsumption()[fuelKey] || 0;
    const count = Number(countryDetail?.[fuelKey]) || 0;
    const meta = findMeta(fuelKey);
    const prodPerUnit = Number(meta?.produksi) || 0;
    const totalProd = count * prodPerUnit * getProductionBonusMultiplier(countryDetail, fuelKey);
    return { totalProd, totalCons, balance: totalProd - totalCons };
  };

  const getEffectiveElectricityProduction = (buildingKey: string) => {
    const count = Number(countryDetail?.[buildingKey]) || 0;
    const bMeta = findMeta(buildingKey);
    const perUnit = Number(bMeta?.produksi) || 0;
    if (count === 0 || perUnit === 0) return 0;
    const productionMultiplier = getProductionBonusMultiplier(countryDetail, buildingKey);

    const fuelRequirements = getKelistrikanFuelRequirements(buildingKey);
    if (!fuelRequirements || fuelRequirements.length === 0) {
      return perUnit * count * productionMultiplier;
    }

    for (const req of fuelRequirements) {
      const balance = getFuelBalance(req.resourceKey).balance;
      if (balance < 0) return 0;
    }
    return perUnit * count * productionMultiplier;
  };

  const handleMaterialClick = (resourceKey: string, label: string) => {
    const normalizedKey = normalizeResourceKey(resourceKey);
    const tabId = CARD_TAB_MAP[normalizedKey];
    if (!tabId) {
      setToast(tr("status.noCard", { building: label }));
      setTimeout(() => setToast(null), 2000);
      return;
    }
    setActiveTab(tabId);
    setHighlightedCardKey(normalizedKey);
    setSelectedBuilding(null);
  };

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

  const { safeDateString } = useMaterialProduction(
    countryDetail,
    setCountryDetail,
    metadata,
    currentDate,
    resourceKey =>
      getEconomicEmbargoProductionMultiplier(countryDetail?.country || '', resourceKey) *
      getProductionBonusMultiplier(countryDetail, resourceKey)
  );

  // 🟢 PERBAIKAN: Daftar bangunan listrik harus didefinisikan SEBELUM calculateProductionAmount
  const ELECTRICITY_BUILDINGS_LIST = [
    'pembangkit_listrik_tenaga_nuklir',
    'pembangkit_listrik_tenaga_air',
    'pembangkit_listrik_tenaga_surya',
    'pembangkit_listrik_tenaga_uap',
    'pembangkit_listrik_tenaga_gas',
    'pembangkit_listrik_tenaga_angin',
    'pembangkit_listrik_tenaga_panas_bumi',
    'pembangkit_listrik_tenaga_hidrogen',
    'pembangkit_listrik_tenaga_gelombang_laut',
    'pembangkit_listrik_tenaga_fusi_nuklir',
  ];

  // 🟢 PERBAIKAN: Mengembalikan definisi calculateProductionAmount
  const calculateProductionAmount = useMemo(() => {
    return (resourceKey: string): number => {
      if (ELECTRICITY_BUILDINGS_LIST.includes(resourceKey)) {
        return getEffectiveElectricityProduction(resourceKey);
      }

      const productionMultiplier = getEconomicEmbargoProductionMultiplier(
        countryDetail?.country || '',
        resourceKey
      ) * getProductionBonusMultiplier(countryDetail, resourceKey);
      const buildingCount = Number(countryDetail?.[resourceKey]) || 0;
      if (buildingCount === 0 || !metadata || Object.keys(metadata).length === 0) return 0;
      const bMeta = findMeta(resourceKey);
      if (!bMeta || !bMeta.produksi) return 0;
      if (resourceKey === 'emas') return bMeta.produksi * buildingCount * productionMultiplier;
      if (!safeDateString) return 0;

      const buildDateKey = `build_date_${resourceKey}`;
      const buildDate = countryDetail?.[buildDateKey];
      const finalBuildDate = buildDate || safeDateString;
      return calculateProductionIncrement(bMeta.produksi, buildingCount, finalBuildDate, safeDateString) * productionMultiplier;
    };
  }, [countryDetail, safeDateString, metadata, getEffectiveElectricityProduction]);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingMetadata(true);
    fetchBuildingMetadata()
      .then((data) => {
        setMetadata(data || {});
        setProductionCache((prev) => ({ ...prev }));
      })
      .catch((err) => logger.error('ProduksiModal', 'Failed to load metadata', err))
      .finally(() => setLoadingMetadata(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !countryDetail?.country) {
      setSdaStatus(null);
      return;
    }

    const countryName = countryDetail.country;
    fetch(`/api/sda-data?country=${encodeURIComponent(countryName)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setSdaStatus(data as Record<string, boolean>);
        } else {
          setSdaStatus(null);
        }
      })
      .catch(() => setSdaStatus(null));
  }, [isOpen, countryDetail?.country]);

  useEffect(() => {
    if (!isOpen) return;
    if (targetHighlightedKey) setHighlightedCardKey(targetHighlightedKey);
    if (targetTab || targetHighlightedKey) onProductionDeepLinkHandled?.();
  }, [isOpen, targetTab, targetHighlightedKey, onProductionDeepLinkHandled]);

  // --- CEK KONSTRUKSI YANG SELESAI (TANPA TOAST) ---
  useEffect(() => {
    if (!isOpen || !safeDateString || !countryDetail || !metadata) return;

    let now: Date;
    try {
      now = new Date(safeDateString + 'T00:00:00');
      if (isNaN(now.getTime())) throw new Error('Invalid date');
    } catch {
      now = new Date();
      console.warn('⚠️ safeDateString tidak valid di useEffect produksi, menggunakan sekarang');
    }

    const ongoing = countryDetail.ongoingConstructions || [];
    let updated = false;
    let newConstructions = [...ongoing];
    let newDetail = { ...countryDetail };

    const completed = newConstructions.filter((c) => {
      let endDate: Date;
      try {
        endDate = new Date(c.endDate + 'T00:00:00');
        if (isNaN(endDate.getTime())) throw new Error('Invalid endDate');
      } catch {
        return false;
      }
      return endDate <= now;
    });

    if (completed.length > 0) {
      completed.forEach((c) => {
        const key = c.buildingKey;
        newDetail[key] = (Number(newDetail[key]) || 0) + 1;
        const lastUpdateKey = `last_update_date_${key}`;
        (newDetail as any)[lastUpdateKey] = c.endDate;
      });

      const completedIds = completed.map((c) => c.id);
      newConstructions = newConstructions.filter((c) => !completedIds.includes(c.id));
      newDetail.ongoingConstructions = newConstructions;
      updated = true;
    }

    if (updated) {
      setCountryDetail(newDetail);
    }
  }, [safeDateString, isOpen, countryDetail, setCountryDetail, metadata]);

  // 🔥 Fungsi penambah hari murni
  const addDays = (dateString: string, days: number) => {
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  const confirmBuild = (buildQuantity: number = 1) => {
    if (!selectedBuilding) return;
    const { key, label } = selectedBuilding;
    const bMeta = findMeta(key);
    if (loadingMetadata || !bMeta || !safeDateString) {
      setToast(tr("status.metadataUnavailable"));
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const requirements = selectedBuildingRequirements?.requirements || [];
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
      setToast(tr("status.budgetOrMaterials", { max: maxQuantity }));
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const totalCost = roundNeo(cost * quantity);
    if (anggaran < totalCost) {
      setToast(tr("status.insufficientFunds", { count: quantity, building: label }));
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const updatedDetail = deductBuildingMaterials(
      { ...countryDetail, anggaran: anggaran - totalCost },
      requirements,
      quantity
    );

    const userReligion = String(
      countryDetail?.religion ||
      countryDetail?.agama_utama ||
      countryDetail?.agama ||
      ""
    ).trim().toLowerCase();
    const baseConstructionTime = Number(bMeta.waktu_pembangunan) || 0;
    let waktu = applyJewishConstructionTimeDiscount(
      baseConstructionTime,
      key,
      userReligion
    );

    const manufakturDiscount = getManufakturMaterialBonusPercent(countryDetail, key);
    const mineralDiscount = getInfrastrukturMineralEnergiBonusPercent(countryDetail, key);
    const peternakanDiscount = getGenetikaPakanTernakBonusPercent(countryDetail, key);
    const agrikulturDiscount = getAgrikulturTangguhBonusPercent(countryDetail, key);
    const perikananDiscount = getTeknologiPerikananPascapanenBonusPercent(countryDetail, key);
    const olahanPanganDiscount = getIndustriPanganTerintegrasiBonusPercent(countryDetail, key);
    const totalResearchDiscountPercent = manufakturDiscount + mineralDiscount + peternakanDiscount + agrikulturDiscount + perikananDiscount + olahanPanganDiscount;

    if (totalResearchDiscountPercent > 0 && waktu > 0) {
      const discountMult = 1 - (totalResearchDiscountPercent / 100);
      waktu = Math.max(1, Math.ceil(waktu * discountMult));
    }
    waktu = getEffectiveBuildTime(
      waktu,
      String(countryDetail?.country || countryDetail?.nama || ""),
      countryDetail
    );

    if (waktu <= 0) {
      updatedDetail[key] = (Number(countryDetail?.[key]) || 0) + quantity;
      const buildDateKey = `build_date_${key}`;
      updatedDetail[buildDateKey] = safeDateString;
      updatedDetail[`accumulated_${key}`] = 0;
      updatedDetail[`last_prod_date_${key}`] = safeDateString;

      setCountryDetail(updatedDetail);
      setSelectedBuilding(null);
      recordBuildingProgress(key, quantity);
      setToast(tr("status.builtInstantly", { count: quantity, building: label }));
      setTimeout(() => setToast(null), 3000);
      return;
    }

    let startDateStr = safeDateString;

    const ongoing = updatedDetail.ongoingConstructions || [];
    const existingForThisKey = ongoing.filter((c: any) => c.buildingKey === key);

    if (existingForThisKey.length > 0) {
      const lastEndDateStr = existingForThisKey[existingForThisKey.length - 1].endDate;
      startDateStr = lastEndDateStr;
    }

    // Jika buildQuantity > 1, kita perlu membuat multiple construction entries
    const newConstructions = [];
    let currentStartDate = startDateStr;

    for (let i = 0; i < quantity; i++) {
      const endDateStr = addDays(currentStartDate, waktu);
      newConstructions.push({
        id: Date.now() + Math.random() + i,
        buildingKey: key,
        startDate: currentStartDate,
        endDate: endDateStr
      });
      currentStartDate = endDateStr; // Start date untuk bangunan berikutnya adalah end date yang sebelumnya
    }

    const newOngoing = [
      ...ongoing,
      ...newConstructions
    ];
    updatedDetail.ongoingConstructions = newOngoing;

    setCountryDetail(updatedDetail);
    setSelectedBuilding(null);
    recordBuildingProgress(key, quantity);
    setToast(tr("status.scheduled", { count: quantity, building: label }));
    setTimeout(() => setToast(null), 3000);
  };

  const TABS = [
    { id: "kelistrikan", label: tr("tabs.kelistrikan"), component: KelistrikanTab },
    { id: "mineral", label: tr("tabs.mineral"), component: MineralEnergiTab },
    { id: "manufaktur", label: tr("tabs.manufaktur"), component: ManufakturTab },
    { id: "peternakan", label: tr("tabs.peternakan"), component: PeternakanTab },
    { id: "agrikultur", label: tr("tabs.agrikultur"), component: AgrikulturTab },
    { id: "perikanan", label: tr("tabs.perikanan"), component: PerikananTab },
    { id: "olahan pangan", label: tr("tabs.olahanPangan"), component: OlahanPanganTab },
  ];

  const productionTabDescriptions: Record<string, string> = {
    kelistrikan: tr("descriptions.kelistrikan"),
    mineral: tr("descriptions.mineral"),
    manufaktur: tr("descriptions.manufaktur"),
    peternakan: tr("descriptions.peternakan"),
    agrikultur: tr("descriptions.agrikultur"),
    perikanan: tr("descriptions.perikanan"),
    "olahan pangan": tr("descriptions.olahanPangan"),
  };

  if (!isOpen) return null;

  const handleBuild = (key: string, label: string, quantity?: number) => {
    if (!isBuildingAvailable(key, countryDetail?.country || '', sdaStatus)) {
      setToast(tr("status.unavailable", { building: label }));
      setTimeout(() => setToast(null), 2000);
      return;
    }
    // highlight clicked card (e.g., uranium) so border turns green
    setHighlightedCardKey(key);
    setSelectedBuilding({ key, label, initialQuantity: quantity });
  };

  const availabilityChecker = (key: string, countryName: string) => {
    return isBuildingAvailable(key, countryName, sdaStatus);
  };

  const activeSection = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const ComponentToRender = activeSection.component;

  const { totalProductionMW, totalAllBreakdownConsumption } = useMemo(() => {
    return getCountryConsumptionBreakdown(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const estimatedConsumption = Math.round(totalAllBreakdownConsumption);


  const ongoingConstructions = countryDetail?.ongoingConstructions || [];

  return (
    <>
      {isOpen && !selectedTabInfo && !showSanctionInfo && (
        <NotebookModalWrapper onClose={onClose}>
          <div className="root-modal-util-b74379da23 building-modal-layout production-modal-layout">

            <div className="satisfaction-modal-header root-modal-util-9462ce2345">
              <div className="satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar">
                <div className="root-modal-util-08dfbca033">
                  <div className="root-modal-util-739d92b232">
                    <Hammer aria-hidden="true" className="root-modal-util-d252947d10" />
                  </div>
                  <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                    {tr("title")}
                  </h2>
                </div>
              </div>
              <div className="root-modal-util-08dfbca033">
                <button
                  type="button"
                  onClick={() => setSelectedTabInfo({
                    title: tr("tabInfo", { category: activeSection.label }),
                    description: productionTabDescriptions[activeSection.id],
                  })}
                  aria-label={tr("tabInfo", { category: activeSection.label })}
                  title={tr("tabInfo", { category: activeSection.label })}
                  className="root-modal-info-button root-modal-util-1697100c43"
                >
                  <Info aria-hidden="true" />
                </button>
                <SharedModalCloseButton onClick={onClose} />
              </div>
            </div>

            <RootModalSidebarLayout
              ariaLabel={tr("ariaLabel")}
              activeItemId={activeTab}
              scrollKey={viewportMode}
              className="building-modal-body production-modal-body"
              sidebarClassName="building-modal-tabs production-modal-tabs"
              contentClassName="building-modal-content production-modal-content p-4 sm:p-5 lg:p-6"
              items={TABS.map((tab) => ({
                id: tab.id,
                isActive: activeTab === tab.id,
                onSelect: () => setActiveTab(tab.id),
                label: tab.label,
              }))}
            >
                <ComponentToRender
                  translatedTitle={activeSection.label}
                  countryDetail={countryDetail}
                  setCountryDetail={setCountryDetail}
                  metadata={metadata}
                  calculateProductionAmount={calculateProductionAmount}
                  findMeta={findMeta}
                  onBuildClick={handleBuild}
                  hoveredBuildingKey={hoveredBuildingKey}
                  setHoveredBuildingKey={setHoveredBuildingKey}
                  highlightedCardKey={highlightedCardKey}
                  isBuildingAvailable={availabilityChecker}
                  loadingMetadata={loadingMetadata}
                  selectedBuilding={selectedBuilding}
                  currentDate={currentDate}
                  ongoingConstructions={ongoingConstructions}
                  onNavigateToTab={(tabId: string, itemKey?: string) => {
                    setActiveTab(tabId);
                    if (itemKey) {
                      setHighlightedCardKey(itemKey);
                    }
                  }}
                />
            </RootModalSidebarLayout>

            <div className="production-modal-footer flex shrink-0 justify-center border-t border-root-accent/15 bg-root-canvas py-2">
              <button
                type="button"
                onClick={() => setShowSanctionInfo(true)}
                aria-label={tr("bonus.buttonTitle")}
                title={tr("bonus.buttonTitle")}
                className="root-modal-info-button production-bonus-info flex h-8 w-8 items-center justify-center rounded-full border border-root-accent/40 bg-root-surface text-root-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-accent cursor-pointer"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
          </div>
        </NotebookModalWrapper>
      )}

      <MenuInfoModal
        isOpen={showSanctionInfo}
        onClose={() => setShowSanctionInfo(false)}
        title={tr("bonus.title")}
      >
        <div className="space-y-4 text-xs leading-relaxed text-root-body sm:text-sm">
              {currentReligionBonus || currentIdeologyBonus || isMemberOfFAO(playerCountryName) || pendidikanProductionBonusPercent > 0 ? (
                <div className="rounded-lg border border-root-modal-positive-border bg-root-modal-positive-bg p-3 text-root-body space-y-2">
                  {pendidikanProductionBonusPercent > 0 && (
                    <p>
                      <strong className="text-white">{tr("bonus.educationMinistry")}:</strong>{" "}
                      <strong className="text-root-modal-positive">+{pendidikanProductionBonusPercent.toFixed(1)}%</strong>{" "}
                      {tr("bonus.ministryEducation")}
                    </p>
                  )}
                  {currentReligionBonus && (
                    <p>
                      <strong className="text-white">{tr("bonus.religionCurrent", { religion: currentReligion })}</strong>{" "}
                      {currentReligionBonus}
                    </p>
                  )}
                  {currentIdeologyBonus && (
                    <p>
                      <strong className="text-white">{tr("bonus.ideologyCurrent", { ideology: countryDetail?.ideology || "" })}</strong>{" "}
                      {currentIdeologyBonus}
                    </p>
                  )}
                  {isMemberOfFAO(playerCountryName) && (
                    <p>
                      <strong className="text-white">{tr("bonus.faoMembership")}</strong>{" "}
                      {tr("bonus.faoBonus")}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-root-accent/20 bg-root-canvas p-3 space-y-2">
                  <p>
                    {tr("bonus.religionCurrent", { religion: currentReligion || tr("bonus.unavailable") })}{" "}
                    <strong className="text-white">{tr("bonus.noReligion")}</strong>
                  </p>
                  <p>
                    {tr("bonus.ideologyCurrent", { ideology: countryDetail?.ideology || tr("bonus.unavailable") })}{" "}
                    <strong className="text-white">{tr("bonus.noIdeology")}</strong>
                  </p>
                  <p>
                    {tr("bonus.faoMembership")} <strong className="text-root-subtle">{tr("bonus.faoInactive")}</strong>.
                  </p>
                </div>
              )}
              {hasActiveSanctions ? (
                <p>
                  {tr("bonus.activeSanctions", { country: playerCountryName })}
                </p>
              ) : (
                <p>
                  {tr("bonus.noSanctions", { country: playerCountryName })}
                </p>
              )}
              {hasActiveSanctions && (activeAssemblyEmbargoes.length > 0 || activeSecurityBlockades.some(item => item.type === "economic" || item.type === "naval")) && (
                <p className="rounded-lg border border-root-modal-warning/30 bg-root-modal-warning-bg p-3 text-root-body">
                  {tr("bonus.sanctionEffect", { percent: effectiveProductionReduction })}
                  {activeAssemblyEmbargoes.length > 0 && (
                    <> {tr("bonus.nonGoldIncomeEffect", { percent: effectiveIncomeReduction })}</>
                  )}
                </p>
              )}
              {hasActiveSanctions && (
                <>
                  <ul className="list-disc space-y-2 pl-5 marker:text-root-accent">
                    {activeAssemblyEmbargoes.length > 0 && (
                      <li>
                        <strong className="text-white">{tr("bonus.assemblyEmbargo")}</strong>{" "}
                        {tr("bonus.assemblyEmbargoDetail", { count: activeAssemblyEmbargoes.length })}
                      </li>
                    )}
                    {activeSecurityBlockades.some(item => item.type === "economic") && (
                      <li>
                        <strong className="text-white">{tr("bonus.economicBlockade")}</strong>{" "}
                        {tr("bonus.economicBlockadeDetail", { count: activeSecurityBlockades.filter(item => item.type === "economic").length })}
                      </li>
                    )}
                    {activeSecurityBlockades.some(item => item.type === "naval") && (
                      <li>
                        <strong className="text-white">{tr("bonus.navalBlockade")}</strong>{" "}
                        {tr("bonus.navalBlockadeDetail", { count: activeSecurityBlockades.filter(item => item.type === "naval").length })}
                      </li>
                    )}
                    {activeSecurityBlockades.some(item => item.type === "full") && (
                      <li>
                        <strong className="text-white">{tr("bonus.fullBlockade")}</strong>{" "}
                        {tr("bonus.fullBlockadeDetail")}
                      </li>
                    )}
                  </ul>
                  <p className="text-xs text-root-subtle">
                    {tr("bonus.sanctionExpiry")}
                  </p>
                </>
              )}
        </div>
      </MenuInfoModal>

      {toast && <div className="fixed bottom-6 right-6 z-[80] bg-root-accent text-root-canvas font-black px-4 py-2 rounded-lg shadow-lg border border-root-accent">{toast}</div>}

      {selectedBuilding && (() => {
        const bMeta = findMeta(selectedBuilding.key);
        const originalCost = bMeta?.biaya_pembangunan !== undefined ? Number(bMeta.biaya_pembangunan) : 0;
        const cost = originalCost;
        const requirements = selectedBuildingRequirements?.requirements || [];
        const missingMaterials = requirements.filter((mat) => getMaterialStock(mat.resourceKey) < (Number(mat.amount) || 0));

        const materialStocks: Record<string, number> = {};
        requirements.forEach((mat) => {
          materialStocks[mat.resourceKey] = getMaterialStock(mat.resourceKey);
        });

        const userReligion = String(
          countryDetail?.religion ||
          countryDetail?.agama_utama ||
          countryDetail?.agama ||
          ""
        ).trim().toLowerCase();
        const baseTime = Number(bMeta?.waktu_pembangunan) || 0;
        const effectiveTime = getEffectiveBuildTime(
          baseTime,
          String(countryDetail?.country || countryDetail?.nama || ""),
          countryDetail
        );
        const jewishDiscountedTime = applyJewishConstructionTimeDiscount(
          effectiveTime,
          selectedBuilding.key,
          userReligion
        );
        const hasJewishDiscount = userReligion === "yahudi" && jewishDiscountedTime < effectiveTime;

        return (
          <KonfirmasiPembangunanModal
            isOpen={true}
            onClose={() => {
              setSelectedBuilding(null);
              setHighlightedCardKey(null);
            }}
            buildingLabel={selectedBuilding.label}
            buildingDescription={bMeta?.deskripsi || bMeta?.desc}
            cost={cost}
            waktuPembangunan={bMeta?.waktu_pembangunan}
            waktuPembangunanDiskon={jewishDiscountedTime}
            hasJewishDiscount={hasJewishDiscount}
            infraBonusPercent={getKementerianInfrastrukturBuildSpeedBonusPercent(countryDetail)}
            pembangunanBonusPercent={getKementerianPembangunanBuildSpeedBonusPercent(countryDetail)}
            produksiPerHari={bMeta?.produksi}
            kementerianPendidikanBonusPercent={getKementerianPendidikanProductionBonusPercent(
              countryDetail,
              selectedBuilding.key
            )}
            produksiLabel={bMeta?.label || selectedBuilding.label}
            konsumsiListrik={bMeta?.konsumsi_listrik}
            requirements={requirements}
            materialStocks={materialStocks}
            anggaran={Number(countryDetail?.anggaran) || 0}
            missingMaterials={missingMaterials}
            onConfirm={confirmBuild}
            onMaterialClick={handleMaterialClick}
            loadingMetadata={loadingMetadata}
            initialQuantity={selectedBuilding.initialQuantity}
            quantityTarget={getBulkBuildQuantityTarget(originalCost)}
            translate={translateConfirmation}
          />
        );
      })()}

      {showMaterialWarningModal && insufficientMaterials.length > 0 && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-transparent pointer-events-none">
          <div className="modal-responsive-shell bg-root-surface border border-root-accent/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto">
            <div className="px-6 py-5 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas relative z-10">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-base font-black uppercase tracking-wider">⚠️ {tr("warning.emptyMaterials")}</h3>
              </div>
              <SharedModalCloseButton onClick={() => setShowMaterialWarningModal(false)} className="text-root-subtle hover:text-root-accent" appearance="custom"><X className="h-5 w-5" /></SharedModalCloseButton>
            </div>
            <div className="p-6 relative z-10 flex-1 space-y-4">
              <p className="text-sm text-root-text">{tr("warning.cannotContinue", { building: selectedBuilding?.label || "" })}</p>
              <div className="bg-root-canvas border border-rose-500/30 rounded-xl p-4 flex flex-col gap-2 text-xs font-bold text-root-text">
                {insufficientMaterials.map((mat, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-root-text">{mat.label}</span>
                    <span className="text-rose-400 font-black">0</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-root-subtle italic">{tr("warning.clickMaterial")}</p>
            </div>
            <div className="p-4 bg-root-canvas border-t border-root-accent/20 flex justify-end relative z-10">
              <SharedModalCloseButton onClick={() => setShowMaterialWarningModal(false)} className="py-2.5 px-6 rounded-xl text-xs font-black uppercase transition-all text-center cursor-pointer bg-root-accent text-root-canvas hover:bg-root-accent/80 shadow-md" appearance="custom">
                {tr("warning.closeAndRestock")}
              </SharedModalCloseButton>
            </div>
          </div>
        </div>
      )}
      <MenuInfoModal
        isOpen={selectedTabInfo !== null}
        onClose={() => setSelectedTabInfo(null)}
        title={selectedTabInfo?.title ?? ""}
        description={selectedTabInfo?.description ?? ""}
      />
    </>
  );
}