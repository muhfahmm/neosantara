import React, { useState, useEffect, useMemo } from "react";
import { X, ShieldAlert, Swords, Building2, TrendingUp, TrendingDown, Info } from "lucide-react";
import ArmadaAktif from "./1_tab_menu/1_armada_aktif";
import InfrastrukturMiliter from "./1_tab_menu/2_infrastruktur_militer";
import { fetchBuildingMetadata } from "@/lib/buildingMetadata";
import { getCountryConsumptionBreakdown } from "../../3_produksi_konsumsi/1_grid_nasional/consumptionLogic";
import { getKementerianPertahananMilitaryPowerBonusPercent } from "@/app/page/bonus_logic";


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
  const [showDefenseBonusInfo, setShowDefenseBonusInfo] = useState<boolean>(false);
  const pertahananBonusPercent = useMemo(() => {
    return getKementerianPertahananMilitaryPowerBonusPercent(countryDetail);
  }, [countryDetail]);

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

  const { totalProductionMW, totalAllBreakdownConsumption } = useMemo(() => {
    return getCountryConsumptionBreakdown(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const estimatedConsumption = Math.round(totalAllBreakdownConsumption);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Pertahanan & Keamanan</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">{countryName}</p>
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

        {/* FOOTER INFO BAR (Mirip dengan Produksi) */}
        <div className="flex shrink-0 justify-center border-t border-[#00FFAA]/15 bg-[#0A1A1A] py-2">
          <button
            type="button"
            onClick={() => setShowDefenseBonusInfo(true)}
            aria-label="Informasi bonus militer & kementerian pertahanan"
            title="Lihat informasi bonus kementerian pertahanan, ideologi, dan aliansi"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#00FFAA]/40 bg-[#0F2424] text-[#00FFAA] transition-all hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 hover:shadow-md hover:shadow-[#00FFAA]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFAA] cursor-pointer"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* POPUP MODAL INFO BONUS PERTAHANAN */}
      {showDefenseBonusInfo && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4 py-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="defense-bonus-info-title"
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#00FFAA]/30 bg-[#0F2424] font-sans shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] p-2">
                  <Info className="h-5 w-5 text-[#00FFAA]" />
                </div>
                <h3 id="defense-bonus-info-title" className="text-sm font-black uppercase tracking-wide text-[#00FFAA]">
                  Info Bonus Pertahanan & Kementerian
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDefenseBonusInfo(false)}
                aria-label="Tutup informasi"
                className="rounded-lg border border-[#00FFAA]/20 p-2 text-[#6B8A8A] transition-colors hover:border-[#00FFAA]/50 hover:text-[#00FFAA] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-5 text-sm leading-relaxed text-slate-300">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-200 space-y-2.5">
                <p>
                  <strong className="text-white">Kementerian Pertahanan:</strong>{" "}
                  Bonus <strong className="text-emerald-300">+{pertahananBonusPercent.toFixed(1)}%</strong> Kekuatan Militer untuk seluruh matra (Darat, Laut, dan Udara). Berasal dari level kabinet (1% per blok) ditambah bonus pengangkatan menteri jika ada.
                </p>
                {countryDetail?.ideology && (
                  <p>
                    <strong className="text-white">Ideologi ({countryDetail.ideology}):</strong>{" "}
                    Mempengaruhi kekuatan militer nasional berdasarkan doktrin negara.
                  </p>
                )}
                <p>
                  <strong className="text-white">Aliansi & Riset Militer:</strong>{" "}
                  Keanggotaan aliansi militer seperti NATO (+15%) serta riset militer (Tank Gen 5, Jet Superioritas, Kapal Perang) memberikan pengali kekuatan tambahan pada armada tempur.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}