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
  const [selectedDeficitKey, setSelectedDeficitKey] = useState<string | null>(null);

  if (!isOpen || !analysis) return null;

  const deficitCount = analysis.commodities.filter((item) => item.isDeficit).length;
  const items: RootAISuggestionItem[] = analysis.commodities.map((item) => ({
    key: item.key,
    label: item.label,
    status: item.isDeficit ? "deficit" : item.isSurplus ? "surplus" : "neutral",
    value: `${item.balance >= 0 ? "+" : ""}${formatNumber(item.balance)}`,
    ...(item.isDeficit
      ? {
          actionLabel: "Rekomendasi",
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
        subtitle="Evaluasi kebutuhan dan pasokan komoditas"
        sectionTitle="Rincian Analisis Komoditas"
        metrics={[
          { label: "Total Defisit Sektor", value: `-${formatNumber(analysis.totalDeficit)}`, tone: "deficit" },
          { label: "Total Surplus Sektor", value: `+${formatNumber(analysis.totalSurplus)}`, tone: "surplus" },
        ]}
        items={items}
        summary={
          deficitCount > 0
            ? `Terdapat ${deficitCount} komoditas di sektor ${analysis.sectorLabel} yang mengalami defisit pasokan. Pilih "Rekomendasi" pada komoditas defisit untuk melihat jumlah unit yang disarankan.`
            : `Sektor ${analysis.sectorLabel} saat ini memenuhi kebutuhan nasional berdasarkan perhitungan pasokan.`
        }
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
