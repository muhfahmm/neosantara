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
  initialBuildingKey?: string;
  initialTab?: string;
}

export type MenuTab =
  | "kepuasan_rakyat"
  | "keterbukaan"
  | "kelistrikan"
  | "pajak"
  | "harga"
  | "sistem_ekonomi"
  | "subsidi"
  | "pembangunan";

type PembangunanSubTab =
  | "fasilitas_militer"
  | "produksi_pangan"
  | "hunian";

interface TabConfig {
  id: MenuTab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { id: "kepuasan_rakyat", label: "Kepuasan Rakyat", icon: Smile },
  { id: "keterbukaan", label: "Doktrin & Keterbukaan", icon: Globe },
  { id: "kelistrikan", label: "Statistik Kelistrikan", icon: Zap },
  { id: "pajak", label: "Pajak", icon: FileText },
  { id: "harga", label: "Harga Barang Pokok", icon: Tag },
  { id: "sistem_ekonomi", label: "Kebijakan & Sistem Ekonomi", icon: Scale },
  { id: "subsidi", label: "Subsidi", icon: HandHelping },
  { id: "pembangunan", label: "Pembangunan", icon: Building2 },
];

export function resolveMenuTabFromKey(keyOrTab?: string): MenuTab {
  if (!keyOrTab) return "kepuasan_rakyat";
  const normalized = keyOrTab.toLowerCase().trim();

  // 1. Direct matching tab names
  if (normalized === "kepuasan_rakyat" || normalized === "kepuasan") return "kepuasan_rakyat";
  if (normalized === "produksi_pangan" || normalized === "pangan") return "pembangunan";
  if (normalized === "hunian" || normalized === "perumahan") return "pembangunan";
  if (normalized === "keterbukaan" || normalized === "doktrin") return "keterbukaan";
  if (normalized === "kelistrikan" || normalized === "listrik") return "kelistrikan";
  if (normalized === "pajak") return "pajak";
  if (normalized === "harga" || normalized === "harga_barang_pokok") return "harga";
  if (normalized === "sistem_ekonomi" || normalized === "sistemekonomi") return "sistem_ekonomi";
  if (normalized === "subsidi") return "subsidi";
  if (["emas", "uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium", "logam_tanah_jarang", "bijih_besi", "mineral", "mineral_energi", "mineral_kritis"].includes(normalized)) return "pembangunan";
  if (["pabrik_semikonduktor", "pabrik_mesin", "pabrik_besi", "semen_beton", "kayu", "manufaktur"].includes(normalized)) return "pembangunan";
  if (normalized === "fasilitas_militer" || normalized === "militer" || normalized === "layananpublik" || normalized === "pembangunan") return "pembangunan";

  // 2. Kelistrikan items
  if (
    normalized.startsWith("pembangkit_listrik") ||
    normalized.includes("pltn") ||
    normalized.includes("pltu") ||
    normalized.includes("plta") ||
    normalized.includes("plts") ||
    normalized.includes("listrik")
  ) {
    return "pembangunan";
  }

  // 3. Pangan items
  const panganKeywords = [
    "padi", "gandum", "jagung", "kedelai", "ayam", "sapi", "domba", "kambing",
    "udang", "salmon", "tuna", "ikan", "tepung", "minyak", "gula", "daging", "susu", "makanan"
  ];
  if (panganKeywords.some((k) => normalized.includes(k))) {
    return "pembangunan";
  }

  // 4. Hunian items
  const hunianKeywords = [
    "rumah", "apartemen", "mansion", "hunian", "subsidi_perumahan", "rusun", "kondominium"
  ];
  if (hunianKeywords.some((k) => normalized.includes(k))) {
    return "pembangunan";
  }

  // 5. Default fallback for construction / military items
  return "pembangunan";
}

function resolvePembangunanSubTab(keyOrTab?: string): PembangunanSubTab {
  if (!keyOrTab) return "fasilitas_militer";
  const normalized = keyOrTab.toLowerCase().trim();
  if (["produksi_pangan", "pangan"].includes(normalized)) return "produksi_pangan";
  if (["hunian", "perumahan"].includes(normalized)) return "hunian";
  if (["mineral_energi", "mineral_kritis", "mineral", "emas", "uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium", "logam_tanah_jarang", "bijih_besi"].includes(normalized)) return "fasilitas_militer";
  if (["manufaktur", "pabrik_semikonduktor", "pabrik_mesin", "pabrik_besi", "semen_beton", "kayu"].includes(normalized)) return "fasilitas_militer";
  if (
    normalized.startsWith("pembangkit_listrik") ||
    normalized === "kelistrikan" ||
    normalized === "listrik" ||
    normalized === "fasilitas_militer" ||
    normalized === "militer" ||
    normalized === "layananpublik"
  ) return "fasilitas_militer";

  const panganKeywords = [
    "padi", "gandum", "jagung", "kedelai", "ayam", "sapi", "domba", "kambing",
    "udang", "salmon", "tuna", "ikan", "tepung", "gula", "daging", "susu", "makanan",
    "minyak", "air_mineral", "beras", "roti", "mie_instan"
  ];
  if (panganKeywords.some((keyword) => normalized.includes(keyword))) return "produksi_pangan";

  const hunianKeywords = ["rumah", "apartemen", "mansion", "hunian", "subsidi_perumahan", "rusun", "kondominium"];
  if (hunianKeywords.some((keyword) => normalized.includes(keyword))) return "hunian";
  if (normalized.includes("pabrik_") || normalized.includes("semen") || normalized.includes("manufaktur")) return "fasilitas_militer";
  return "fasilitas_militer";
}

