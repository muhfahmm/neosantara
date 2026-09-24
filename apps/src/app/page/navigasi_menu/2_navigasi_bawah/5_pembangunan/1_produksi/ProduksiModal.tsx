// ProduksiModal.tsx
"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Hammer, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { fetchBuildingMetadata } from '../../../../../../lib/buildingMetadata';
import { isBuildingAvailable } from '../../../../../logic';
import { calculateProductionIncrement, formatDate, getDaysElapsed } from '../../../../../logic/production_logic';
import { logger } from '../../../../../../lib/logger';

import KelistrikanTab from "./card_data/1_kelistrikan";
import MineralEnergiTab from "./card_data/2_mineral_energi";
import ManufakturTab from "./card_data/3_manufaktur";
import PeternakanTab from "./card_data/4_peternakan";
import AgrikulturTab from "./card_data/5_agrikultur";
import PerikananTab from "./card_data/6_perikanan";
import OlahanPanganTab from "./card_data/7_olahan_pangan";

import * as kelistrikanRequirements from "./requirements_logic/1_produksi/1_kelistrikan/requirements";
import * as mineralKritisRequirements from "./requirements_logic/1_produksi/2_mineral_kritis/requirements";
import * as manufakturRequirements from "./requirements_logic/1_produksi/3_manufaktur/requirements";
import * as peternakanRequirements from "./requirements_logic/1_produksi/4_peternakan/requirements";
import * as agrikulturRequirements from "./requirements_logic/1_produksi/5_agrikultur/requirements";
import * as perikananRequirements from "./requirements_logic/1_produksi/6_perikanan/requirements";
import * as olahanPanganRequirements from "./requirements_logic/1_produksi/7_olahan_pangan/requirements";

