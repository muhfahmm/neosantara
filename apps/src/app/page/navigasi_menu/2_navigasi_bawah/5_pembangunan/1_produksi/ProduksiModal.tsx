// ProduksiModal.tsx
"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Hammer, TrendingUp, TrendingDown, AlertCircle, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";
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



const RELIGION_BONUS_INFO: Record<string, string> = {
  islam: "Bonus +10% produksi SDA non-emas di Mineral & Energi serta sektor Peternakan, Agrikultur, Perikanan, dan Olahan Pangan.",
  katolik: "Bonus pengaruh suara negara di PBB +10.",
  protestan: "Bonus harga jual komoditas +5% dan diskon harga beli komoditas 5%.",
  "kristen ortodoks": "Bonus penerimaan Pajak Penghasilan Pribadi +5%.",
  hindu: "Bonus pertumbuhan populasi +8%.",
  buddha: "Bonus penerimaan Pajak Lingkungan +10%.",
  yahudi: "Diskon waktu pembangunan pabrik dan tambang 10%; emas tidak termasuk.",
  shinto: "Bonus produksi kelistrikan +10%.",
  ateisme: "Bonus kecepatan riset sains +15%.",
};

const IDEOLOGY_BONUS_INFO: Record<string, string> = {
  demokrasi: `Bonus penerimaan seluruh pajak +${DEMOCRACY_TAX_REVENUE_BONUS * 100}%.`,
  monarki: "Bonus kekuatan militer +15%.",
  kapitalisme: `Bonus penerimaan seluruh pajak +${CAPITALISM_TAX_REVENUE_BONUS * 100}%.`,
  sosialisme: "Bonus tingkat kelahiran +10%.",
  komunisme: `Produksi Semua Lini: +${COMMUNISM_PRODUCTION_BONUS * 100}%`,
  nasionalisme: "Bonus kecepatan produksi pangan +10%.",
  konservatisme: `Bonus penerimaan pajak +${CONSERVATISM_TAX_REVENUE_BONUS * 100}%.`,
  liberalisme: `Bonus penerimaan pajak +${LIBERALISM_TAX_REVENUE_BONUS * 100}%.`,
  otoritarianisme: "Bonus kekuatan militer +25%.",
};


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
  const [activeTab, setActiveTab] = useState<string>(targetTab || "kelistrikan");

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
  const currentReligionBonus = RELIGION_BONUS_INFO[currentReligion.toLowerCase()];
  const currentIdeology = String(countryDetail?.ideology || "").trim();
  const currentIdeologyBonus = IDEOLOGY_BONUS_INFO[currentIdeology.toLowerCase()];
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
      setToast(`Tidak ada kartu untuk ${label}`);
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
      setToast("Metadata bangunan masih dimuat atau tanggal tidak tersedia.");
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
      setToast(`Jumlah pembangunan melebihi batas anggaran atau material tersedia (maksimal ${maxQuantity}).`);
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const totalCost = cost * quantity;
    if (anggaran < totalCost) {
      setToast(`Kas negara tidak mencukupi untuk membangun ${quantity} ${label}!`);
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
      setToast(`✅ Berhasil! ${quantity} ${label} dibangun secara instan.`);
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
    setToast(`✅ Pembangunan ${quantity} ${label} telah dijadwalkan!`);
    setTimeout(() => setToast(null), 3000);
  };

  const TABS = [
    { id: "kelistrikan", label: "Kelistrikan", component: KelistrikanTab },
    { id: "mineral", label: "Mineral & Energi", component: MineralEnergiTab },
    { id: "manufaktur", label: "Manufaktur", component: ManufakturTab },
    { id: "peternakan", label: "Peternakan", component: PeternakanTab },
    { id: "agrikultur", label: "Agrikultur", component: AgrikulturTab },
    { id: "perikanan", label: "Perikanan", component: PerikananTab },
    { id: "olahan pangan", label: "Olahan Pangan", component: OlahanPanganTab },
  ];

  const productionTabDescriptions: Record<string, string> = {
    kelistrikan: "Kelola pembangunan pembangkit listrik. Kapasitas produksi dan ketersediaan bahan bakar menentukan pasokan listrik nasional; bandingkan produksi dengan konsumsi untuk melihat neraca energi.",
    mineral: "Bangun fasilitas ekstraksi mineral dan energi seperti bijih besi, emas, batu bara, minyak, dan gas. Produksi sumber daya ini mendukung pendapatan serta menyediakan bahan untuk sektor industri.",
    manufaktur: "Kembangkan pabrik untuk mengolah bahan mentah menjadi barang dan material industri. Pastikan pasokan bahan baku serta anggaran cukup sebelum menjadwalkan pembangunan.",
    peternakan: "Kelola produksi komoditas peternakan untuk memenuhi konsumsi masyarakat. Periksa hasil produksi dan ketersediaan fasilitas sebelum menambah kapasitas.",
    agrikultur: "Bangun fasilitas pertanian untuk menghasilkan komoditas pangan dan perkebunan. Produksi sektor ini berkontribusi pada pemenuhan kebutuhan domestik dan neraca pangan.",
    perikanan: "Kembangkan perikanan tangkap dan budidaya untuk memasok hasil laut. Kapasitas fasilitas memengaruhi produksi yang tersedia bagi konsumsi nasional.",
    "olahan pangan": "Bangun fasilitas pengolahan pangan yang mengubah bahan mentah menjadi produk konsumsi. Ketersediaan bahan baku dari sektor pertanian, peternakan, dan perikanan dapat mendukung produksinya.",
  };

  if (!isOpen) return null;

  const handleBuild = (key: string, label: string, quantity?: number) => {
    if (!isBuildingAvailable(key, countryDetail?.country || '', sdaStatus)) {
      setToast(`❌ ${label} tidak tersedia untuk negara ini`);
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
          <div className="flex flex-col h-full overflow-hidden">

            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
                  <Hammer className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
                </div>
                <div className="min-w-0">
                  <h2 className={rootModalTypography.title}>Produksi & Pembangunan</h2>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTabInfo({
                    title: `Informasi ${activeSection.label}`,
                    description: productionTabDescriptions[activeSection.id],
                  })}
                  aria-label={`Informasi ${activeSection.label}`}
                  title={`Informasi ${activeSection.label}`}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-root-accent/40 bg-root-surface text-root-accent transition-colors hover:border-root-accent hover:bg-root-accent/10"
                >
                  <Info className="h-4 w-4" />
                </button>
                <RootModalCloseButton onClick={onClose} />
              </div>
            </div>

            <div className="flex-1 flex min-h-0 relative z-10">
              <div className="w-40 sm:w-44 lg:w-48 border-r border-root-accent/30 bg-root-canvas p-2 sm:p-3 flex flex-col gap-1.5 overflow-y-auto neon-scrollbar shrink-0">
                {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center justify-between border px-2 py-1.5 text-left transition-all cursor-pointer sm:px-2.5 sm:py-2 ${rootBorderRadius.card} ${activeTab === tab.id
                          ? "bg-root-accent border-root-accent text-root-canvas font-black shadow-md"
                          : "bg-root-surface border-root-accent/20 text-root-text hover:border-root-accent hover:text-root-accent"
                        }`}
                    >
                      <span className="truncate text-[10px] lg:text-[11px] font-bold uppercase tracking-wider">{tab.label}</span>
                    </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 bg-root-surface neon-scrollbar">
                <ComponentToRender
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
              </div>
            </div>

            <div className="flex shrink-0 justify-center border-t border-root-accent/15 bg-root-canvas py-2">
              <button
                type="button"
                onClick={() => setShowSanctionInfo(true)}
                aria-label="Informasi bonus agama, ideologi, kementerian, sanksi, dan embargo"
                title="Lihat informasi bonus agama, ideologi, kementerian, sanksi, dan embargo"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-root-accent/40 bg-root-surface text-root-accent transition-all hover:border-root-accent hover:bg-root-accent/10 hover:shadow-md hover:shadow-root-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-accent cursor-pointer"
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
        title="Info Bonus Agama, Ideologi, Kementerian & Sanksi"
      >
        <div className="space-y-4 text-xs leading-relaxed text-root-body sm:text-sm">
              {currentReligionBonus || currentIdeologyBonus || isMemberOfFAO(playerCountryName) || pendidikanProductionBonusPercent > 0 ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-200 space-y-2">
                  {pendidikanProductionBonusPercent > 0 && (
                    <p>
                      <strong className="text-white">Kementerian Pendidikan:</strong>{" "}
                      Bonus <strong className="text-emerald-300">+{pendidikanProductionBonusPercent.toFixed(1)}%</strong> produksi pangan dan sumber daya alam, berdasarkan level kabinet (1% per blok) serta bonus menteri jika ada. Berlaku di sektor <strong className="text-emerald-300">Mineral & Energi, Peternakan, Agrikultur, Perikanan, dan Olahan Pangan</strong>.
                    </p>
                  )}
                  {currentReligionBonus && (
                    <p>
                      <strong className="text-white">Agama saat ini: {currentReligion}.</strong>{" "}
                      {currentReligionBonus}
                    </p>
                  )}
                  {currentIdeologyBonus && (
                    <p>
                      <strong className="text-white">Ideologi saat ini: {countryDetail?.ideology}.</strong>{" "}
                      {currentIdeologyBonus}
                    </p>
                  )}
                  {isMemberOfFAO(playerCountryName) && (
                    <p>
                      <strong className="text-white">Keanggotaan Organisasi Internasional (FAO):</strong>{" "}
                      Bonus +10% hasil produksi nasional di sektor <strong className="text-emerald-300">Peternakan, Agrikultur, Perikanan, dan Olahan Pangan</strong>.
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-root-accent/20 bg-root-canvas p-3 space-y-2">
                  <p>
                    Agama saat ini: <strong className="text-white">{currentReligion || "Belum tersedia"}</strong>. Tidak ada bonus agama khusus yang tercatat.
                  </p>
                  <p>
                    Ideologi saat ini: <strong className="text-white">{countryDetail?.ideology || "Belum tersedia"}</strong>. Tidak ada bonus ideologi khusus yang tercatat.
                  </p>
                  <p>
                    Keanggotaan FAO: <strong className="text-root-subtle">Tidak Aktif (Bukan Anggota Organisasi Pangan dan Pertanian FAO)</strong>.
                  </p>
                </div>
              )}
              {hasActiveSanctions ? (
                <p>
                  Negara <strong className="text-white">{playerCountryName}</strong> sedang terkena resolusi PBB berikut:
                </p>
              ) : (
                <p>
                  Negara <strong className="text-white">{playerCountryName}</strong> tidak sedang terkena sanksi atau embargo PBB.
                </p>
              )}
              {hasActiveSanctions && (activeAssemblyEmbargoes.length > 0 || activeSecurityBlockades.some(item => item.type === "economic" || item.type === "naval")) && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200">
                  Dampak setiap resolusi produksi aktif diakumulasikan. Total pengurangan produksi sektor terdampak saat ini:{" "}
                  <strong>{effectiveProductionReduction}%</strong>
                  {activeAssemblyEmbargoes.length > 0 && (
                    <>; pendapatan non-emas berkurang <strong>{effectiveIncomeReduction}%</strong>.</>
                  )}
                </p>
              )}
              {hasActiveSanctions && (
                <>
                  <ul className="list-disc space-y-2 pl-5 marker:text-root-accent">
                    {activeAssemblyEmbargoes.length > 0 && (
                      <li>
                        <strong className="text-white">Embargo ekonomi — Sidang Umum PBB:</strong>{" "}
                        {activeAssemblyEmbargoes.length} resolusi aktif; masing-masing mengurangi produksi 60% di Mineral & Energi (selain emas), Manufaktur, Peternakan, Agrikultur, Perikanan, dan Olahan Pangan serta pendapatan non-emas. Emas tidak terkena pemotongan.
                      </li>
                    )}
                    {activeSecurityBlockades.some(item => item.type === "economic") && (
                      <li>
                        <strong className="text-white">Blokade ekonomi — Dewan Keamanan PBB:</strong>{" "}
                        {activeSecurityBlockades.filter(item => item.type === "economic").length} resolusi aktif; masing-masing mengurangi produksi 50% di Mineral & Energi (selain emas), Manufaktur, Peternakan, Agrikultur, Perikanan, dan Olahan Pangan. Emas tidak terkena pemotongan.
                      </li>
                    )}
                    {activeSecurityBlockades.some(item => item.type === "naval") && (
                      <li>
                        <strong className="text-white">Blokade laut — Dewan Keamanan PBB:</strong>{" "}
                        {activeSecurityBlockades.filter(item => item.type === "naval").length} resolusi aktif; masing-masing mengurangi produksi 25% di Mineral & Energi (selain emas), Manufaktur, Peternakan, Agrikultur, Perikanan, dan Olahan Pangan. Emas tidak terkena pemotongan.
                      </li>
                    )}
                    {activeSecurityBlockades.some(item => item.type === "full") && (
                      <li>
                        <strong className="text-white">Blokade penuh — Dewan Keamanan PBB:</strong>{" "}
                        akses Pasar Perdagangan Global, Pinjaman & Hutang, perdagangan, dan penandatanganan kontrak dibatasi selama resolusi aktif.
                      </li>
                    )}
                  </ul>
                  <p className="text-xs text-root-subtle">
                    Dampak berakhir otomatis saat resolusi berakhir atau masa berlakunya habis.
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
          />
        );
      })()}

      {showMaterialWarningModal && insufficientMaterials.length > 0 && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-transparent pointer-events-none">
          <div className="bg-root-surface border border-root-accent/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto">
            <div className="px-6 py-5 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas relative z-10">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-base font-black uppercase tracking-wider">⚠️ Stok Material Kosong</h3>
              </div>
              <button onClick={() => setShowMaterialWarningModal(false)} className="text-root-subtle hover:text-root-accent"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 relative z-10 flex-1 space-y-4">
              <p className="text-sm text-root-text">Pembangunan <strong className="font-black text-root-accent">{selectedBuilding?.label}</strong> tidak dapat dilanjutkan karena material berikut ini stoknya kosong (0):</p>
              <div className="bg-root-canvas border border-rose-500/30 rounded-xl p-4 flex flex-col gap-2 text-xs font-bold text-root-text">
                {insufficientMaterials.map((mat, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-root-text">{mat.label}</span>
                    <span className="text-rose-400 font-black">0</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-root-subtle italic">Klik nama material pada daftar di atas untuk menambah stok (kembali ke tab terkait).</p>
            </div>
            <div className="p-4 bg-root-canvas border-t border-root-accent/20 flex justify-end relative z-10">
              <button onClick={() => setShowMaterialWarningModal(false)} className="py-2.5 px-6 rounded-xl text-xs font-black uppercase transition-all text-center cursor-pointer bg-root-accent text-root-canvas hover:bg-root-accent/80 shadow-md">
                Tutup & Lengkapi Stok
              </button>
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