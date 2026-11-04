import React, { useState, useEffect, useMemo } from "react";
import { X, ShieldAlert, Swords, Building2, TrendingUp, TrendingDown, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import ArmadaAktif from "./1_tab_menu/1_armada_aktif";
import InfrastrukturMiliter from "./1_tab_menu/2_infrastruktur_militer";
import { fetchBuildingMetadata } from "@/lib/buildingMetadata";
import { getCountryConsumptionBreakdown } from "../../3_produksi_konsumsi/1_grid_nasional/consumptionLogic";
import {
  getKementerianPertahananMilitaryPowerBonusPercent,
  getKomandanAngkatanDaratBonusPercent,
  getKomandanArmadaBonusPercent,
} from "@/app/page/bonus_logic";


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
    <>
      {!showDefenseBonusInfo && <NotebookModalWrapper onClose={onClose}>
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* HEADER */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className={`shrink-0 border border-root-accent/30 bg-root-surface p-1.5 sm:p-2 ${rootBorderRadius.card}`}>
              <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h2 className={rootModalTypography.title}>Pertahanan & Keamanan</h2>
              <p className={`${rootModalTypography.label} mt-1`}>{countryName}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDefenseBonusInfo(true)}
              aria-label="Informasi armada dan bonus pertahanan"
              title="Informasi armada dan bonus pertahanan"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-root-accent/40 bg-root-surface text-root-accent transition-all hover:border-root-accent hover:bg-root-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-root-accent cursor-pointer"
            >
              <Info className="h-4 w-4" />
            </button>
            <RootModalCloseButton onClick={onClose} />
          </div>
        </div>

        {/* BODY MODAL WITH SIDEBAR */}
        <div className="flex-1 flex min-h-0 relative z-10">
          {/* SIDEBAR MENU */}
          <div className="w-40 sm:w-44 lg:w-48 border-r border-root-accent/30 bg-root-canvas p-2 sm:p-3 flex flex-col gap-1.5 overflow-y-auto neon-scrollbar shrink-0">
            <button 
              onClick={() => setActiveTab("aktif")} 
              className={`flex w-full items-center justify-between border px-2 py-1.5 text-left transition-all cursor-pointer sm:px-2.5 sm:py-2 ${rootBorderRadius.card} ${
                activeTab === "aktif" 
                  ? "bg-root-accent border-root-accent text-root-canvas font-black shadow-md"
                  : "bg-root-surface border-root-accent/20 text-root-text hover:border-root-accent hover:text-root-accent"
              }`}
            >
              <div className="flex items-center gap-2">
                <Swords className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="text-[10px] lg:text-[11px] font-bold uppercase tracking-wider">Armada Aktif</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab("infrastruktur")} 
              className={`flex w-full items-center justify-between border px-2 py-1.5 text-left transition-all cursor-pointer sm:px-2.5 sm:py-2 ${rootBorderRadius.card} ${
                activeTab === "infrastruktur" 
                  ? "bg-root-accent border-root-accent text-root-canvas font-black shadow-md"
                  : "bg-root-surface border-root-accent/20 text-root-text hover:border-root-accent hover:text-root-accent"
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="text-[10px] lg:text-[11px] font-bold uppercase tracking-wider">Infrastruktur</span>
              </div>
            </button>
          </div>

          {/* MAIN TAB CONTENT */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 bg-root-surface neon-scrollbar space-y-4">
            {activeTab === "aktif" && <ArmadaAktif countryDetail={countryDetail} setCountryDetail={setCountryDetail} onCapacityFull={handleNavigateToInfra} onGotoProduction={onGotoProduction} currentDate={currentDate} />}
            {activeTab === "infrastruktur" && <InfrastrukturMiliter countryDetail={countryDetail} setCountryDetail={setCountryDetail} highlightKey={highlightInfraKey} onGotoProduction={onGotoProduction} ongoingConstructions={countryDetail?.ongoingConstructions || []} currentDate={currentDate} />}
          </div>
        </div>

      </div>
    </NotebookModalWrapper>}

    {/* POPUP MODAL INFO BONUS PERTAHANAN */}
    {showDefenseBonusInfo && (
      <NotebookModalWrapper onClose={() => setShowDefenseBonusInfo(false)} compact maxWidthClass="max-w-2xl">
        <div className="flex flex-col" role="dialog" aria-modal="true" aria-labelledby="defense-bonus-info-title">
            <div className="flex items-center justify-between border-b border-root-accent/20 bg-root-canvas px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-root-accent/30 bg-root-surface p-2">
                  <Info className="h-5 w-5 text-root-accent" />
                </div>
                <h3 id="defense-bonus-info-title" className="text-sm font-black uppercase tracking-wide text-root-accent">
                  Informasi Armada & Bonus Pertahanan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDefenseBonusInfo(false)}
                aria-label="Tutup informasi"
                className="rounded-lg border border-root-accent/20 p-2 text-root-subtle transition-colors hover:border-root-accent/50 hover:text-root-accent cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 overflow-y-auto px-5 py-5 text-sm leading-relaxed text-slate-300 neon-scrollbar">
              <p>
                Kelola armada militer aktif dan infrastruktur pendukungnya. Armada aktif menentukan kemampuan pertahanan dan operasi laut, sementara infrastruktur militer mendukung kapasitas serta kesiapan pasukan.
              </p>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-200 space-y-2.5">
                <p>
                  <strong className="text-white">Kementerian Pertahanan:</strong>{" "}
                  Bonus <strong className="text-emerald-300">+{pertahananBonusPercent.toFixed(1)}%</strong> Kekuatan Militer untuk seluruh matra (Darat, Laut, dan Udara). Berasal dari level kabinet (1% per blok) ditambah bonus pengangkatan menteri jika ada.
                </p>
                <p>
                  <strong className="text-white">Komandan Matra Keamanan:</strong>{" "}
                  Komandan Angkatan Darat memberikan <strong className="text-emerald-300">+{getKomandanAngkatanDaratBonusPercent(countryDetail).toFixed(1)}%</strong> Kekuatan Darat, dan Komandan Armada memberikan <strong className="text-emerald-300">+{getKomandanArmadaBonusPercent(countryDetail).toFixed(1)}%</strong> Kekuatan Laut (1% per level blok).
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
        </NotebookModalWrapper>
      )}
    </>
  );
}