import { getKelistrikanFuelRequirements } from "./requirements_logic/1_produksi/1_kelistrikan/fuelLogic";
import KonfirmasiPembangunanModal from "./2_modals_konfirmasi_pembangunan/modalsKonfirmasiPembangunan";
import { useMaterialProduction, getMaterialStock as getMaterialStockFromBuildLogic, deductBuildingMaterials } from "../build_logic/build_logic";

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
  const [insufficientMaterials, setInsufficientMaterials] = useState<MaterialRequirement[]>([]);
  const [sdaStatus, setSdaStatus] = useState<Record<string, boolean> | null>(null);

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
    semikonduktor: 'manufaktur',
    mobil: 'manufaktur',
    sepeda_motor: 'manufaktur',
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
    const totalProd = count * prodPerUnit;
    return { totalProd, totalCons, balance: totalProd - totalCons };
  };

  const getEffectiveElectricityProduction = (buildingKey: string) => {
    const count = Number(countryDetail?.[buildingKey]) || 0;
    const bMeta = findMeta(buildingKey);
    const perUnit = Number(bMeta?.produksi) || 0;
    if (count === 0 || perUnit === 0) return 0;

    const fuelRequirements = getKelistrikanFuelRequirements(buildingKey);
    if (!fuelRequirements || fuelRequirements.length === 0) {
      return perUnit * count;
    }

    for (const req of fuelRequirements) {
      const balance = getFuelBalance(req.resourceKey).balance;
      if (balance < 0) return 0;
    }
    return perUnit * count;
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
    currentDate
  );

  // 🟢 PERBAIKAN: Daftar bangunan listrik harus didefinisikan SEBELUM calculateProductionAmount
  const ELECTRICITY_BUILDINGS_LIST = [
    'pembangkit_listrik_tenaga_nuklir',
    'pembangkit_listrik_tenaga_air',
    'pembangkit_listrik_tenaga_surya',
    'pembangkit_listrik_tenaga_uap',
    'pembangkit_listrik_tenaga_gas',
    'pembangkit_listrik_tenaga_angin',
  ];

  // 🟢 PERBAIKAN: Mengembalikan definisi calculateProductionAmount
  const calculateProductionAmount = useMemo(() => {
    return (resourceKey: string): number => {
      if (ELECTRICITY_BUILDINGS_LIST.includes(resourceKey)) {
        return getEffectiveElectricityProduction(resourceKey);
      }

      const buildingCount = Number(countryDetail?.[resourceKey]) || 0;
      if (buildingCount === 0 || !metadata || Object.keys(metadata).length === 0) return 0;
      const bMeta = findMeta(resourceKey);
      if (!bMeta || !bMeta.produksi) return 0;
      if (resourceKey === 'emas') return bMeta.produksi * buildingCount;
      if (!safeDateString) return 0;

      const buildDateKey = `build_date_${resourceKey}`;
      const buildDate = countryDetail?.[buildDateKey];
      const finalBuildDate = buildDate || safeDateString;
      return calculateProductionIncrement(bMeta.produksi, buildingCount, finalBuildDate, safeDateString);
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

    const missingMaterials = selectedBuildingRequirements?.requirements?.filter(
      (material) => getMaterialStock(material.resourceKey) <= 0
    ) || [];

    if (missingMaterials.length > 0) {
      setInsufficientMaterials(missingMaterials);
      setShowMaterialWarningModal(true);
      return;
    }

    const cost = Number(bMeta.biaya_pembangunan);
    const totalCost = cost * buildQuantity;
    const anggaran = Number(countryDetail?.anggaran) || 0;
    if (anggaran < totalCost) {
      setToast(`Kas negara tidak mencukupi untuk membangun ${buildQuantity} ${label}!`);
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const updatedDetail = deductBuildingMaterials(
      { ...countryDetail, anggaran: anggaran - totalCost },
      selectedBuildingRequirements?.requirements,
      buildQuantity
    );

    const waktu = Number(bMeta.waktu_pembangunan) || 0;

    if (waktu <= 0) {
      updatedDetail[key] = (Number(countryDetail?.[key]) || 0) + buildQuantity;
      const buildDateKey = `build_date_${key}`;
      updatedDetail[buildDateKey] = safeDateString;
      updatedDetail[`accumulated_${key}`] = 0;
      updatedDetail[`last_prod_date_${key}`] = safeDateString;

      setCountryDetail(updatedDetail);
      setSelectedBuilding(null);
      setToast(`✅ Berhasil! ${buildQuantity} ${label} dibangun secara instan.`);
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
    
    for (let i = 0; i < buildQuantity; i++) {
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
    setToast(`✅ Pembangunan ${buildQuantity} ${label} telah dijadwalkan!`);
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

  const totalProductionMW = ELECTRICITY_BUILDINGS_LIST.reduce((sum, bKey) => {
    return sum + calculateProductionAmount(bKey);
  }, 0);

  const totalBuildingElectricityConsumption = useMemo(() => {
    if (!metadata || !countryDetail) return 0;
    let total = 0;
    Object.keys(metadata).forEach((key) => {
      const bMeta = metadata[key];
      const konsumsi = Number(bMeta?.konsumsi_listrik) || 0;
      if (konsumsi <= 0) return;

      const possibleKeys = [
        key,
        bMeta?.dataKey,
        key.replace(/^\d+_/, ''),
        bMeta?.dataKey ? bMeta.dataKey.replace(/^\d+_/, '') : undefined,
      ].filter(Boolean) as string[];

      let count = 0;
      for (const pKey of possibleKeys) {
        if (countryDetail[pKey] !== undefined && countryDetail[pKey] !== null) {
          count = Number(countryDetail[pKey]) || 0;
          break;
        }
      }

      if (count > 0) {
        total += count * konsumsi;
      }
    });
    return total;
  }, [metadata, countryDetail]);

  const populationDemand = 0;
  const estimatedConsumption = Math.max(0, Math.round(totalBuildingElectricityConsumption > 0 ? totalBuildingElectricityConsumption + populationDemand : totalProductionMW * 0.7 + populationDemand));

  const ongoingConstructions = countryDetail?.ongoingConstructions || [];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

            <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 flex-shrink-0">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                    <Hammer className="h-6 w-6 text-[#00FFAA]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#E0E0E0] tracking-wider uppercase">Produksi & Pembangunan</h2>
                    <p className="text-xs text-[#6B8A8A]">Kelola industri, pertanian, dan komoditas negara</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-8 pl-8 border-l border-[#00FFAA]/30">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2424] border border-[#00FFAA]/30 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">Produksi</span>
                    <span className="text-[11px] font-black text-emerald-400">{totalProductionMW.toLocaleString('id-ID')} MW</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2424] border border-rose-500/30 rounded-lg">
                    <TrendingDown className="h-4 w-4 text-rose-400" />
                    <span className="text-[11px] font-black text-rose-400 uppercase tracking-wider">Konsumsi</span>
                    <span className="text-[11px] font-black text-rose-400">{estimatedConsumption.toLocaleString('id-ID')} MW</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 flex min-h-0 relative z-10">
              <div className="w-64 border-r border-[#00FFAA]/30 bg-[#0A1A1A] p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-black shadow-md"
                        : "bg-[#0F2424] border-[#00FFAA]/20 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:text-[#00FFAA]"
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">{tab.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-[#0F2424] custom-scrollbar">
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
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 right-6 z-[80] bg-[#00FFAA] text-[#0A1A1A] font-black px-4 py-2 rounded-lg shadow-lg border border-[#00FFAA]">{toast}</div>}

      {selectedBuilding && (() => {
        const bMeta = findMeta(selectedBuilding.key);
        const cost = bMeta?.biaya_pembangunan !== undefined ? Number(bMeta.biaya_pembangunan) : 0;
        const missingMaterials = selectedBuildingRequirements?.requirements?.filter((mat) => getMaterialStock(mat.resourceKey) <= 0) || [];

        const materialStocks: Record<string, number> = {};
        (selectedBuildingRequirements?.requirements || []).forEach((mat) => {
          materialStocks[mat.resourceKey] = getMaterialStock(mat.resourceKey);
        });

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
            produksiPerHari={bMeta?.produksi}
            produksiLabel={bMeta?.label || selectedBuilding.label}
            konsumsiListrik={bMeta?.konsumsi_listrik}
            requirements={selectedBuildingRequirements?.requirements || []}
            materialStocks={materialStocks}
            anggaran={Number(countryDetail?.anggaran) || 0}
            missingMaterials={missingMaterials}
            onConfirm={confirmBuild}
            onMaterialClick={handleMaterialClick}
            loadingMetadata={loadingMetadata}
            initialQuantity={selectedBuilding.initialQuantity}
          />
        );
      })()}

      {showMaterialWarningModal && insufficientMaterials.length > 0 && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-transparent pointer-events-none">
          <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto">
            <div className="px-6 py-5 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-base font-black uppercase tracking-wider">⚠️ Stok Material Kosong</h3>
              </div>
              <button onClick={() => setShowMaterialWarningModal(false)} className="text-[#6B8A8A] hover:text-[#00FFAA]"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 relative z-10 flex-1 space-y-4">
              <p className="text-sm text-[#E0E0E0]">Pembangunan <strong className="font-black text-[#00FFAA]">{selectedBuilding?.label}</strong> tidak dapat dilanjutkan karena material berikut ini stoknya kosong (0):</p>
              <div className="bg-[#0A1A1A] border border-rose-500/30 rounded-xl p-4 flex flex-col gap-2 text-xs font-bold text-[#E0E0E0]">
                {insufficientMaterials.map((mat, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-[#E0E0E0]">{mat.label}</span>
                    <span className="text-rose-400 font-black">0</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#6B8A8A] italic">Klik nama material pada daftar di atas untuk menambah stok (kembali ke tab terkait).</p>
            </div>
            <div className="p-4 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex justify-end relative z-10">
              <button onClick={() => setShowMaterialWarningModal(false)} className="py-2.5 px-6 rounded-xl text-xs font-black uppercase transition-all text-center cursor-pointer bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 shadow-md">
                Tutup & Lengkapi Stok
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}