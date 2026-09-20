"use client";
import React, { useState, useEffect, useMemo } from "react";
import { fetchBuildingMetadata } from '../../../../../../lib/buildingMetadata';
import { X, Home, TrendingUp, TrendingDown, Hammer, AlertCircle, Info } from "lucide-react";
import InfoBangunanModal from "./1_modals_info_bangunan/info_bangunan_modals";
import KonfirmasiPembangunanModal from "./2_modals_konfirmasi_pembangunan/modalsKonfirmasiPembangunan";
import { useMaterialProduction, getMaterialStock as getMaterialStockFromBuildLogic, deductBuildingMaterials } from "../build_logic/build_logic";

// 🟢 IMPOR REQUIREMENTS
import * as perumahanSubsidiRequirements from "./requirements_logic/1_perumahan_subsidi/requirements";
import * as apartemenRequirements from "./requirements_logic/2_apartement/requirements";
import * as mansionRequirements from "./requirements_logic/3_mansion/requirements";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  onGotoProduction?: (tab: string, key: string) => void;
  currentDate?: string | Date;
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
  semikonduktor: 'manufaktur',
  mobil: 'manufaktur',
  sepeda_motor: 'manufaktur',
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
  return Number.isFinite(parsed) ? parsed.toLocaleString('id-ID') : '0';
};

