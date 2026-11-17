"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BarChart3, TrendingUp } from "lucide-react";
import RootModalTabs from "@/app/page/root_modals_design_menu/RootModalTabs";

const PemasukkanPengeluaranModal = dynamic(
  () => import("./1_anggaran/PemasukkanPengeluaranModal"),
  { ssr: false },
);
const PDBModal = dynamic(
  () => import("./2_pdb_nasional_dunia/PDBModal"),
  { ssr: false },
);

type PendapatanTab = "anggaran" | "pdb";
type CountryDetail = Record<string, unknown>;
type SelectedCountry = {
  country?: string;
  capital?: string;
  iso?: string;
} | null;

interface PendapatanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: PendapatanTab;
  countryDetail: CountryDetail | null;
  selectedCountry: SelectedCountry;
  prefetchedAllCountries?: Array<Record<string, unknown>>;
  onGotoPajak?: () => void;
  onGotoProduction?: (tab: string, key: string) => void;
}

export default function PendapatanModal({
  isOpen,
  onClose,
  initialTab,
  countryDetail,
  selectedCountry,
  prefetchedAllCountries,
  onGotoPajak,
  onGotoProduction,
}: PendapatanModalProps) {
  const [activeTab, setActiveTab] = useState<PendapatanTab>(initialTab);

  if (!isOpen) return null;

  const tabBar = (
    <div className="flex shrink-0 border-b border-root-accent/20 bg-root-canvas px-4 py-2 sm:px-6">
      <RootModalTabs
        items={[
          {
            label: "Anggaran",
            icon: <BarChart3 aria-hidden="true" className="h-3.5 w-3.5" />,
            isActive: activeTab === "anggaran",
            onClick: () => setActiveTab("anggaran"),
          },
          {
            label: "PDB Nasional & Dunia",
            icon: <TrendingUp aria-hidden="true" className="h-3.5 w-3.5" />,
            isActive: activeTab === "pdb",
            onClick: () => setActiveTab("pdb"),
          },
        ]}
      />
    </div>
  );

  return activeTab === "anggaran" ? (
    <PemasukkanPengeluaranModal
      isOpen={isOpen}
      onClose={onClose}
      countryDetail={countryDetail}
      selectedCountry={selectedCountry}
      onGotoPajak={onGotoPajak}
      onGotoProduction={onGotoProduction}
      tabBar={tabBar}
    />
  ) : (
    <PDBModal
      isOpen={isOpen}
      onClose={onClose}
      countryDetail={countryDetail}
      selectedCountry={selectedCountry}
      prefetchedAllCountries={prefetchedAllCountries}
      tabBar={tabBar}
    />
  );
}
