"use client";
import React from "react";
import RootConfirmModal from "@/app/page/root_modals_design_menu/RootConfirmModal";
import { getWaktuPembangunanKedutaanBonusPercent } from "@/app/page/bonus_logic";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface BuildEmbassyModalProps {
  isOpen: boolean;
  countryName?: string | null;
  continent?: string | null;
  currentBudget?: number;
  cost?: number;
  buildTimeDays?: number;
  countryDetail?: Record<string, unknown> | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BuildEmbassyModal({
  isOpen,
  countryName,
  continent,
  currentBudget = 0,
  cost = 0,
  buildTimeDays = 60,
  countryDetail,
  onClose,
  onConfirm,
}: BuildEmbassyModalProps) {
  const { t, language } = useLanguage();
  const continentLabel = continent || t("detail_negara_ai.embassy.otherContinent");
  const budgetAfterBuild = currentBudget - cost;
  const formattedCurrentBudget = currentBudget.toLocaleString(language, { maximumFractionDigits: 2 });
  const formattedBudgetAfterBuild = budgetAfterBuild.toLocaleString(language, { maximumFractionDigits: 2 });
  const hasBudget = currentBudget >= cost;

  const discountPct = getWaktuPembangunanKedutaanBonusPercent(countryDetail);
  const embassyCostDiscountPct = cost > 0 ? Math.max(0, (1 - cost / 10) * 100) : 0;
  const effectiveBuildTimeDays =
    discountPct > 0
      ? Math.max(1, Math.floor(buildTimeDays * (1 - discountPct / 100)))
      : buildTimeDays;

  return (
    <RootConfirmModal
      isOpen={isOpen}
      title={t("detail_negara_ai.embassy.buildTitle")}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmLabel={hasBudget ? t("detail_negara_ai.embassy.buildConfirm") : t("detail_negara_ai.embassy.insufficientBudget")}
      confirmDisabled={!hasBudget}
      footerBorderClassName="border-root-accent/20"
    >
      <div className="flex-1">
        <p className="text-sm sm:text-base text-root-text mb-4 leading-relaxed">
          {t("detail_negara_ai.embassy.buildPromptPrefix")}{" "}
          <strong className="text-white">{countryName}</strong>? {t("detail_negara_ai.embassy.buildCostIn")}{" "}
          <strong className="text-white">{continentLabel}</strong> {t("detail_negara_ai.embassy.is")}{" "}
          {embassyCostDiscountPct > 0 ? (
            <span>
              <span className="line-through text-rose-400 mr-1">10 NEO</span>
              <strong className="text-root-accent">
                {cost.toLocaleString(language, { maximumFractionDigits: 2 })} NEO
              </strong>
            </span>
          ) : (
            <strong className="text-root-accent">{cost.toLocaleString(language, { maximumFractionDigits: 2 })} NEO</strong>
          )}{" "}
          {t("detail_negara_ai.embassy.withBuildTime")}{" "}
          {discountPct > 0 ? (
            <span>
              <span className="line-through text-rose-400 mr-1">{buildTimeDays} {t("detail_negara_ai.embassy.days")}</span>
              <strong className="text-root-accent">{effectiveBuildTimeDays} {t("detail_negara_ai.embassy.days")}</strong>
            </span>
          ) : (
            <strong className="text-root-accent">{buildTimeDays} {t("detail_negara_ai.embassy.days")}</strong>
          )}
          .
        </p>

        <p className="text-sm sm:text-base text-root-subtle leading-relaxed">
          {t("detail_negara_ai.embassy.currentBudget")}{" "}
          <strong className="text-root-text">
            {currentBudget >= 0 ? "+" : ""}
            {formattedCurrentBudget} NEO
          </strong>
          . {t("detail_negara_ai.embassy.afterBuildBudget")}{" "}
          <strong className="text-root-accent">
            {budgetAfterBuild >= 0 ? "+" : ""}
            {formattedBudgetAfterBuild} NEO
          </strong>
          .
        </p>
      </div>
    </RootConfirmModal>
  );
}
