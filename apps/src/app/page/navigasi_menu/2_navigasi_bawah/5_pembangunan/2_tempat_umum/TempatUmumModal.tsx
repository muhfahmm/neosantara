"use client";
import React, { useState, useEffect, useMemo } from "react";
import { fetchBuildingMetadata } from '../../../../../../lib/buildingMetadata';
// 🔥 FIX 1: Tambahkan MapPin, DollarSign, BarChart3, Sparkles, Users
import { X, Landmark, AlertTriangle, TrendingUp, TrendingDown, Hammer, Info, MapPin, DollarSign, BarChart3, Sparkles, Users } from "lucide-react";
import ServiceAISuggestionsModal from "../ai_suggestions/ServiceAISuggestionsModal";
import { generateTempatUmumAIAnalysis } from "../ai_suggestions/serviceAISuggestionsLogic";

// --- IMPOR MODUL REQUIREMENTS MATERIAL ---
import * as infrastrukturRequirements from "./requirements_logic/1_infrastruktur/requirements";
import * as pendidikanRequirements from "./requirements_logic/2_pendidikan/requirements";
import * as kesehatanRequirements from "./requirements_logic/3_kesehatan/requirements";
import * as penegakanHukumRequirements from "./requirements_logic/4_penegakan_hukum/requirements";
import * as olahragaHiburanRequirements from "./requirements_logic/5_olahraga_hiburan/requirements";
import * as komersialRequirements from "./requirements_logic/6_komersial/requirements";

// --- IMPOR KOMPONEN MODAL ---
import InfoBangunanModal from "./1_modals_info_bangunan/info_bangunan_modals";
// 🔥 FIX 2: Hapus baris duplikat import konfirmasi_pembangunan_modals
import KonfirmasiPembangunanModal from "./2_modals_konfirmasi_pembangunan/modalsKonfirmasiPembangunan";
import { useMaterialProduction, getMaterialStock as getMaterialStockFromBuildLogic, deductBuildingMaterials } from "../build_logic/build_logic";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  onGotoProduction?: (tab: string, key: string) => void;
  currentDate?: string | Date;
  initialTab?: string; // 🔥 Tab awal yang akan ditampilkan
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