export default function DevelopingAIBuilding({
  countryDetail,
  metadata,
  initialBuildingKey,
  initialTab,
}: DevelopingAIBuildingProps) {
  const [liveCountryDetail, setLiveCountryDetail] = useState<Record<string, any> | null>(
    countryDetail ? (countryDetail as Record<string, any>) : null
  );
  const [activeTab, setActiveTab] = useState<MenuTab>(() => {
    if (initialBuildingKey) return resolveMenuTabFromKey(initialBuildingKey);
    if (initialTab) return resolveMenuTabFromKey(initialTab);
    return "kepuasan_rakyat";
  });
  const [activePembangunanTab, setActivePembangunanTab] = useState<PembangunanSubTab>(() =>
    resolvePembangunanSubTab(initialBuildingKey || initialTab),
  );

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
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#00FFAA]/20 bg-[#0F2424] text-[#E0E0E0] shadow-2xl md:flex-row">
      <aside className="shrink-0 border-b border-[#00FFAA]/20 bg-[#0A1A1A] md:flex md:min-h-0 md:w-64 md:flex-col md:border-b-0 md:border-r xl:w-72">
        <div className="hidden items-center gap-1.5 border-b border-[#00FFAA]/15 px-4 py-3 text-xs font-bold text-[#00FFAA] md:flex">
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{countryName}</span>
        </div>
        <nav aria-label="Kategori detail negara AI" className="flex gap-1.5 overflow-x-auto p-2.5 no-scrollbar md:min-h-0 md:flex-1 md:flex-col md:gap-1 md:overflow-y-auto md:overflow-x-hidden md:p-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex shrink-0 cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-xl border px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-wider transition-all md:w-full md:whitespace-normal md:px-3.5 md:py-3 md:text-xs ${
                  isActive
                    ? "border-[#00FFAA]/40 bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20"
                    : "border-[#00FFAA]/15 bg-[#0F2424]/70 text-[#6B8A8A] hover:border-[#00FFAA]/40 hover:bg-[#0F2424] hover:text-[#00FFAA]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#0A1A1A]" : "text-[#00FFAA]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* BODY KONTEN TAB SPESIFIK */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#0F2424] p-4 sm:p-6 custom-scrollbar">
        {activeTab === "kepuasan_rakyat" && (
          <SpektrumKepuasanSection
            countryDetail={liveCountryDetail}
            metadata={metadata}
            onNavigateTab={(targetTab) => {
              setActiveTab(resolveMenuTabFromKey(targetTab));
              setActivePembangunanTab(resolvePembangunanSubTab(targetTab));
            }}
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

        {activeTab === "pembangunan" && (
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#00FFAA]/20 bg-[#0F2424]">
            <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-[#00FFAA]/20 bg-[#0A1A1A] p-3 no-scrollbar">
              {([
                { id: "fasilitas_militer", label: "Fasilitas & Militer", icon: Building2 },
                { id: "produksi_pangan", label: "Produksi Pangan", icon: Wheat },
                { id: "hunian", label: "Hunian", icon: Home },
              ] as const).map((tab) => {
                const Icon = tab.icon;
                const isActive = activePembangunanTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePembangunanTab(tab.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                      isActive
                        ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20"
                        : "text-[#6B8A8A] hover:bg-[#0F2424] hover:text-[#00FFAA]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
              {activePembangunanTab === "fasilitas_militer" && (
                <PembangunanSipilMiliterSection
                  countryDetail={liveCountryDetail}
                  metadata={metadata}
                  initialBuildingKey={initialBuildingKey}
                />
              )}
              {activePembangunanTab === "produksi_pangan" && (
                <ProduksiPanganSection countryDetail={liveCountryDetail} metadata={metadata} />
              )}
              {activePembangunanTab === "hunian" && (
                <HunianPermukimanSection countryDetail={liveCountryDetail} metadata={metadata} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
