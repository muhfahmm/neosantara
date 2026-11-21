"use client";

import React from "react";
import RootAISuggestionsModal, {
  RootAISuggestionItem,
} from "@/app/page/root_modals_design_menu/RootAISuggestionsModal";
import { SECTOR_MAP } from "./logic/AI_suggestionsLogic";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface AISuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectorId: string;
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

const formatNumber = (value: number, locale: string) =>
  (Number(value) || 0).toLocaleString(locale);

export default function AISuggestModal({
  isOpen,
  onClose,
  sectorId,
  totalDeficit,
  totalSurplus,
  commodities,
  onCommodityClick,
  onDeficitClick,
}: AISuggestModalProps) {
  const { t, language } = useLanguage();
  const sectorLabel = t(`navigation_food_consumption.sectors.${sectorId}`);
  const SectorIcon = SECTOR_MAP[sectorId]?.icon;

  const items: RootAISuggestionItem[] = commodities.map((item, index) => {
    const commodityKey = item.key;
    const translationKey = commodityKey
      ? `navigation_food_consumption.commodities.${commodityKey}`
      : "";
    const translatedLabel = translationKey ? t(translationKey) : item.label;
    const label = translatedLabel === translationKey ? item.label : translatedLabel;

    return {
      key: commodityKey || `${label}-${index}`,
      label,
      status: item.isDeficit ? "deficit" : item.isSurplus ? "surplus" : "neutral",
      value: `${item.isDeficit ? "-" : item.isSurplus ? "+" : ""}${formatNumber(Math.abs(item.balance), language)}`,
      ...(item.isDeficit && commodityKey && onDeficitClick
        ? {
            actionLabel: t("navigation_food_consumption.ai.detailAction"),
            onAction: () => onDeficitClick(commodityKey),
          }
        : {}),
      ...(commodityKey && onCommodityClick
        ? {
            navigationLabel: t("navigation_food_consumption.ai.openProduction"),
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
      title={t("navigation_food_consumption.ai.title", { sector: sectorLabel })}
      subtitle={t("navigation_food_consumption.ai.subtitle")}
      sectionTitle={t("navigation_food_consumption.ai.sectionTitle")}
      icon={SectorIcon}
      itemCountLabel={t("navigation_food_consumption.ai.commodityCount", { count: items.length })}
      metrics={[
        { label: t("navigation_food_consumption.ai.totalDeficit"), value: `-${formatNumber(totalDeficit, language)}`, tone: "deficit" },
        { label: t("navigation_food_consumption.ai.totalSurplus"), value: `+${formatNumber(totalSurplus, language)}`, tone: "surplus" },
      ]}
      items={items}
    />
  );
}