const SERVICE_GROUPS = [
  { id: "infrastruktur", label: "Infrastruktur", description: "Jaringan transportasi dan fasilitas publik dasar.", keys: ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad"] },
  { id: "pendidikan", label: "Pendidikan", description: "Fasilitas pembelajaran dari prasekolah hingga pusat penelitian.", keys: ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan", "literasi"] },
  { id: "kesehatan", label: "Kesehatan", description: "Sarana medis dan indeks kesehatan masyarakat.", keys: ["rumah_sakit_besar", "rumah_sakit_kecil", "pusat_diagnostik", "harapan_hidup", "indeks_kesehatan"] },
  { id: "penegakan_hukum", label: "Penegakan Hukum", description: "Fasilitas keadilan, keamanan, dan indeks keamanan.", keys: ["pusat_bantuan_hukum", "pengadilan", "kejaksaan", "pos_polisi", "armada_mobil_polisi", "akademi_polisi", "indeks_korupsi", "indeks_keamanan"] },
  { id: "olahraga_hiburan", label: "Olahraga & Hiburan", description: "Fasilitas rekreasi dan olahraga publik.", keys: ["kolam_renang", "sirkuit_balap", "stadion", "stadion_internasional", "gym", "golf", "esports", "gokart", "bioskop", "teater"] },
  { id: "komersial", label: "Komersial", description: "Tempat usaha dan perhotelan.", keys: ["mall", "hotel", "pusat_grosir_tekstil"] },
];

const REQUIREMENTS_MODULES: Record<string, any> = {
  infrastruktur: infrastrukturRequirements,
  pendidikan: pendidikanRequirements,
  kesehatan: kesehatanRequirements,
  penegakan_hukum: penegakanHukumRequirements,
  olahraga_hiburan: olahragaHiburanRequirements,
  komersial: komersialRequirements,
};

const RESOURCE_KEY_ALIASES: Record<string, string> = {};
const normalizeResourceKey = (key: string) => RESOURCE_KEY_ALIASES[key] || key;
const formatNumber = (value: number) => value.toLocaleString("id-ID");

const CARD_TAB_MAP: Record<string, string> = {
  kayu: 'manufaktur', semen_beton: 'manufaktur', bijih_besi: 'mineral', gas_alam: 'mineral', emas: 'mineral',
  uranium: 'mineral', batu_bara: 'mineral', minyak_bumi: 'mineral', garam: 'mineral', litium: 'mineral',
  logam_tanah_jarang: 'mineral', pabrik_semikonduktor: 'manufaktur', pabrik_mesin_mobil: 'manufaktur', pabrik_mesin_motor: 'manufaktur',
};

export default function TempatUmumModal({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
  onGotoProduction,
  currentDate,
  initialTab = "infrastruktur", // 🔥 Default ke infrastruktur, bisa di-override
}: ModalProps) {
  // 🔥 FIX 3: Pastikan nama state adalah activeTabId dan setActiveTabId
  const [activeTabId, setActiveTabId] = useState<string>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTabId(initialTab);
    }
  }, [isOpen, initialTab]);

  const [selectedBuilding, setSelectedBuilding] = useState<{ key: string; label: string } | null>(null);
  const [initialBuildQty, setInitialBuildQty] = useState<number>(1);
  const [metadata, setMetadata] = useState<any>(null);
  const [loadingMetadata, setLoadingMetadata] = useState<boolean>(false);
  const [showMaterialWarningModal, setShowMaterialWarningModal] = useState<boolean>(false);
  const [insufficientMaterials, setInsufficientMaterials] = useState<MaterialRequirement[]>([]);
  const [hoveredBuildingKey, setHoveredBuildingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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

  const getSelectedBuildingRequirements = (): BuildingRequirements | undefined => {
    if (!selectedBuilding) return undefined;
    const module = REQUIREMENTS_MODULES[activeTabId];
    return module?.findRequirements?.(selectedBuilding.key);
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
    setSelectedBuilding(null);
    onGotoProduction?.(tabId, normalizedKey);
  };

  const handleBuild = (key: string, label: string) => {
    setShowMaterialWarningModal(false);
    setInsufficientMaterials([]);
    setSelectedBuilding({ key, label });
  };

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
      { ...countryDetail, anggaran: anggaran - totalCost },
      buildingReq?.requirements,
      buildQuantity
    );

    const waktu = Number(bMeta.waktu_pembangunan) || 0;

    if (waktu <= 0) {
      updatedDetail[key] = (Number(countryDetail?.[key]) || 0) + buildQuantity;
      updatedDetail.kepuasan = Math.min(100, (Number(countryDetail?.kepuasan) || 65.0) + (1.0 * buildQuantity));
      setCountryDetail(updatedDetail);
      setSelectedBuilding(null);
      return;
    }

    const ongoing = updatedDetail.ongoingConstructions || [];
    const existingForThisKey = ongoing.filter((c: any) => c.buildingKey === key);

    let startDateStr = safeDateString;
    if (existingForThisKey.length > 0) {
      startDateStr = existingForThisKey[existingForThisKey.length - 1].endDate;
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
      currentStartDate = endDateStr;
    }

    const newOngoing = [
      ...ongoing,
      ...newConstructions
    ];
    updatedDetail.ongoingConstructions = newOngoing;

    setCountryDetail(updatedDetail);
    setSelectedBuilding(null);
  };

  useEffect(() => {
    if (!isOpen || !safeDateString || !countryDetail || !metadata) return;

    let now: Date;
    try {
      now = new Date(safeDateString + 'T00:00:00');
      if (isNaN(now.getTime())) throw new Error('Invalid date');
    } catch {
      now = new Date();
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
        newDetail.kepuasan = Math.min(100, (Number(newDetail?.kepuasan) || 65.0) + 1.0);
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

  useEffect(() => {
    if (!isOpen) return;
    setLoadingMetadata(true);
    fetchBuildingMetadata().then((data) => {
      setMetadata(data || {});
    }).catch((err) => console.error('Gagal load metadata tempat umum', err))
      .finally(() => setLoadingMetadata(false));
  }, [isOpen]);

  const data = countryDetail || {};

  const groups = useMemo(() => {
    return SERVICE_GROUPS.map((group) => {
      const items = group.keys
        .map((key) => ({
          key,
          label: key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
          value: data[key] !== undefined ? Number(data[key]) : null,
        }))
        .filter((item) => item.value !== null);

      return { ...group, items, activeCount: items.length };
    }).filter((group) => group.items.length > 0);
  }, [data]);

  const activeGroup = useMemo(() => {
    return groups.find((g) => g.id === activeTabId) || groups[0];
  }, [groups, activeTabId]);

  const aiAnalysisResult = useMemo(() => {
    if (!activeGroup) return null;
    return generateTempatUmumAIAnalysis(
      activeGroup.id,
      activeGroup.label,
      activeGroup.keys,
      countryDetail,
      metadata
    );
  }, [activeGroup, countryDetail, metadata]);

  if (!isOpen) return null;

  const totalValue = groups.reduce((sum, group) => sum + group.items.reduce((inner, item) => inner + (item.value || 0), 0), 0);

  const ELECTRICITY_BUILDINGS_LIST = [
    'pembangkit_listrik_tenaga_nuklir', 'pembangkit_listrik_tenaga_air',
    'pembangkit_listrik_tenaga_surya', 'pembangkit_listrik_tenaga_uap',
    'pembangkit_listrik_tenaga_gas', 'pembangkit_listrik_tenaga_angin',
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
      const count = Number(countryDetail?.[key]) || 0;
      if (count > 0) total += count * konsumsi;
    });
    return total;
  };

  const buildingCons = totalBuildingElectricityConsumption();
  const populationDemand = 0;
  const estimatedConsumption = Math.max(0, Math.round(buildingCons > 0 ? buildingCons + populationDemand : totalProductionMW * 0.7 + populationDemand));

  const ongoingConstructions = countryDetail?.ongoingConstructions || [];

  const categoriesList = [
    { id: "infrastruktur", label: "Infrastruktur", keys: ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad"] },
    { id: "pendidikan", label: "Pendidikan", keys: ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan", "literasi"] },
    { id: "kesehatan", label: "Kesehatan", keys: ["rumah_sakit_besar", "rumah_sakit_kecil", "pusat_diagnostik", "harapan_hidup", "indeks_kesehatan"] },
    { id: "penegakan_hukum", label: "Penegakan Hukum", keys: ["pusat_bantuan_hukum", "pengadilan", "kejaksaan", "pos_polisi", "armada_mobil_polisi", "akademi_polisi", "indeks_korupsi", "indeks_keamanan"] },
    { id: "olahraga_hiburan", label: "Olahraga & Hiburan", keys: ["kolam_renang", "sirkuit_balap", "stadion", "stadion_internasional", "gym", "golf", "esports", "gokart", "bioskop", "teater"] },
    { id: "komersial", label: "Komersial", keys: ["mall", "hotel", "pusat_grosir_tekstil"] },
  ];

  const totalPenduduk = Number(data.jumlah_penduduk) || 1;

  const calculatedCategories = categoriesList.map((cat) => {
    const totalVal = cat.keys.reduce((sum, key) => sum + (Number(data[key]) || 0), 0);
    const indexVal = totalVal / totalPenduduk;
    const bonusVal = Math.round(indexVal * 100000);
    return {
      ...cat,
      total: totalVal,
      index: indexVal,
      bonus: bonusVal,
    };
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

          <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 flex-shrink-0">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                  <Landmark className="h-6 w-6 text-[#00FFAA]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#E0E0E0] tracking-wider uppercase">Tempat Umum & Layanan Publik</h2>
                  <p className="text-xs text-[#6B8A8A]">Fasilitas sosial, kesehatan, pendidikan, dan penegakan hukum</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-8 border-l border-[#00FFAA]/30">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2424] border border-[#00FFAA]/30 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">Produksi</span>
                    <span className="text-[11px] font-black text-emerald-400">{totalProductionMW.toLocaleString('id-ID')} MW</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2424] border border-rose-500/30 rounded-lg">
                    <TrendingDown className="h-4 w-4 text-rose-400" />
                    <span className="text-[11px] font-black text-rose-400 uppercase tracking-wider">Konsumsi</span>
                    <span className="text-[11px] font-black text-rose-400">{estimatedConsumption.toLocaleString('id-ID')} MW</span>
                  </div>
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
              {groups.map((group) => {
                const hasConstruction = group.keys.some((key) => 
                  ongoingConstructions.some((c: any) => c.buildingKey === key)
                );
                return (
                  <button
                    key={group.id}
                    onClick={() => setActiveTabId(group.id)}
                    className={`flex items-center justify-between w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTabId === group.id
                        ? "bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-black shadow-md"
                        : "bg-[#0F2424] border-[#00FFAA]/20 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:text-[#00FFAA]"
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">{group.label}</span>
                    <div className="flex items-center gap-1.5">
                       {hasConstruction && (
                         <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                       )}
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                         activeTabId === group.id ? "bg-[#0A1A1A] text-[#00FFAA]" : "bg-[#0A1A1A] text-[#6B8A8A]"
                       }`}>
                         {group.activeCount}
                       </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#0F2424] flex flex-col justify-between custom-scrollbar">
              <div>
                {activeGroup && (
                  <>
                    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A1A1A]/60 p-4 rounded-2xl border border-[#00FFAA]/20">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-2">
                          {activeGroup.label}
                        </h3>
                        <p className="text-xs text-[#6B8A8A] mt-1">{activeGroup.description}</p>
                      </div>

                      {/* Card Rasio Kapasitas Bangunan */}
                      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/30 shrink-0 shadow-inner">
                        <div className="p-2 bg-[#0F2424] rounded-lg border border-[#00FFAA]/20">
                          <Users className="w-4 h-4 text-[#00FFAA]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-[#6B8A8A] tracking-wider">Kapasitas Standar AI</p>
                          <p className="text-xs font-black text-[#00FFAA]">
                            1 Bangunan : {
                              activeGroup.id === 'infrastruktur' ? '20.000 Jiwa' :
                              activeGroup.id === 'pendidikan' ? '10.000 Jiwa' :
                              activeGroup.id === 'kesehatan' ? '25.000 Jiwa' :
                              activeGroup.id === 'penegakan_hukum' ? '15.000 Jiwa' :
                              activeGroup.id === 'olahraga_hiburan' ? '12.500 Jiwa' : '50.000 Jiwa'
                            }
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleOpenAIModal}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00FFAA]/10 border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all text-xs font-black shadow-md cursor-pointer shrink-0 active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-[#00FFAA] hover:text-[#0A1A1A]" />
                        <span>Rekomendasi AI</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {activeGroup.items.map((it) => {
                        const bMeta = findMeta(it.key) || {};
                        const perCount = it.value || 0;
                        const biaya = Number(bMeta?.biaya_pembangunan) || 0;
                        const waktu = bMeta?.waktu_pembangunan;
                        
                        const buildingConstruction = ongoingConstructions.filter(
                          (c: any) => c.buildingKey === it.key
                        );
                        const queueCount = buildingConstruction.length;
                        const isBuilding = queueCount > 0;

                        return (
                          <div key={it.key} className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-2xl overflow-visible flex flex-col justify-between shadow-sm hover:border-[#00FFAA]/50 transition-all relative">
                            
                            {isBuilding && (() => {
                               const lastEndDate = buildingConstruction[buildingConstruction.length - 1].endDate;
                               const [y, m, d] = lastEndDate.split('-').map(Number);
                               const date = new Date(y, m - 1, d);
                               const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
                               const parts = new Intl.DateTimeFormat('id-ID', options).formatToParts(date);
                               const day = parts.find((p) => p.type === 'day')?.value || '';
                               const month = parts.find((p) => p.type === 'month')?.value || '';
                               const year = parts.find((p) => p.type === 'year')?.value || '';
                               return (
                                 <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-[#00FFAA] text-[9px] font-bold px-2 py-0.5 border border-[#00FFAA]/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">
                                   {`${day} ${month}, ${year}`}
                                 </div>
                               );
                            })()}
                            
                            {hoveredBuildingKey === it.key && (
                              <InfoBangunanModal
                                label={it.label}
                                perCount={perCount}
                                konsumsiUnit={Number(bMeta?.konsumsi_listrik) || 0}
                                biaya={biaya}
                                waktu={waktu}
                                onClose={() => setHoveredBuildingKey(null)}
                              />
                            )}

                            <div className="p-4 flex flex-col flex-grow justify-between">
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="text-[10px] font-black uppercase text-[#6B8A8A] tracking-wider">{it.label}</p>
                                  <button
                                    className="flex items-center justify-center w-5 h-5 rounded-full transition-colors cursor-help bg-[#0F2424] border border-[#00FFAA]/30 hover:border-[#00FFAA] text-[#6B8A8A] hover:text-[#00FFAA]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setHoveredBuildingKey(hoveredBuildingKey === it.key ? null : it.key);
                                    }}
                                    title="Info bangunan"
                                  >
                                    <Info className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="flex items-end gap-1.5 mt-2 flex-wrap">
                                  <p className="text-base sm:text-lg lg:text-xl font-black text-[#E0E0E0] leading-tight break-words">{formatNumber(perCount)}</p>
                                  {isBuilding && (
                                    <span className="text-xs sm:text-sm font-bold text-emerald-400 leading-none">+{queueCount}</span>
                                  )}
                                </div>
                              </div>
                              <div className="border-t border-[#00FFAA]/10 mt-4 pt-2">
                                <button
                                  onClick={() => handleBuild(it.key, it.label)}
                                  className="w-full py-1.5 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black border border-[#00FFAA] text-[10px] uppercase cursor-pointer hover:bg-[#00FFAA]/80 transition-all shadow-md active:scale-[0.98]"
                                >
                                  Bangun
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 border-t border-[#00FFAA]/20 pt-6">
                <div className="rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">Total Fasilitas Publik</p>
                  <p className="text-base sm:text-lg lg:text-xl font-black text-[#00FFAA] mt-1 break-words">{formatNumber(totalValue)}</p>
                </div>
                <div className="rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">Catatan Pembangunan</p>
                  <p className="text-xs text-[#E0E0E0] mt-1">Data fasilitas umum disinkronisasi berkala dari laporan statistik nasional.</p>
                </div>
                {(() => {
                  const activeCategory = calculatedCategories.find((cat) => cat.id === activeTabId);
                  if (!activeCategory) return null;

                  const targets: Record<string, number> = {
                    infrastruktur: 0.00005,
                    pendidikan: 0.0001,
                    kesehatan: 0.00004,
                    penegakan_hukum: 1 / 15000,
                    olahraga_hiburan: 0.00008,
                    komersial: 0.00002,
                  };

                  const targetRatio = targets[activeCategory.id] || 0.0001;
                  const percentageMet = Math.min(100, (activeCategory.index / targetRatio) * 100);
                  const satisfactionScore = Math.round(percentageMet);

                      return (
                        <div className="flex flex-col gap-4">
                          <div className="rounded-2xl border border-[#00FFAA]/30 bg-[#0A1A1A] p-5 shadow-md flex flex-col justify-between">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider">
                                Indeks Kepuasan Rakyat ({activeCategory.label})
                              </span>
                              <span className="text-2xl font-black text-[#00FFAA]">
                                {satisfactionScore} / 100
                              </span>
                            </div>
                            
                            <div className="w-full h-3 bg-[#0F2424] border border-[#00FFAA]/20 rounded-full mt-3 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-200 ${
                                  satisfactionScore <= 40
                                    ? "bg-rose-500"
                                    : satisfactionScore <= 75
                                    ? "bg-amber-400"
                                    : "bg-[#00FFAA]"
                                }`}
                                style={{ width: `${satisfactionScore}%` }}
                              />
                            </div>

                            <p className="text-[10px] text-[#E0E0E0] font-bold mt-3">
                              {satisfactionScore <= 40
                                ? `🔴 Krisis fasilitas ${activeCategory.label.toLowerCase()}, tingkat keterpenuhan sangat rendah.`
                                : satisfactionScore <= 75
                                ? `⚠️ Fasilitas ${activeCategory.label.toLowerCase()} masih terbatas, perlu pembangunan lebih lanjut.`
                                : `✅ Ketersediaan fasilitas ${activeCategory.label.toLowerCase()} sangat mencukupi bagi seluruh rakyat.`}
                            </p>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-[#6B8A8A] border-t border-[#00FFAA]/10 pt-2">
                              <div>Rasio per kapita: <span className="font-bold text-[#E0E0E0]">{activeCategory.index.toFixed(6)}</span></div>
                              <div>Persentase keterpenuhan: <span className="font-bold text-[#E0E0E0]">{percentageMet.toFixed(1)}%</span></div>
                            </div>
                          </div>

                          {/* ⚡ RINGKASAN KONSUMSI LISTRIK SEKTOR TEMPAT UMUM */}
                          {(() => {
                            let totalCategoryConsumption = 0;
                            activeCategory.keys.forEach((key: string) => {
                              const count = Number(countryDetail?.[key]) || 0;
                              const bMeta = metadata?.[key] || metadata?.[`1_${key}`] || {};
                              const konsumsiUnit = Number(bMeta?.konsumsi_listrik) || 0;
                              totalCategoryConsumption += count * konsumsiUnit;
                            });

                            return (
                              <div className="p-4 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/30 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-[#00FFAA] uppercase tracking-wider">
                                    ⚡ Total Konsumsi Listrik {activeCategory.label}
                                  </span>
                                </div>
                                <div className="px-4 py-1.5 rounded-lg bg-[#0F2424] border border-rose-500/30">
                                  <span className="text-sm font-black text-rose-400">
                                    {Math.round(totalCategoryConsumption).toLocaleString('id-ID')} MW
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="fixed bottom-6 right-6 z-[80] bg-[#00FFAA] text-[#0A1A1A] font-black px-4 py-2 rounded-lg shadow-lg border border-[#00FFAA]">{toast}</div>}

      {selectedBuilding && (() => {
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
            onClose={() => { setSelectedBuilding(null); setInitialBuildQty(1); }}
            buildingLabel={selectedBuilding.label}
            buildingDescription={bMeta?.deskripsi || bMeta?.desc}
            cost={cost}
            waktuPembangunan={bMeta?.waktu_pembangunan}
            dampakKepuasan={1.0}
            konsumsiListrik={bMeta?.konsumsi_listrik}
            requirements={requirements}
            materialStocks={materialStocks}
            anggaran={Number(countryDetail?.anggaran) || 0}
            missingMaterials={missingMaterials}
            onConfirm={confirmBuild}
            onMaterialClick={handleMaterialClick}
            loadingMetadata={loadingMetadata}
            initialQuantity={initialBuildQty}
          />
        );
      })()}

      {showMaterialWarningModal && insufficientMaterials.length > 0 && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-transparent pointer-events-none">
          <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto">
            <div className="px-6 py-5 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-base font-black uppercase tracking-wider">⚠️ Stok Material Kosong</h3>
              </div>
              <button onClick={() => setShowMaterialWarningModal(false)} className="text-[#6B8A8A] hover:text-[#00FFAA]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 relative z-10 flex-1 space-y-4">
              <p className="text-sm text-[#E0E0E0]">
                Pembangunan <strong className="font-black text-[#00FFAA]">{selectedBuilding?.label}</strong> tidak dapat dilanjutkan karena material berikut ini stoknya kosong (0):
              </p>
              <div className="bg-[#0A1A1A] border border-rose-500/30 rounded-xl p-4 flex flex-col gap-2 text-xs font-bold text-[#E0E0E0]">
                {insufficientMaterials.map((mat, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-[#E0E0E0]">{mat.label}</span>
                    <span className="text-rose-400 font-black">0</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#6B8A8A] italic">
                Klik nama material pada daftar di atas meihat informasi produksinya.
              </p>
            </div>
            <div className="p-4 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex justify-end relative z-10">
              <button onClick={() => setShowMaterialWarningModal(false)} className="py-2.5 px-6 rounded-xl text-xs font-black uppercase transition-all text-center cursor-pointer bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 shadow-md">Tutup & Lengkapi Stok</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rekomendasi AI Tempat Umum */}
      {isAIModalOpen && (
        <ServiceAISuggestionsModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          tempatUmumAnalysis={aiAnalysisResult}
          onBuildClick={handleAIBuildClick}
        />
      )}
    </>
  );
}