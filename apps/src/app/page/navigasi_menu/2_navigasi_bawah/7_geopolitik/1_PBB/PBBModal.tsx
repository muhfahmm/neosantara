"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState } from "react";
import { X, Award, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import MenuInfoButton from "../../MenuInfoButton";
import ResolusiPBB from "./1_resolusi_PBB/menus/1_resolusiPBB";
import KeamananPBB from "./2_keamanan_PBB/menus/1_keamananPBB";
import SuaraPBB from "./3_suara_negara_PBB/suaraPBB";
import SecurityCouncilElectionPanel from "./2_keamanan_PBB/logika_anggota_tidak_tetap/SecurityCouncilElectionPanel";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: any;
  countryDetail: Record<string, unknown> | null;
  setCountryDetail?: (update: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
  currentDate?: Date;
}

export default function PBBModal({ isOpen, onClose, selectedCountry, countryDetail, setCountryDetail, currentDate }: ModalProps) {
  const [activeTab, setActiveTab] = useState<"resolusi" | "keamanan" | "suara">("resolusi");
  const [isElectionInfoOpen, setIsElectionInfoOpen] = useState(false);

  if (!isOpen) return null;
  const countryName = selectedCountry?.country || "Indonesia";

  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-root-surface rounded-xl border border-root-accent/30">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-root-accent tracking-tight leading-none uppercase">Sidang Umum Perserikatan Bangsa-Bangsa</h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <MenuInfoButton
              title="PBB"
              description="Pantau agenda Perserikatan Bangsa-Bangsa melalui resolusi, Dewan Keamanan, dan suara negara. Partisipasi serta keputusan di setiap bagian dapat memengaruhi kebijakan global dan posisi diplomatik negara."
            />
            <SharedModalCloseButton
              onClick={onClose}
              className="p-1.5 lg:p-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
             appearance="custom">
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </SharedModalCloseButton>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-root-surface relative z-10 neon-scrollbar">
          {/* 3 TAB MENU */}
          <div className="flex w-full items-center justify-between gap-3 mb-6">
            <div className="bg-root-canvas p-1 rounded-xl border border-root-accent/20 inline-flex shadow-sm">
              <button
                onClick={() => setActiveTab("resolusi")}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === "resolusi"
                    ? "bg-root-accent text-root-canvas shadow-md shadow-root-accent/20"
                    : "text-root-subtle hover:text-root-accent"
                }`}
              >
                Resolusi PBB
              </button>
              <button
                onClick={() => setActiveTab("keamanan")}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === "keamanan"
                    ? "bg-root-accent text-root-canvas shadow-md shadow-root-accent/20"
                    : "text-root-subtle hover:text-root-accent"
                }`}
              >
                Dewan Keamanan
              </button>
              <button
                onClick={() => setActiveTab("suara")}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === "suara"
                    ? "bg-root-accent text-root-canvas shadow-md shadow-root-accent/20"
                    : "text-root-subtle hover:text-root-accent"
                }`}
              >
                Suara Negara
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsElectionInfoOpen(open => !open)}
              aria-label="Informasi pemilihan anggota tidak tetap Dewan Keamanan PBB"
              aria-expanded={isElectionInfoOpen}
              aria-controls="pbb-security-council-election-info"
              title="Pemilihan anggota tidak tetap DK PBB"
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