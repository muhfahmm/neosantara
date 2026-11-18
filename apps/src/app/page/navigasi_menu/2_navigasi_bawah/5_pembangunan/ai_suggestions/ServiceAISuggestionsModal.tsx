"use client";

import React from "react";
import RootAISuggestionsModal, {
  RootAISuggestionItem,
} from "@/app/page/root_modals_design_menu/RootAISuggestionsModal";
import {
  TempatUmumSectorAnalysis,
  HunianSectorAnalysis,
} from "./serviceAISuggestionsLogic";

interface ServiceAISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempatUmumAnalysis?: TempatUmumSectorAnalysis | null;
  hunianAnalysis?: HunianSectorAnalysis | null;
  onBuildClick?: (buildingKey: string, label: string, quantity?: number) => void;
}

export default function ServiceAISuggestionsModal({
  isOpen,
  onClose,
  tempatUmumAnalysis,
  hunianAnalysis,
  onBuildClick,
}: ServiceAISuggestionsModalProps) {
  if (!isOpen || (!tempatUmumAnalysis && !hunianAnalysis)) return null;

  if (tempatUmumAnalysis) {
    const satisfactionTone =
      tempatUmumAnalysis.satisfactionScore <= 40
        ? "deficit"
        : tempatUmumAnalysis.satisfactionScore <= 75
          ? "neutral"
          : "surplus";
    const items: RootAISuggestionItem[] = tempatUmumAnalysis.facilities.map((item) => ({
      key: item.key,
      label: item.label,
      status: item.isDeficit ? "deficit" : "surplus",
      details: `Tersedia ${item.count} unit · Target ideal ${item.targetCount} unit`,
      value: item.isDeficit ? `Defisit -${item.deficit} unit` : `Mencukupi (${item.count} unit)`,
      ...(item.isDeficit
        ? {
            actionLabel: "Bangun",
            onAction: () => {
              onClose();
              onBuildClick?.(item.key, item.label, item.recommendedBuildQty);
            },
          }
        : {}),
    }));

    return (
      <RootAISuggestionsModal
        isOpen={isOpen}
        onClose={onClose}
        sectorLabel={tempatUmumAnalysis.tabLabel}
        subtitle="Evaluasi kebutuhan dan ketersediaan fasilitas publik"
        sectionTitle="Rincian Analisis Fasilitas"
        metrics={[
          {
            label: `Indeks Kepuasan · ${tempatUmumAnalysis.tabLabel}`,
            value: `${tempatUmumAnalysis.satisfactionScore} / 100`,
            tone: satisfactionTone,
            progress: tempatUmumAnalysis.satisfactionScore,
          },
          { label: "Rasio per Kapita", value: tempatUmumAnalysis.ratio.toFixed(2) },
          { label: "Persentase Keterpenuhan", value: `${tempatUmumAnalysis.percentageMet.toFixed(1)}%` },
        ]}
        items={items}
        summary={tempatUmumAnalysis.recommendation}
      />
    );
  }

  if (!hunianAnalysis) return null;

  const items: RootAISuggestionItem[] = hunianAnalysis.housingItems.map((item) => ({
    key: item.key,
    label: item.label,
    status: item.isDeficit ? "deficit" : "surplus",
    details: `Kapasitas ${item.capacityPerUnit} jiwa/unit · Terpasang ${item.count} unit (${item.totalCapacity.toLocaleString("id-ID", { maximumFractionDigits: 2 })} jiwa)`,
    value: item.isDeficit ? `Kebutuhan +${item.deficitUnitsNeeded} unit` : "Mencukupi",
    ...(item.isDeficit
      ? {
          actionLabel: "Bangun",
          onAction: () => {
            onClose();
            onBuildClick?.(item.key, item.label, item.deficitUnitsNeeded);
          },
        }
      : {}),
  }));

  return (
    <RootAISuggestionsModal
      isOpen={isOpen}
      onClose={onClose}
      sectorLabel={hunianAnalysis.tabLabel}
      subtitle="Evaluasi kapasitas hunian terhadap jumlah penduduk"
      sectionTitle="Rincian Analisis Hunian"
      metrics={[
        {
          label: "Kapasitas per Unit",
          value: `${hunianAnalysis.capacityPerUnit.toLocaleString("id-ID", { maximumFractionDigits: 2 })} jiwa`,
        },
        {
          label: "Kapasitas Terpasang",
          value: `${hunianAnalysis.totalCapacity.toLocaleString("id-ID", { maximumFractionDigits: 2 })} jiwa`,
        },
        {
          label: hunianAnalysis.isDeficit ? "Defisit Kapasitas Hunian" : "Surplus Kapasitas Hunian",
          value: hunianAnalysis.isDeficit
            ? `-${hunianAnalysis.populationDeficit.toLocaleString("id-ID", { maximumFractionDigits: 2 })} jiwa`
            : `+${hunianAnalysis.populationSurplus.toLocaleString("id-ID", { maximumFractionDigits: 2 })} jiwa`,
          tone: hunianAnalysis.isDeficit ? "deficit" : "surplus",
        },
      ]}
      items={items}
      summary={hunianAnalysis.recommendation}
    />
  );
}
