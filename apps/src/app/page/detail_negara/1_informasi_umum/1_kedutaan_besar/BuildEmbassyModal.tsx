"use client";
import React from "react";
import RootConfirmModal from "@/app/page/root_modals_design_menu/RootConfirmModal";
import { getWaktuPembangunanKedutaanBonusPercent } from "@/app/page/bonus_logic";

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
  const continentLabel = continent || "Lainnya";
  const budgetAfterBuild = currentBudget - cost;
  const formattedCurrentBudget = currentBudget.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  const formattedBudgetAfterBuild = budgetAfterBuild.toLocaleString("id-ID", { maximumFractionDigits: 2 });
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
      title="Konfirmasi Bangun Kedutaan"
      onClose={onClose}
      onConfirm={onConfirm}
      confirmLabel={hasBudget ? "Bangun Kedutaan" : "Kas Tidak Mencukupi"}
      confirmDisabled={!hasBudget}
      footerBorderClassName="border-root-accent/20"
    >
      <div className="flex-1">
        <p className="text-sm sm:text-base text-root-text mb-4 leading-relaxed">
          Apakah Anda ingin membangun kedutaan di{" "}
          <strong className="text-white">{countryName}</strong>? Biaya pembangunan di{" "}
          <strong className="text-white">{continentLabel}</strong> adalah{" "}
          {embassyCostDiscountPct > 0 ? (
            <span>
              <span className="line-through text-rose-400 mr-1">10 NEO</span>
              <strong className="text-root-accent">
                {cost.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
              </strong>
            </span>
          ) : (
            <strong className="text-root-accent">{cost} NEO</strong>
          )}{" "}
          dengan waktu pembangunan{" "}
          {discountPct > 0 ? (
            <span>
              <span className="line-through text-rose-400 mr-1">{buildTimeDays} hari</span>
              <strong className="text-root-accent">{effectiveBuildTimeDays} hari</strong>
            </span>
          ) : (
            <strong className="text-root-accent">{buildTimeDays} hari</strong>
          )}
          .
        </p>

        <p className="text-sm sm:text-base text-root-subtle leading-relaxed">
          Kas negara saat ini:{" "}
          <strong className="text-root-text">
            {currentBudget >= 0 ? "+" : ""}
            {formattedCurrentBudget} NEO
          </strong>
          . Setelah pembangunan, kas akan menjadi{" "}
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
