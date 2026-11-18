"use client";

import React from "react";
import RootAISuggestionsModal, {
  RootAISuggestionItem,
} from "@/app/page/root_modals_design_menu/RootAISuggestionsModal";
import { SECTOR_MAP } from "./logic/AI_suggestionsLogic";

interface AISuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectorLabel: string;
  totalDeficit: number;
  totalSurplus: number;
  commodities: {
    key?: string;
    label: string;
    balance: number;
    isDeficit: boolean;
    isSurplus: boolean;
  }[];
  onCommodityClick?: (commodityKey: string) => void;
  onDeficitClick?: (commodityKey: string) => void;
}

const formatNumber = (value: number) =>
  (Number(value) || 0).toLocaleString("id-ID");

export default function AISuggestModal({
  isOpen,
  onClose,
  sectorLabel,
  totalDeficit,
  totalSurplus,
  commodities,
  onCommodityClick,
  onDeficitClick,
}: AISuggestModalProps) {
  const SectorIcon =
    Object.values(SECTOR_MAP).find((sector) => sector.label === sectorLabel)?.icon;

  const items: RootAISuggestionItem[] = commodities.map((item, index) => {
    const commodityKey = item.key;

    return {
      key: commodityKey || `${item.label}-${index}`,
      label: item.label,
      status: item.isDeficit ? "deficit" : item.isSurplus ? "surplus" : "neutral",
      value: `${item.isDeficit ? "-" : item.isSurplus ? "+" : ""}${formatNumber(Math.abs(item.balance))}`,
      ...(item.isDeficit && commodityKey && onDeficitClick
        ? {
            actionLabel: "Detail",
            onAction: () => onDeficitClick(commodityKey),
          }
        : {}),
      ...(commodityKey && onCommodityClick
        ? {
            navigationLabel: "Buka halaman produksi",
            onNavigate: () => onCommodityClick(commodityKey),
          }
        : {}),
    };
  });

  return (
    <RootAISuggestionsModal
      isOpen={isOpen}
      onClose={onClose}
      sectorLabel={sectorLabel}
      title={`Analisis Sektor AI - ${sectorLabel}`}
      subtitle="Evaluasi produksi dan kebutuhan komoditas"
      sectionTitle="Rincian Komoditas"
      icon={SectorIcon}
      metrics={[
        { label: "Total Defisit", value: `-${formatNumber(totalDeficit)}`, tone: "deficit" },
        { label: "Total Surplus", value: `+${formatNumber(totalSurplus)}`, tone: "surplus" },
      ]}
      items={items}
    />
  );
}
