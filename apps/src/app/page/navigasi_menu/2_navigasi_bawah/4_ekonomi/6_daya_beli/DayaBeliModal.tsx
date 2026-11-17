"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { HandHelping, Tag } from "lucide-react";
import RootModalTabs from "@/app/page/root_modals_design_menu/RootModalTabs";

const HargaModal = dynamic(() => import("./1_harga/HargaModal"), { ssr: false });
const SubsidiModal = dynamic(() => import("./2_kebijakan_subsidi/SubsidiModal"), { ssr: false });

type DayaBeliTab = "harga" | "subsidi";
type CountryDetail = Record<string, unknown>;
type CountryDetailUpdater = (detail: CountryDetail | ((prev: CountryDetail) => CountryDetail)) => void;

interface DayaBeliModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: DayaBeliTab;
  countryDetail: CountryDetail | null;
  setCountryDetail: CountryDetailUpdater;
}

export default function DayaBeliModal({
  isOpen,
  onClose,
  initialTab,
  countryDetail,
  setCountryDetail,
}: DayaBeliModalProps) {
  const [activeTab, setActiveTab] = useState<DayaBeliTab>(initialTab);

  if (!isOpen) return null;

  const tabBar = (
    <div className="flex shrink-0 border-b border-root-accent/20 bg-root-canvas px-4 py-2 sm:px-6">
      <RootModalTabs
        items={[
          {
            label: "Harga Kebutuhan",
            icon: <Tag aria-hidden="true" className="h-3.5 w-3.5" />,
            isActive: activeTab === "harga",
            onClick: () => setActiveTab("harga"),
          },
          {
            label: "Kebijakan Subsidi",
            icon: <HandHelping aria-hidden="true" className="h-3.5 w-3.5" />,
            isActive: activeTab === "subsidi",
            onClick: () => setActiveTab("subsidi"),
          },
        ]}
      />
    </div>
  );

  return activeTab === "harga" ? (
    <HargaModal
      isOpen={isOpen}
      onClose={onClose}
      countryDetail={countryDetail}
      setCountryDetail={setCountryDetail}
      tabBar={tabBar}
    />
  ) : (
    <SubsidiModal
      isOpen={isOpen}
      onClose={onClose}
      countryDetail={countryDetail}
      setCountryDetail={setCountryDetail}
      tabBar={tabBar}
    />
  );
}
