"use client";

import React from "react";
import RootConstructionConfirmationModal, {
  type ConstructionMaterialRequirement,
} from "@/app/page/root_modals_design_menu/RootConstructionConfirmationModal";
import { calculateMaxBuildQuantity, getBulkBuildQuantityTarget } from "../../build_logic/build_logic";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface ProductionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  buildingLabel: string;
  buildingDescription?: string;
  cost: number;
  waktuPembangunan?: number;
  waktuPembangunanDiskon?: number;
  infraBonusPercent?: number;
  pembangunanBonusPercent?: number;
  hasJewishDiscount?: boolean;
  dampakKepuasan?: number;
  produksiPerHari?: number;
  kementerianPendidikanBonusPercent?: number;
  produksiLabel?: string;
  konsumsiListrik?: number;
  requirements: ConstructionMaterialRequirement[];
  materialStocks: Record<string, number>;
  anggaran: number;
  missingMaterials: ConstructionMaterialRequirement[];
  onConfirm: (buildQuantity?: number) => void;
  onMaterialClick: (resourceKey: string, label: string) => void;
  loadingMetadata: boolean;
  isDisabled?: boolean;
  initialQuantity?: number;
  quantityTarget?: number;
  translate?: (key: string, params?: Record<string, string | number>) => string;
}

export default function KonfirmasiPembangunanModal({
  isOpen,
  onClose,
  cost,
  waktuPembangunan,
  waktuPembangunanDiskon,
  infraBonusPercent = 0,
  pembangunanBonusPercent = 0,
  hasJewishDiscount = false,
  dampakKepuasan,
  produksiPerHari,
  kementerianPendidikanBonusPercent = 0,
  produksiLabel,
  requirements,
  materialStocks,
  anggaran,
  onConfirm,
  onMaterialClick,
  loadingMetadata,
  isDisabled = false,
  initialQuantity = 1,
  quantityTarget,
  translate,
}: ProductionConfirmationProps) {
  const { t } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_construction_production.confirmation.${key}`, params);
  const maxQuantity = calculateMaxBuildQuantity(
    cost,
    anggaran,
    requirements,
    materialStocks,
    quantityTarget ?? getBulkBuildQuantityTarget(cost * 1000)
  );
  const constructionTime = waktuPembangunanDiskon ?? waktuPembangunan;
  const hasConstructionTimeDiscount =
    constructionTime !== undefined &&
    waktuPembangunan !== undefined &&
    constructionTime < waktuPembangunan;

  return (
    <RootConstructionConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      cost={cost}
      budget={anggaran}
      requirements={requirements}
      materialStocks={materialStocks}
      maxQuantity={maxQuantity}
      initialQuantity={initialQuantity}
      onConfirm={onConfirm}
      onMaterialClick={onMaterialClick}
      loading={loadingMetadata}
      disabled={isDisabled}
      translate={translate}
      detailContent={(quantity) => (
        <>
          {waktuPembangunan !== undefined && (
            <>
              <div className="flex justify-between gap-3">
                <span className="text-root-muted">{tr("totalTime")}</span>
                <span className="flex items-center gap-2 font-semibold">
                  {hasConstructionTimeDiscount && (
                    <span className="text-rose-400 line-through">
                      {(waktuPembangunan || 1) * quantity} {tr((waktuPembangunan || 1) * quantity === 1 ? "day" : "days")}
                    </span>
                  )}
                  <span className={hasConstructionTimeDiscount ? "text-emerald-400" : "text-root-text"}>
                    {(constructionTime || 1) * quantity} {tr((constructionTime || 1) * quantity === 1 ? "day" : "days")}
                  </span>
                </span>
              </div>
              {(hasConstructionTimeDiscount ||
                infraBonusPercent > 0 ||
                pembangunanBonusPercent > 0 ||
                hasJewishDiscount) && (
                <div className="flex flex-wrap justify-end gap-2">
                  {infraBonusPercent > 0 && (
                    <span className="inline-flex rounded-full border border-root-accent/40 bg-root-accent/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-root-accent">
                      {tr("infrastructureBonus", { percent: infraBonusPercent.toFixed(1) })}
                    </span>
                  )}
                  {pembangunanBonusPercent > 0 && (
                    <span className="inline-flex rounded-full border border-root-accent/40 bg-root-accent/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-root-accent">
                      {tr("developmentBonus", { percent: pembangunanBonusPercent.toFixed(1) })}
                    </span>
                  )}
                  {hasJewishDiscount && (
                    <span className="inline-flex rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-rose-400">
                      {tr("jewishBonus")}
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {produksiPerHari !== undefined && (
            <>
              <div className="flex justify-between gap-3">
                <span className="text-root-muted">{tr("productionPerDay", { building: produksiLabel || "" })}</span>
                <span className="flex items-center gap-2 font-bold">
                  {kementerianPendidikanBonusPercent > 0 && (
                    <span className="text-rose-400 line-through">
                      +{produksiPerHari.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                    </span>
                  )}
                  <span className="text-emerald-400">
                    +{(produksiPerHari * (1 + kementerianPendidikanBonusPercent / 100)).toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                  </span>
                </span>
              </div>
              {kementerianPendidikanBonusPercent > 0 && (
                <div className="flex justify-end">
                  <span className="inline-flex rounded-full border border-root-accent/40 bg-root-accent/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-root-accent">
                    {tr("educationBonus", { percent: kementerianPendidikanBonusPercent.toFixed(1) })}
                  </span>
                </div>
              )}
            </>
          )}

          {dampakKepuasan !== undefined && (
            <div className="flex justify-between gap-3">
              <span className="text-root-muted">{tr("satisfactionImpact")}</span>
              <span className="font-bold text-emerald-400">+{dampakKepuasan.toFixed(1)}</span>
            </div>
          )}
        </>
      )}
    />
  );
}
