import React, { useState, useEffect, useMemo } from "react";
import { ShieldAlert, Swords, Building2, TrendingUp, TrendingDown, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import RootModalSidebarLayout from "@/app/page/root_modals_design_menu/RootModalSidebarLayout";
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
        <div className="root-modal-util-b74379da23 defense-modal">
          
          <div className="satisfaction-modal-header root-modal-util-9462ce2345">
            <div className="satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar">
              <div className="root-modal-util-08dfbca033">
                <div className="root-modal-util-739d92b232">
                  <ShieldAlert aria-hidden="true" className="root-modal-util-d252947d10 text-rose-500 animate-pulse" />
                </div>
                <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                  Pertahanan & Keamanan
                </h2>
              </div>
            </div>
            <div className="root-modal-util-08dfbca033">
              <button
                type="button"
                onClick={() => setShowDefenseBonusInfo(true)}
                aria-label="Informasi armada dan bonus pertahanan"
                title="Informasi armada dan bonus pertahanan"
                className="root-modal-info-button root-modal-util-1697100c43"
              >
                <Info aria-hidden="true" />
              </button>
              <RootModalCloseButton onClick={onClose} />
            </div>
          </div>

        <RootModalSidebarLayout
          ariaLabel="Bagian armada dan infrastruktur militer"
          activeItemId={activeTab}
          contentClassName="defense-content space-y-4 p-4 sm:p-5 lg:p-6"
          items={[
            { id: "aktif", label: "Armada Aktif", icon: <Swords className="h-4 w-4 shrink-0" /> },
            { id: "infrastruktur", label: "Infrastruktur", icon: <Building2 className="h-4 w-4 shrink-0" /> },
          ].map((item) => ({
            ...item,
            isActive: activeTab === item.id,
            onSelect: () => setActiveTab(item.id as "aktif" | "infrastruktur"),
          }))}
        >
            {activeTab === "aktif" && <ArmadaAktif countryDetail={countryDetail} setCountryDetail={setCountryDetail} onCapacityFull={handleNavigateToInfra} onGotoProduction={onGotoProduction} currentDate={currentDate} />}
            {activeTab === "infrastruktur" && <InfrastrukturMiliter countryDetail={countryDetail} setCountryDetail={setCountryDetail} highlightKey={highlightInfraKey} onGotoProduction={onGotoProduction} ongoingConstructions={countryDetail?.ongoingConstructions || []} currentDate={currentDate} />}
        </RootModalSidebarLayout>

      </div>
    </NotebookModalWrapper>}

    {/* POPUP MODAL INFO BONUS PERTAHANAN */}
    {showDefenseBonusInfo && (
      <NotebookModalWrapper onClose={() => setShowDefenseBonusInfo(false)} compact>
        <div className="flex h-full min-h-0 flex-col overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="defense-bonus-info-title">
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className={`shrink-0 border border-root-accent/30 bg-root-surface p-1.5 sm:p-2 ${rootBorderRadius.card}`}>
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
              </div>
              <h2 id="defense-bonus-info-title" className={`${rootModalTypography.title} min-w-0 truncate`}>
                Informasi Armada & Bonus Pertahanan
              </h2>
            </div>
            <RootModalCloseButton onClick={() => setShowDefenseBonusInfo(false)} />
          </div>
          <div className={`root-info-modal-content relative z-10 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar ${rootModalTypography.body}`}>
            <p>
              Kelola armada militer aktif dan infrastruktur pendukungnya. Armada aktif menentukan kemampuan pertahanan dan operasi laut, sementara infrastruktur militer mendukung kapasitas serta kesiapan pasukan.
            </p>
            <div className="space-y-2.5 rounded-lg border border-root-modal-positive-border bg-root-modal-positive-bg p-3 text-root-body">
              <p>
                <strong className="text-root-text">Kementerian Pertahanan:</strong>{" "}
                Bonus <strong className="text-root-modal-positive">+{pertahananBonusPercent.toFixed(1)}%</strong> Kekuatan Militer untuk seluruh matra (Darat, Laut, dan Udara). Berasal dari level kabinet (1% per blok) ditambah bonus pengangkatan menteri jika ada.
              </p>
              <p>
                <strong className="text-root-text">Komandan Matra Keamanan:</strong>{" "}
                Komandan Angkatan Darat memberikan <strong className="text-root-modal-positive">+{getKomandanAngkatanDaratBonusPercent(countryDetail).toFixed(1)}%</strong> Kekuatan Darat, dan Komandan Armada memberikan <strong className="text-root-modal-positive">+{getKomandanArmadaBonusPercent(countryDetail).toFixed(1)}%</strong> Kekuatan Laut (1% per level blok).
              </p>
              {countryDetail?.ideology && (
                <p>
                  <strong className="text-root-text">Ideologi ({countryDetail.ideology}):</strong>{" "}
                  Mempengaruhi kekuatan militer nasional berdasarkan doktrin negara.
                </p>
              )}
              <p>
                <strong className="text-root-text">Aliansi & Riset Militer:</strong>{" "}
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