export default function HunianPermukimanModal({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
  onGotoProduction,
  currentDate,
}: ModalProps) {
  const [activeTab, setActiveTab] = useState("rumah_subsidi");
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [selectedBuilding, setSelectedBuilding] = useState<{ key: string; label: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showMaterialWarningModal, setShowMaterialWarningModal] = useState(false);
  const [insufficientMaterials, setInsufficientMaterials] = useState<MaterialRequirement[]>([]);
  const [hoveredBuildingKey, setHoveredBuildingKey] = useState<string | null>(null);

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
      setToast(`Material ${label} tidak memiliki tab produksi yang terdaftar.`);
      setTimeout(() => setToast(null), 2000);
      return;
    }
    setShowConfirm(false);
    setSelectedBuilding(null);
    setToast(`🔗 ${label} diproduksi di tab ${tabId.toUpperCase()}.`);
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
    const missingMaterials = buildingReq?.requirements?.filter(
      (material) => getMaterialStock(material.resourceKey) <= 0
    ) || [];

    if (missingMaterials.length > 0) {
      setInsufficientMaterials(missingMaterials);
      setShowMaterialWarningModal(true);
      return;
    }

    const cost = Number(bMeta.biaya_pembangunan) || 0;
    const totalCost = cost * buildQuantity;
    const anggaran = Number(countryDetail?.anggaran) || 0;
    if (anggaran < totalCost) {
      setToast(`Kas negara tidak mencukupi untuk membangun ${buildQuantity} ${label}!`);
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const updatedDetail = deductBuildingMaterials(
      {
        ...countryDetail,
        anggaran: anggaran - totalCost,
        [key]: (Number(countryDetail?.[key]) || 0) + buildQuantity,
        kepuasan: Math.min(100, (Number(countryDetail?.kepuasan) || 65.0) + (1.5 * buildQuantity))
      },
      buildingReq?.requirements,
      buildQuantity
    );

    setCountryDetail(updatedDetail);
    
    setShowConfirm(false);
    setSelectedBuilding(null);
    setToast(`✅ Berhasil! ${buildQuantity} ${label} dibangun.`);
    setTimeout(() => setToast(null), 2500);
  };

  const HUNIAN_KEYS = ["rumah_subsidi", "apartemen", "mansion"];
  const labels: Record<string, { label: string; desc: string; detailDesc: string }> = {
    rumah_subsidi: {
      label: "Perumahan Subsidi",
      desc: "Hunian Terjangkau",
      detailDesc: "Rumah tapak bersubsidi yang disediakan pemerintah bagi masyarakat berpenghasilan rendah untuk mendukung pemerataan papan."
    },
    apartemen: {
      label: "Apartemen",
      desc: "Hunian Vertikal",
      detailDesc: "Kompleks hunian vertikal modern di pusat perkotaan untuk mengoptimalkan ruang lahan terbatas bagi populasi padat."
    },
    mansion: {
      label: "Mansion",
      desc: "Hunian Mewah",
      detailDesc: "Rumah mewah berukuran sangat besar dengan fasilitas premium lengkap bagi kalangan menengah ke atas."
    }
  };

  const items = HUNIAN_KEYS.map((k) => ({
    key: k,
    label: labels[k]?.label || k,
    desc: labels[k]?.desc || "",
    detailDesc: labels[k]?.detailDesc || "",
    value: Number(countryDetail?.[k]) || 0
  }));

  const activeItem = items.find((it) => it.key === activeTab) || items[0];
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const population = safeNumber(countryDetail?.jumlah_penduduk);

  // --- Hitung total kapasitas ---
  const totalCapacity = useMemo(() => {
    let cap = 0;
    HUNIAN_KEYS.forEach((key) => {
      const count = Number(countryDetail?.[key]) || 0;
      const meta = findMeta(key);
      const capacity = Number(meta?.kapasitas) || 0;
      cap += count * capacity;
    });
    return cap;
  }, [countryDetail, metadata]);

  const shortage = Math.max(0, population - totalCapacity);
  const isSufficient = totalCapacity >= population;
  const percentageMet = population > 0 ? Math.min(100, (totalCapacity / population) * 100) : 0;

  const capacityBreakdown = useMemo(() => {
    return HUNIAN_KEYS.map((key) => {
      const count = Number(countryDetail?.[key]) || 0;
      const meta = findMeta(key);
      const capacity = Number(meta?.kapasitas) || 0;
      const total = count * capacity;
      return {
        key,
        label: labels[key]?.label || key,
        count,
        capacityPerUnit: capacity,
        totalCapacity: total,
        percentage: population > 0 ? (total / population) * 100 : 0,
      };
    });
  }, [countryDetail, metadata, population]);

  // --- Indeks kepuasan perumahan (berdasarkan rasio kapasitas vs populasi) ---
  const housingSatisfaction = useMemo(() => {
    if (population <= 0) return 50;
    const idealCapacity = population; // idealnya kapasitas minimal sama dengan populasi
    if (totalCapacity <= 0) return 1;
    const ratio = Math.min(totalCapacity / idealCapacity, 2);
    let score = (ratio / 2) * 100;
    score = Math.min(100, Math.max(1, Math.round(score)));
    return score;
  }, [totalCapacity, population]);

  useEffect(() => {
    if (setCountryDetail && countryDetail) {
      setCountryDetail({
        ...countryDetail,
        satisfaction: {
          ...(countryDetail?.satisfaction || {}),
          housing: housingSatisfaction,
        }
      });
    }
  }, [housingSatisfaction]);

  // --- LOGIKA LISTRIK (tetap) ---
  const ELECTRICITY_BUILDINGS_LIST = [
    'pembangkit_listrik_tenaga_nuklir',
    'pembangkit_listrik_tenaga_air',
    'pembangkit_listrik_tenaga_surya',
    'pembangkit_listrik_tenaga_uap',
    'pembangkit_listrik_tenaga_gas',
    'pembangkit_listrik_tenaga_angin',
  ];

  const totalProductionMW = ELECTRICITY_BUILDINGS_LIST.reduce((sum, bKey) => {
    const count = Number(countryDetail?.[bKey]) || 0;
    const bMeta = findMeta(bKey);
    const perUnit = Number(bMeta?.produksi || 0);
    return sum + perUnit * count;
  }, 0);

  const totalBuildingElectricityConsumption = () => {
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
  };

  const buildingCons = totalBuildingElectricityConsumption();
  const populationDemand = 0;
  const estimatedConsumption = Math.max(
    0,
    Math.round(
      buildingCons > 0
        ? buildingCons + populationDemand
        : totalProductionMW * 0.7 + populationDemand
    )
  );

  return (
    <>
      {/* MODAL UTAMA */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />
          
          {/* HEADER */}
          <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#5c3c10]/10 rounded-xl border border-[#5c3c10]/20">
                  <Home className="h-6 w-6 text-[#5c3c10]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Hunian & Permukiman</h2>
                  <p className="text-xs text-[#8b7e66]">Manajemen ketersediaan rumah dan tata kelola pemukiman warga</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pl-8 border-l-2 border-[#C4B49C]/30">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-emerald-700" />
                    <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Produksi</span>
                    <span className="text-[11px] font-black text-emerald-700">{totalProductionMW.toLocaleString('id-ID')} MW</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-300 rounded-lg">
                    <TrendingDown className="h-4 w-4 text-rose-700" />
                    <span className="text-[11px] font-black text-rose-700 uppercase tracking-wider">Konsumsi</span>
                    <span className="text-[11px] font-black text-rose-700">{estimatedConsumption.toLocaleString('id-ID')} MW</span>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 flex min-h-0 relative z-10">
            {/* SIDEBAR TABS */}
            <div className="w-64 border-r-2 border-[#C4B49C]/30 bg-[#FAF6EE] p-4 flex flex-col gap-2 overflow-y-auto">
              {items.map((it) => (
                <button
                  key={it.key}
                  onClick={() => setActiveTab(it.key)}
                  className={`flex items-center justify-between w-full p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    activeTab === it.key
                      ? "bg-[#5c3c10] border-[#5c3c10] text-[#FAF6EE] shadow-md"
                      : "bg-white/80 border-[#C4B49C]/30 text-[#5c3c10] hover:bg-white hover:border-[#5c3c10]/50"
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">{it.label}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeTab === it.key ? "bg-[#FAF6EE] text-[#5c3c10]" : "bg-[#5c3c10]/10 text-[#5c3c10]"
                  }`}>
                    {it.value > 0 ? "Tersedia" : "Kosong"}
                  </span>
                </button>
              ))}
            </div>

            {/* KONTEN UTAMA */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#FAF6EE]/40 flex flex-col justify-between">
              <div>
                {activeItem && (
                  <div className="max-w-3xl">
                    <div className="mb-6 flex flex-col md:flex-row gap-6">
                      <div className="flex-grow">
                        <h3 className="text-xl font-black text-[#5c3c10] uppercase tracking-wide">{activeItem.label}</h3>
                        <p className="text-xs text-[#8b7e66] mt-1">{activeItem.desc}</p>
                        <p className="text-sm text-[#5c3c10] mt-4 leading-relaxed bg-[#e4dac3]/20 border border-[#C4B49C]/20 p-4 rounded-2xl">{activeItem.detailDesc}</p>
                      </div>
                    </div>

                    <div className="bg-white/90 border border-[#C4B49C]/30 rounded-3xl p-6 shadow-sm max-w-sm relative overflow-visible">
                      {hoveredBuildingKey === activeItem.key && (() => {
                        const bMeta = findMeta(activeItem.key) || {};
                        const perCount = activeItem.value || 0;
                        const konsumsiUnit = Number(bMeta?.konsumsi_listrik) || 0;
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

                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[10px] font-black uppercase text-[#8b7e66] tracking-wider">Total Terdaftar</p>
                        <button
                          className="flex items-center justify-center w-5 h-5 rounded-full transition-colors cursor-help bg-[#5c3c10]/10 hover:bg-[#5c3c10]/20 text-[#5c3c10]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHoveredBuildingKey(hoveredBuildingKey === activeItem.key ? null : activeItem.key);
                          }}
                          title="Info bangunan"
                        >
                          <Info className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-black text-[#2e261a] mt-2 leading-tight break-words">{activeItem.value.toLocaleString('id-ID')}</p>
                      <div className="border-t border-[#C4B49C]/20 mt-6 pt-3">
                        <button
                          onClick={() => handleBuild(activeItem.key, activeItem.label)}
                          className="w-full py-2 rounded-xl bg-[#5c3c10] text-[#FAF6EE] border border-[#5c3c10] text-[10px] font-black uppercase cursor-pointer hover:bg-[#8b7e66] hover:border-[#8b7e66] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] active:scale-[0.98]"
                        >
                          Bangun
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER STATISTIK */}
              <div className="mt-8 border-t-2 border-[#C4B49C]/20 pt-6 space-y-4">
                {/* Ringkasan total unit & populasi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-[#C4B49C]/30 bg-white/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#5c3c10]">Total Keseluruhan Unit Hunian</p>
                    <p className="text-lg sm:text-xl font-black text-[#2e261a] mt-1 break-words">{totalValue.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="rounded-2xl border border-[#C4B49C]/30 bg-white/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#5c3c10]">Populasi</p>
                    <p className="text-lg sm:text-xl font-black text-[#2e261a] mt-1 break-words">{formatNumber(population)} Jiwa</p>
                  </div>
                </div>

                {/* 🏠 CARD KAPASITAS HUNIAN */}
                <div className="rounded-2xl border-2 border-[#C4B49C]/50 bg-gradient-to-r from-[#e4dac3]/30 to-[#FAF6EE] p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Home className="h-5 w-5 text-[#5c3c10]" />
                    <h4 className="text-sm font-black uppercase tracking-widest text-[#5c3c10]">📊 Kapasitas Hunian vs Kebutuhan</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/80 rounded-xl p-3 border border-[#C4B49C]/20 flex flex-col justify-between">
                      <p className="text-[9px] font-bold uppercase text-[#8b7e66]">Total Kapasitas</p>
                      <p className="text-xs sm:text-sm lg:text-base font-black text-emerald-700 leading-tight mt-1 break-words">
                        {totalCapacity.toLocaleString('id-ID')} <span className="text-[9px] font-bold text-[#8b7e66]">orang</span>
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-3 border border-[#C4B49C]/20 flex flex-col justify-between">
                      <p className="text-[9px] font-bold uppercase text-[#8b7e66]">Kebutuhan (Populasi)</p>
                      <p className="text-xs sm:text-sm lg:text-base font-black text-[#2e261a] leading-tight mt-1 break-words">
                        {population.toLocaleString('id-ID')} <span className="text-[9px] font-bold text-[#8b7e66]">orang</span>
                      </p>
                    </div>
                    <div className={`bg-white/80 rounded-xl p-3 border ${isSufficient ? 'border-emerald-300' : 'border-rose-300'} flex flex-col justify-between`}>
                      <p className="text-[9px] font-bold uppercase text-[#8b7e66]">Kekurangan / Surplus</p>
                      <p className={`text-xs sm:text-sm lg:text-base font-black leading-tight mt-1 break-words ${isSufficient ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isSufficient 
                          ? `+${(totalCapacity - population).toLocaleString('id-ID')}` 
                          : `-${shortage.toLocaleString('id-ID')}`}
                        <span className={`text-[9px] font-bold block sm:inline ${isSufficient ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isSufficient ? ' (surplus)' : ' (kurang)'}
                        </span>
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-3 border border-[#C4B49C]/20 flex flex-col justify-between">
                      <p className="text-[9px] font-bold uppercase text-[#8b7e66]">Keterpenuhan</p>
                      <p className={`text-xs sm:text-sm lg:text-base font-black leading-tight mt-1 ${percentageMet >= 100 ? 'text-emerald-700' : 'text-amber-600'}`}>
                        {percentageMet.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Breakdown per tipe */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {capacityBreakdown.map((item) => (
                      <div key={item.key} className="bg-white/70 rounded-xl p-3 border border-[#C4B49C]/20">
                        <p className="text-[10px] font-black uppercase text-[#5c3c10]">{item.label}</p>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-[#8b7e66]">Unit</span>
                          <span className="font-bold text-[#2e261a]">{item.count.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#8b7e66]">Kapasitas/unit</span>
                          <span className="font-bold text-[#2e261a]">{item.capacityPerUnit} org</span>
                        </div>
                        <div className="flex justify-between text-xs font-black border-t border-[#C4B49C]/20 mt-1 pt-1">
                          <span className="text-[#8b7e66]">Total kapasitas</span>
                          <span className="text-emerald-700">{item.totalCapacity.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="h-1.5 rounded-full bg-[#5c3c10]"
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-[#8b7e66] mt-0.5">{item.percentage.toFixed(1)}% dari populasi</p>
                      </div>
                    ))}
                  </div>

                  <div className={`mt-4 p-3 rounded-xl text-xs font-bold ${isSufficient ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' : 'bg-rose-50 border border-rose-300 text-rose-800'}`}>
                    {isSufficient 
                      ? `✅ Kapasitas hunian mencukupi untuk seluruh populasi. Tersedia kelebihan ${(totalCapacity - population).toLocaleString('id-ID')} tempat.`
                      : `⚠️ Masih terdapat kekurangan ${shortage.toLocaleString('id-ID')} tempat hunian. ${Math.round(100 - percentageMet)}% populasi belum terakomodasi.`}
                  </div>
                </div>

                {/* 🔥 INDEKS KEPUASAN PERUMAHAN */}
                <div className="p-5 rounded-xl border-3 border-[#5c3c10]/40 bg-gradient-to-r from-amber-50 to-amber-100/70 shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-[#5c3c10] uppercase tracking-widest">
                      Indeks Kepuasan Rakyat (Perumahan)
                    </span>
                    <span className="text-3xl font-black text-amber-700">
                      {housingSatisfaction} / 100
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-200"
                      style={{ width: `${housingSatisfaction}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-amber-700 font-bold mt-3">
                    {housingSatisfaction >= 80
                      ? "✅ Kapasitas hunian mencukupi, rakyat memiliki tempat tinggal layak."
                      : housingSatisfaction >= 50
                      ? "⚠️ Ketersediaan hunian masih terbatas, perlu pembangunan lebih banyak."
                      : "🔴 Krisis perumahan, banyak warga belum memiliki tempat tinggal."}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-amber-800/80">
                    <div>Kapasitas per kapita: <span className="font-bold">
                      {population > 0 ? (totalCapacity / population).toFixed(2) : 'N/A'}
                    </span></div>
                    <div>Persentase keterpenuhan: <span className="font-bold">{percentageMet.toFixed(1)}%</span></div>
                  </div>
                </div>

                {/* RINGKASAN KONSUMSI LISTRIK SEKTOR */}
                {activeItem && (() => {
                  const bMeta = findMeta(activeItem.key);
                  const count = Number(countryDetail?.[activeItem.key]) || 0;
                  const konsumsiUnit = Number(bMeta?.konsumsi_listrik) || 0;
                  const categoryElectricityConsumption = count * konsumsiUnit;

                  return (
                    <div className="mt-4 p-4 rounded-xl bg-[#FAF6EE] border-2 border-[#C4B49C]/40 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#5c3c10] uppercase tracking-wider">
                          ⚡ Total Konsumsi Listrik {activeItem.label}
                        </span>
                      </div>
                      <div className="px-4 py-1.5 rounded-lg bg-pink-300 border-pink-400">
                        <span className="text-sm font-black text-pink-900">
                          {categoryElectricityConsumption.toLocaleString('id-ID')} MW
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && <div className="fixed bottom-6 right-6 z-[80] bg-[#5c3c10] text-[#FAF6EE] px-4 py-2 rounded-lg shadow-md">{toast}</div>}
      
      {/* KONFIRMASI PEMBANGUNAN */}
      {showConfirm && selectedBuilding && (() => {
        const bMeta = metadata[selectedBuilding.key] || {};
        const cost = Number(bMeta.biaya_pembangunan) || 0;
        const buildingReq = getSelectedBuildingRequirements();
        const requirements = buildingReq?.requirements || [];
        const missingMaterials = requirements.filter(
          (mat) => getMaterialStock(mat.resourceKey) <= 0
        );

        const materialStocks: Record<string, number> = {};
        requirements.forEach((mat) => {
          materialStocks[mat.resourceKey] = getMaterialStock(mat.resourceKey);
        });

        return (
          <KonfirmasiPembangunanModal
            isOpen={true}
            onClose={() => { setShowConfirm(false); setSelectedBuilding(null); }}
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
          />
        );
      })()}

      {/* MODAL PERINGATAN MATERIAL */}
      {showMaterialWarningModal && insufficientMaterials.length > 0 && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-transparent pointer-events-none">
          <div className="bg-[#FAF6EE] border-4 border-[#C4B49C] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.02)_0%,transparent_100%)] pointer-events-none" />
            <div className="px-6 py-5 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-base font-bold uppercase tracking-tight">⚠️ Stok Material Kosong</h3>
              </div>
              <button onClick={() => setShowMaterialWarningModal(false)} className="text-[#8b7e66] hover:text-[#5c3c10]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 relative z-10 flex-1 space-y-4">
              <p className="text-sm text-[#5c3c10]">
                Pembangunan <strong className="font-black text-[#2e261a]">{selectedBuilding?.label}</strong> tidak dapat dilanjutkan karena material berikut ini stoknya kosong (0):
              </p>
              <div className="bg-rose-50/60 border border-rose-300 rounded-xl p-4 flex flex-col gap-2 text-xs font-bold text-[#5c3c10]">
                {insufficientMaterials.map((mat, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-[#2e261a]">{mat.label}</span>
                    <span className="text-rose-600 font-black">0</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#8b7e66] italic">
                Klik nama material pada daftar di atas untuk melihat informasi produksinya.
              </p>
            </div>
            <div className="p-4 bg-[#FAF6EE] border-t-2 border-[#C4B49C]/20 flex justify-end relative z-10">
              <button onClick={() => setShowMaterialWarningModal(false)} className="py-2 px-6 rounded-xl text-[10px] font-black uppercase transition-all text-center cursor-pointer bg-[#5c3c10] text-[#FAF6EE] border border-[#5c3c10] hover:bg-[#8b7e66] hover:border-[#8b7e66]">Tutup & Lengkapi Stok</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}