import React, { useState, useEffect, useMemo } from "react";
import { X, ShieldAlert, Swords, Building2, TrendingUp, TrendingDown } from "lucide-react";
import ArmadaAktif from "./1_tab_menu/1_armada_aktif";
import InfrastrukturMiliter from "./1_tab_menu/2_infrastruktur_militer";
import { fetchBuildingMetadata } from "@/lib/buildingMetadata";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  onGotoProduction?: (tab: string, key: string) => void;
  currentDate?: string | Date;
  initialTab?: 'aktif' | 'infrastruktur';
}

export default function ArmadaModal({ isOpen, onClose, countryDetail, setCountryDetail, onGotoProduction, currentDate, initialTab = 'aktif' }: ModalProps) {
  const [activeTab, setActiveTab] = useState<'aktif' | 'infrastruktur'>(initialTab === 'polisi' as any ? 'aktif' : initialTab);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab === 'polisi' as any ? 'aktif' : initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    fetchBuildingMetadata().then((m) => setMetadata(m || {}));
  }, [isOpen]);

  const [highlightInfraKey, setHighlightInfraKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const countryName =
    countryDetail?.country ||
    countryDetail?.nama_negara ||
    countryDetail?.name_id ||
    countryDetail?.name_en ||
    "Negara";

  useEffect(() => {
    if (highlightInfraKey) {
      const timer = setTimeout(() => setHighlightInfraKey(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightInfraKey]);

  const handleNavigateToInfra = (infraKey: string) => {
    setActiveTab("infrastruktur");
    setHighlightInfraKey(infraKey);
  };

  const ELECTRICITY_BUILDINGS_LIST = [
    'pembangkit_listrik_tenaga_nuklir',
    'pembangkit_listrik_tenaga_air',
    'pembangkit_listrik_tenaga_surya',
    'pembangkit_listrik_tenaga_uap',
    'pembangkit_listrik_tenaga_gas',
    'pembangkit_listrik_tenaga_angin',
  ];

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

  const totalProductionMW = ELECTRICITY_BUILDINGS_LIST.reduce((sum, bKey) => {
    const count = Number(countryDetail?.[bKey]) || 0;
    const bMeta = findMeta(bKey);
    const perUnit = Number(bMeta?.produksi || 0);
    return sum + perUnit * count;
  }, 0);

  const DEFAULT_ELECTRICITY_CONSUMPTION: Record<string, number> = {
    gudang_senjata: 0.5,
    hangar_tank: 0.5,
    pangkalan_udara: 0.5,
    pangkalan_laut: 0.5,
    rumah_subsidi: 0.0009,
    apartemen: 0.0022,
    mansion: 0.0055,
  };

  const totalBuildingElectricityConsumption = () => {
    if (!countryDetail) return 0;
    let total = 0;

    if (metadata && Object.keys(metadata).length > 0) {
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
          } else if (countryDetail?.pertahanan?.[pKey] !== undefined && countryDetail?.pertahanan?.[pKey] !== null) {
            count = Number(countryDetail.pertahanan[pKey]) || 0;
            break;
          }
        }

        if (count > 0) {
          total += count * konsumsi;
        }
      });
    }

    if (total <= 0) {
      Object.entries(DEFAULT_ELECTRICITY_CONSUMPTION).forEach(([hKey, defaultRate]) => {
        const count = Number(countryDetail[hKey]) || Number(countryDetail?.pertahanan?.[hKey]) || 0;
        if (count > 0) {
          total += count * defaultRate;
        }
      });
    }

    return total;
  };

  const buildingCons = totalBuildingElectricityConsumption();
  const estimatedConsumption = Math.max(
    0,
    Math.round(
      buildingCons > 0
        ? buildingCons
        : totalProductionMW * 0.7
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Pertahanan & Keamanan</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">{countryName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 ml-4 lg:ml-8 pl-4 lg:pl-8 border-l border-[#00FFAA]/30">
              <div className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1 bg-[#0F2424] border border-[#00FFAA]/30 rounded-lg">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] lg:text-[11px] font-black text-emerald-400 uppercase tracking-wider">Produksi</span>
                <span className="text-[10px] lg:text-[11px] font-black text-emerald-400">{totalProductionMW.toLocaleString('id-ID')} MW</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1 bg-[#0F2424] border border-rose-500/30 rounded-lg">
                <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-[10px] lg:text-[11px] font-black text-rose-400 uppercase tracking-wider">Konsumsi</span>
                <span className="text-[10px] lg:text-[11px] font-black text-rose-400">{estimatedConsumption.toLocaleString('id-ID')} MW</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY MODAL WITH SIDEBAR */}
        <div className="flex-1 flex min-h-0 relative z-10">
          {/* SIDEBAR MENU */}
          <div className="w-44 sm:w-48 lg:w-52 border-r border-[#00FFAA]/30 bg-[#0A1A1A] p-2.5 sm:p-3 flex flex-col gap-1.5 sm:gap-2 overflow-y-auto custom-scrollbar shrink-0">
            <button 
              onClick={() => setActiveTab("aktif")} 
              className={`flex items-center justify-between w-full px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === "aktif" 
                  ? "bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-black shadow-md" 
                  : "bg-[#0F2424] border-[#00FFAA]/20 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:text-[#00FFAA]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Swords className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">Armada Aktif</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab("infrastruktur")} 
              className={`flex items-center justify-between w-full px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === "infrastruktur" 
                  ? "bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-black shadow-md" 
                  : "bg-[#0F2424] border-[#00FFAA]/20 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:text-[#00FFAA]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">Infrastruktur</span>
              </div>
            </button>
          </div>

          {/* MAIN TAB CONTENT */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 bg-[#0F2424] custom-scrollbar space-y-4">
            {activeTab === "aktif" && <ArmadaAktif countryDetail={countryDetail} setCountryDetail={setCountryDetail} onCapacityFull={handleNavigateToInfra} onGotoProduction={onGotoProduction} currentDate={currentDate} />}
            {activeTab === "infrastruktur" && <InfrastrukturMiliter countryDetail={countryDetail} setCountryDetail={setCountryDetail} highlightKey={highlightInfraKey} onGotoProduction={onGotoProduction} ongoingConstructions={countryDetail?.ongoingConstructions || []} currentDate={currentDate} />}
          </div>
        </div>
      </div>
    </div>
  );
}