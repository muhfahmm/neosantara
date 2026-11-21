"use client"
import RootModalTabs from '@/app/page/root_modals_design_menu/RootModalTabs';
import React, { useState } from "react";
import { Award, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import MenuInfoButton from "../../MenuInfoButton";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import ResolusiPBB from "./1_resolusi_PBB/menus/1_resolusiPBB";
import KeamananPBB from "./2_keamanan_PBB/menus/1_keamananPBB";
import SuaraPBB from "./3_suara_negara_PBB/suaraPBB";
import SecurityCouncilElectionPanel from "./2_keamanan_PBB/logika_anggota_tidak_tetap/SecurityCouncilElectionPanel";
import { useGeopoliticsMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useGeopoliticsMenuTranslation";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: any;
  countryDetail: Record<string, unknown> | null;
  setCountryDetail?: (update: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
  currentDate?: Date;
}

export default function PBBModal({ isOpen, onClose, selectedCountry, countryDetail, setCountryDetail, currentDate }: ModalProps) {
  const { pbb } = useGeopoliticsMenuTranslation();
  const [activeTab, setActiveTab] = useState<"resolusi" | "keamanan" | "suara">("resolusi");
  const [isElectionInfoOpen, setIsElectionInfoOpen] = useState(false);

  if (!isOpen) return null;
  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="root-modal-util-b74379da23">
        
        <RootInfoModalHeader
          title={pbb("root.title")}
          onClose={onClose}
          icon={<Award />}
          actions={
            <MenuInfoButton
              title={pbb("root.infoTitle")}
              description={pbb("root.infoDescription")}
            />
          }
          size="standard"
        />

        {/* Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 bg-root-surface relative z-10 neon-scrollbar">
          {/* 3 TAB MENU */}
          <div className="flex w-full items-center justify-between gap-3 mb-4 sm:mb-5">
            <RootModalTabs
              items={[
                { label: pbb("root.tabResolution"), isActive: activeTab === "resolusi", onClick: () => setActiveTab("resolusi") },
                { label: pbb("root.tabCouncil"), isActive: activeTab === "keamanan", onClick: () => setActiveTab("keamanan") },
                { label: pbb("root.tabVotes"), isActive: activeTab === "suara", onClick: () => setActiveTab("suara") },
              ]}
            />
            <button
              type="button"
              onClick={() => setIsElectionInfoOpen(open => !open)}
              aria-label={pbb("root.electionInfo")}
              aria-expanded={isElectionInfoOpen}
              aria-controls="pbb-security-council-election-info"
              title={pbb("election.title")}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                isElectionInfoOpen
                  ? "border-root-accent bg-root-accent text-root-canvas"
                  : "border-root-accent/30 bg-root-canvas text-root-accent hover:border-root-accent hover:bg-root-accent/10"
              }`}
            >
              <Info className="h-5 w-5" />
            </button>
          </div>

          {isElectionInfoOpen && (
            <div id="pbb-security-council-election-info" className="mb-6">
              <SecurityCouncilElectionPanel
                selectedCountry={selectedCountry}
                currentDate={currentDate}
                countryDetail={countryDetail}
                setCountryDetail={setCountryDetail}
              />
            </div>
          )}

          {/* Render 3 Komponen Berdasarkan Active Tab */}
          {activeTab === "resolusi" && (
            <ResolusiPBB
              selectedCountry={selectedCountry}
              countryDetail={countryDetail}
              setCountryDetail={setCountryDetail}
            />
          )}
          {activeTab === "keamanan" && (
            <KeamananPBB
              selectedCountry={selectedCountry}
              countryDetail={countryDetail}
              setCountryDetail={setCountryDetail}
            />
          )}
          {activeTab === "suara" && <SuaraPBB countryDetail={countryDetail} />}
          
        </div>
      </div>
    </NotebookModalWrapper>
  );
}