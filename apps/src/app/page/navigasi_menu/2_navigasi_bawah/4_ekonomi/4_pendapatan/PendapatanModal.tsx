"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BarChart3, TrendingUp } from "lucide-react";
import RootModalSearchToolbar from "@/app/page/root_modals_design_menu/RootModalSearchToolbar";

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
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  const tabBar = (
    <RootModalSearchToolbar
      layout="default"
      showSearch={activeTab === "pdb"}
      items={[
        {
          label: "Anggaran",
          icon: <BarChart3 aria-hidden="true" className="h-3.5 w-3.5" />,
          isActive: activeTab === "anggaran",
          onClick: () => {
            setSearchQuery("");
            setActiveTab("anggaran");
          },
        },
        {
          label: "PDB Nasional & Dunia",
          icon: <TrendingUp aria-hidden="true" className="h-3.5 w-3.5" />,
          isActive: activeTab === "pdb",
          onClick: () => setActiveTab("pdb"),
        },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Cari negara / benua..."
      searchAriaLabel="Cari negara atau benua"
    />
  );

  return activeTab === "anggaran" ? (
    <PemasukkanPengeluaranModal
      isOpen={isOpen}
      onClose={handleClose}
      countryDetail={countryDetail}
      selectedCountry={selectedCountry}
      onGotoPajak={onGotoPajak}
      onGotoProduction={onGotoProduction}
      tabBar={tabBar}
    />
  ) : (
    <PDBModal
      isOpen={isOpen}
      onClose={handleClose}
      countryDetail={countryDetail}
      selectedCountry={selectedCountry}
      prefetchedAllCountries={prefetchedAllCountries}
      searchQuery={searchQuery}
      tabBar={tabBar}
    />
  );
}
