"use client";

import React, { useEffect, useState } from "react";
import {
  Smile,
  Zap,
  FileText,
  Tag,
  Scale,
  HandHelping,
  Building2,
  Globe,
  Wheat,
  Home,
} from "lucide-react";
import {
  applyNpcCountrySimulationState,
  NPC_COUNTRY_SIMULATION_UPDATED_EVENT,
} from "@/app/logic/npc_country_simulation/npcCountrySimulation";

import KelistrikanSection from "./sections/KelistrikanSection";
import PajakSection from "./sections/PajakSection";
import HargaBarangPokokSection from "./sections/HargaBarangPokokSection";
import SistemEkonomiSection from "./sections/SistemEkonomiSection";
import SubsidiSection from "./sections/SubsidiSection";
import PembangunanSipilMiliterSection from "./sections/PembangunanSipilMiliterSection";
import SpektrumKepuasanSection from "./sections/SpektrumKepuasanSection";
import ProduksiPanganSection from "./sections/ProduksiPanganSection";
import HunianPermukimanSection from "./sections/HunianPermukimanSection";
import DoktrinKeterbukaanSection from "./sections/DoktrinKeterbukaanSection";

interface DevelopingAIBuildingProps {
  countryDetail?: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
}

type MenuTab =
  | "kepuasan_rakyat"
  | "produksi_pangan"
  | "hunian"
  | "keterbukaan"
  | "kelistrikan"
  | "pajak"
  | "harga"
  | "sistem_ekonomi"
  | "subsidi"
  | "fasilitas_militer";

interface TabConfig {
  id: MenuTab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { id: "kepuasan_rakyat", label: "Kepuasan Rakyat", icon: Smile },
  { id: "produksi_pangan", label: "Produksi Pangan", icon: Wheat },
  { id: "hunian", label: "Hunian Permukiman", icon: Home },
  { id: "keterbukaan", label: "Doktrin & Keterbukaan", icon: Globe },
  { id: "kelistrikan", label: "Statistik Kelistrikan", icon: Zap },
  { id: "pajak", label: "Pajak", icon: FileText },
  { id: "harga", label: "Harga Barang Pokok", icon: Tag },
  { id: "sistem_ekonomi", label: "Kebijakan & Sistem Ekonomi", icon: Scale },
  { id: "subsidi", label: "Subsidi", icon: HandHelping },
  { id: "fasilitas_militer", label: "Fasilitas & Militer", icon: Building2 },
];

export default function DevelopingAIBuilding({
  countryDetail,
  metadata,
}: DevelopingAIBuildingProps) {
  const [liveCountryDetail, setLiveCountryDetail] = useState<Record<string, any> | null>(
    countryDetail ? (countryDetail as Record<string, any>) : null
  );
  const [activeTab, setActiveTab] = useState<MenuTab>("kepuasan_rakyat");

  useEffect(() => {
    const refreshSimulation = () => {
      setLiveCountryDetail(
        countryDetail ? (applyNpcCountrySimulationState(countryDetail) as Record<string, any>) : null
      );
    };
    window.addEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshSimulation);
    refreshSimulation();
    return () => window.removeEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshSimulation);
  }, [countryDetail]);

  const countryName =
    liveCountryDetail?.country ||
    liveCountryDetail?.nama_negara ||
    liveCountryDetail?.name_id ||
    liveCountryDetail?.name_en ||
    "Negara";

  return (
    <div className="flex flex-col h-full w-full bg-[#0F2424] text-[#E0E0E0] rounded-2xl overflow-hidden border border-[#00FFAA]/20 shadow-2xl">
      {/* TOP BAR / TABS MENU NAVIGASI KATEGORI TERPISAH */}
      <div className="bg-[#0A1A1A] border-b border-[#00FFAA]/20 px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20 font-bold"
                    : "bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] border border-[#00FFAA]/20 hover:border-[#00FFAA]/40"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#0A1A1A]" : "text-[#00FFAA]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[10px] font-bold text-[#00FFAA]">
          <Globe className="w-3.5 h-3.5" />
          <span>{countryName}</span>
        </div>
      </div>

      {/* BODY KONTEN TAB SPESIFIK */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-[#0F2424]">
        {activeTab === "kepuasan_rakyat" && (
          <SpektrumKepuasanSection
            countryDetail={liveCountryDetail}
            metadata={metadata}
            onNavigateTab={(targetTab) => setActiveTab(targetTab as MenuTab)}
          />
        )}

        {activeTab === "produksi_pangan" && (
          <ProduksiPanganSection
            countryDetail={liveCountryDetail}
            metadata={metadata}
          />
        )}

        {activeTab === "hunian" && (
          <HunianPermukimanSection
            countryDetail={liveCountryDetail}
            metadata={metadata}
          />
        )}

        {activeTab === "keterbukaan" && (
          <DoktrinKeterbukaanSection countryDetail={liveCountryDetail} />
        )}

        {activeTab === "kelistrikan" && (
          <KelistrikanSection countryDetail={liveCountryDetail} metadata={metadata} />
        )}

        {activeTab === "pajak" && (
          <PajakSection countryDetail={liveCountryDetail} />
        )}

        {activeTab === "harga" && (
          <HargaBarangPokokSection countryDetail={liveCountryDetail} />
        )}

        {activeTab === "sistem_ekonomi" && (
          <SistemEkonomiSection countryDetail={liveCountryDetail} />
        )}

        {activeTab === "subsidi" && (
          <SubsidiSection countryDetail={liveCountryDetail} />
        )}

        {activeTab === "fasilitas_militer" && (
          <PembangunanSipilMiliterSection
            countryDetail={liveCountryDetail}
            metadata={metadata}
          />
        )}
      </div>
    </div>
  );
}
