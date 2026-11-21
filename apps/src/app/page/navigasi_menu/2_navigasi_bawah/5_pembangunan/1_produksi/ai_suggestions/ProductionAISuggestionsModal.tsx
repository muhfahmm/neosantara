"use client";

import React, { useState } from "react";
import RootAISuggestionsModal, {
  RootAISuggestionItem,
} from "@/app/page/root_modals_design_menu/RootAISuggestionsModal";
import AIDetailDefisit from "../../../3_produksi_konsumsi/2_industri_pangan/AI_detail_defisit";
import {
  ProductionSectorAnalysisResult,
  calculateDeficitDetailData,
} from "./productionAISuggestionsLogic";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface ProductionAISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ProductionSectorAnalysisResult | null;
  countryDetail: Record<string, unknown>;
  metadata: Record<string, unknown>;
  onBuildClick?: (buildingKey: string, label: string, quantity?: number) => void;
}

const formatNumber = (value: number) =>
  (Number(value) || 0).toLocaleString("id-ID", { maximumFractionDigits: 2 });

export default function ProductionAISuggestionsModal({
  isOpen,
  onClose,
  analysis,
  countryDetail,
  metadata,
  onBuildClick,
}: ProductionAISuggestionsModalProps) {
  const { t } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_construction_production.aiSuggestions.${key}`, params);
  const localizedItem = (key: string, fallback: string) => {
    const translationKey = `navigation_construction_production.aiSuggestions.buildingLabels.${key}`;
    const translated = t(translationKey);
    if (translated !== translationKey) return translated;
    const commodityKey = `navigation_food_consumption.commodities.${key}`;
    const commodity = t(commodityKey);
    return commodity === commodityKey ? fallback : commodity;
  };
  const [selectedDeficitKey, setSelectedDeficitKey] = useState<string | null>(null);

  if (!isOpen || !analysis) return null;

  const deficitCount = analysis.commodities.filter((item) => item.isDeficit).length;
  const items: RootAISuggestionItem[] = analysis.commodities.map((item) => ({
    key: item.key,
    label: localizedItem(item.key, item.label),
    status: item.isDeficit ? "deficit" : item.isSurplus ? "surplus" : "neutral",
    value: `${item.balance >= 0 ? "+" : ""}${formatNumber(item.balance)}`,
    ...(item.isDeficit
      ? {
          actionLabel: tr("recommendation"),
          onAction: () => setSelectedDeficitKey(item.key),
        }
      : {}),
  }));

  return (
    <>
      <RootAISuggestionsModal
        isOpen={isOpen}
        onClose={onClose}
        sectorLabel={analysis.sectorLabel}
        title={tr("title", { sector: analysis.sectorLabel })}
        subtitle={tr("subtitle")}
        sectionTitle={tr("sectionTitle")}
        itemCountLabel={tr("itemCount", { count: analysis.commodities.length })}
        metrics={[
          { label: tr("totalDeficit"), value: `-${formatNumber(analysis.totalDeficit)}`, tone: "deficit" },
          { label: tr("totalSurplus"), value: `+${formatNumber(analysis.totalSurplus)}`, tone: "surplus" },
        ]}
        summary={
          deficitCount > 0
            ? tr("summaryWithDeficit", { count: deficitCount, sector: analysis.sectorLabel })
            : tr("summaryBalanced", { sector: analysis.sectorLabel })
        }
        items={items}
      />

      {selectedDeficitKey && (
        <AIDetailDefisit
          isOpen={Boolean(selectedDeficitKey)}
          onClose={() => setSelectedDeficitKey(null)}
          data={calculateDeficitDetailData(selectedDeficitKey, countryDetail, metadata)}
          onGotoProduction={(_tab: string, key: string, quantity?: number) => {
            const metadataEntry = metadata[key];
            const label =
              typeof metadataEntry === "object" &&
              metadataEntry !== null &&
              "label" in metadataEntry &&
              typeof metadataEntry.label === "string"
                ? metadataEntry.label
                : key.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
            setSelectedDeficitKey(null);
            onClose();
            onBuildClick?.(key, label, quantity);
          }}
        />
      )}
    </>
  );
}
