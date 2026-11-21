"use client";

import React from "react";
import RootAISuggestionsModal, {
  RootAISuggestionItem,
} from "@/app/page/root_modals_design_menu/RootAISuggestionsModal";
import {
  TempatUmumSectorAnalysis,
  HunianSectorAnalysis,
} from "./serviceAISuggestionsLogic";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

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
  const { t, language } = useLanguage();
  const publicTranslation = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_construction_public_places.aiSuggestions.${key}`, params);
  const housingTranslation = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_construction_housing.aiSuggestions.${key}`, params);
  const localized = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };
  const formatNumber = (value: number) =>
    value.toLocaleString(language, { maximumFractionDigits: 2 });

  if (!isOpen || (!tempatUmumAnalysis && !hunianAnalysis)) return null;

  if (tempatUmumAnalysis) {
    const sectorLabel = localized(
      `navigation_construction_public_places.groups.${tempatUmumAnalysis.tabId}.label`,
      tempatUmumAnalysis.tabLabel
    );
    const satisfactionTone =
      tempatUmumAnalysis.satisfactionScore <= 40
        ? "deficit"
        : tempatUmumAnalysis.satisfactionScore <= 75
          ? "neutral"
          : "surplus";
    const items: RootAISuggestionItem[] = tempatUmumAnalysis.facilities.map((item) => ({
      key: item.key,
      label: localized(`navigation_construction_public_places.facilities.${item.key}`, item.label),
      status: item.isDeficit ? "deficit" : "surplus",
      details: publicTranslation("facilityDetails", { count: item.count, target: item.targetCount }),
      value: item.isDeficit
        ? publicTranslation("facilityDeficit", { count: item.deficit })
        : publicTranslation("facilitySufficient", { count: item.count }),
      ...(item.isDeficit
        ? {
            actionLabel: publicTranslation("build"),
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
        sectorLabel={sectorLabel}
        title={publicTranslation("title", { sector: sectorLabel })}
        subtitle={publicTranslation("subtitle")}
        sectionTitle={publicTranslation("sectionTitle")}
        itemCountLabel={publicTranslation("itemCount", { count: items.length })}
        metrics={[
          {
            label: publicTranslation("satisfactionIndex", { sector: sectorLabel }),
            value: `${tempatUmumAnalysis.satisfactionScore} / 100`,
            tone: satisfactionTone,
            progress: tempatUmumAnalysis.satisfactionScore,
          },
          { label: publicTranslation("perCapitaRatio"), value: tempatUmumAnalysis.ratio.toFixed(2) },
          { label: publicTranslation("fulfillment"), value: `${tempatUmumAnalysis.percentageMet.toFixed(1)}%` },
        ]}
        items={items}
        summary={publicTranslation(
          tempatUmumAnalysis.status === "MENCUKUPI"
            ? "summarySufficient"
            : tempatUmumAnalysis.status === "TERBATAS"
              ? "summaryLimited"
              : "summaryCrisis",
          { sector: sectorLabel }
        )}
      />
    );
  }

  if (!hunianAnalysis) return null;

  const sectorLabel = localized(
    `navigation_construction_housing.tabs.${hunianAnalysis.tabId}`,
    hunianAnalysis.tabLabel
  );
  const items: RootAISuggestionItem[] = hunianAnalysis.housingItems.map((item) => ({
    key: item.key,
    label: localized(`navigation_construction_housing.buildings.${item.key}`, item.label),
    status: item.isDeficit ? "deficit" : "surplus",
    details: housingTranslation("itemDetails", {
      capacity: formatNumber(item.capacityPerUnit),
      count: item.count,
      total: formatNumber(item.totalCapacity),
    }),
    value: item.isDeficit
      ? housingTranslation("unitsNeeded", { count: item.deficitUnitsNeeded })
      : housingTranslation("sufficient"),
    ...(item.isDeficit
      ? {
          actionLabel: housingTranslation("build"),
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
      sectorLabel={sectorLabel}
      title={housingTranslation("title", { sector: sectorLabel })}
      subtitle={housingTranslation("subtitle")}
      sectionTitle={housingTranslation("sectionTitle")}
      itemCountLabel={housingTranslation("itemCount", { count: items.length })}
      metrics={[
        {
          label: housingTranslation("capacityPerUnit"),
          value: `${formatNumber(hunianAnalysis.capacityPerUnit)} ${housingTranslation("people")}`,
        },
        {
          label: housingTranslation("installedCapacity"),
          value: `${formatNumber(hunianAnalysis.totalCapacity)} ${housingTranslation("people")}`,
        },
        {
          label: housingTranslation(hunianAnalysis.isDeficit ? "capacityDeficit" : "capacitySurplus"),
          value: hunianAnalysis.isDeficit
            ? `-${formatNumber(hunianAnalysis.populationDeficit)} ${housingTranslation("people")}`
            : `+${formatNumber(hunianAnalysis.populationSurplus)} ${housingTranslation("people")}`,
          tone: hunianAnalysis.isDeficit ? "deficit" : "surplus",
        },
      ]}
      items={items}
      summary={housingTranslation(
        hunianAnalysis.isDeficit ? "summaryDeficit" : "summarySufficient",
        {
          deficit: formatNumber(hunianAnalysis.populationDeficit),
          surplus: formatNumber(hunianAnalysis.populationSurplus),
          units: formatNumber(hunianAnalysis.deficitUnitsNeeded),
          population: formatNumber(hunianAnalysis.population),
          sector: sectorLabel,
        }
      )}
    />
  );
}
