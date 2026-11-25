import React, { useState, useEffect, useMemo } from "react";
import { ShieldAlert, Swords, Building2, TrendingUp, TrendingDown, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import RootModalSidebarLayout from "@/app/page/root_modals_design_menu/RootModalSidebarLayout";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
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
import { useMilitaryMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useMilitaryMenuTranslation";
import { SharedInfoModal } from "@/app/page/root_modals_design_menu/shared/SharedInfoModal";


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
  const { translate: tr } = useMilitaryMenuTranslation();
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
  const ideology = String(countryDetail?.ideology ?? countryDetail?.ideologi ?? "");
  const ideologyLabels = [
    "Demokrasi",
    "Monarki",
    "Kapitalisme",
    "Sosialisme",
    "Komunisme",
    "Nasionalisme",
    "Konservatisme",
    "Liberalisme",
    "Otoritarianisme",
  ];
  const ideologyLabel = ideologyLabels.includes(ideology)
    ? tr(`ideologies.${ideology}`)
    : ideology;


  return (
    <>
      <NotebookModalWrapper onClose={onClose}>
        <div className="root-modal-util-b74379da23 defense-modal">
          
          <div className="satisfaction-modal-header root-modal-util-9462ce2345">
            <div className="satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar">
              <div className="root-modal-util-08dfbca033">
                <div className="root-modal-util-739d92b232">
                  <ShieldAlert aria-hidden="true" className="root-modal-util-d252947d10 text-rose-500 animate-pulse" />
                </div>
                <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                  {tr("menu.title")}
                </h2>
              </div>
            </div>
            <div className="root-modal-util-08dfbca033">
              <button
                type="button"
                onClick={() => setShowDefenseBonusInfo(true)}
                aria-label={tr("menu.infoButton")}
                title={tr("menu.infoButton")}
                className="root-modal-info-button root-modal-util-1697100c43"
              >
                <Info aria-hidden="true" />
              </button>
              <RootModalCloseButton onClick={onClose} />
            </div>
          </div>

        <RootModalSidebarLayout
          ariaLabel={tr("menu.sidebarAria")}
          activeItemId={activeTab}
          contentClassName="defense-content space-y-4 p-4 sm:p-5 lg:p-6"
          items={[
            { id: "aktif", label: tr("tabs.activeFleet"), icon: <Swords className="h-4 w-4 shrink-0" /> },
            { id: "infrastruktur", label: tr("tabs.infrastructure"), icon: <Building2 className="h-4 w-4 shrink-0" /> },
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
    </NotebookModalWrapper>

    {/* POPUP MODAL INFO BONUS PERTAHANAN - MENUMPUK DI ATAS TANPA UNMOUNT */}
    <SharedInfoModal
      isOpen={showDefenseBonusInfo}
      onClose={() => setShowDefenseBonusInfo(false)}
      title={tr("menu.infoTitle")}
      maxWidth="md"
    >
      <div className="space-y-4">
        <p>
          {tr("info.generalDescription")}
        </p>
        <div className="space-y-2.5 rounded-lg border border-[var(--root-color-accent)]/20 bg-[var(--root-color-canvas)] p-3 text-[var(--root-color-body)]">
          <p>
            <strong className="text-[var(--root-color-text)]">{tr("info.ministry")}:</strong>{" "}
            {tr("info.ministryDescription", { percent: pertahananBonusPercent.toFixed(1) })}
          </p>
          <p>
            <strong className="text-[var(--root-color-text)]">{tr("info.commanders")}:</strong>{" "}
            {tr("info.commandersDescription", {
              land: getKomandanAngkatanDaratBonusPercent(countryDetail).toFixed(1),
              sea: getKomandanArmadaBonusPercent(countryDetail).toFixed(1),
            })}
          </p>
          {ideology && (
            <p>
              <strong className="text-[var(--root-color-text)]">
                {tr("info.ideologyTitle", { ideology: ideologyLabel })}:
              </strong>{" "}
              {tr("info.ideologyDescription")}
            </p>
          )}
          <p>
            <strong className="text-[var(--root-color-text)]">{tr("info.allianceResearch")}:</strong>{" "}
            {tr("info.allianceResearchDescription")}
          </p>
        </div>
      </div>
    </SharedInfoModal>
    </>
  );
}