"use client";

import React from "react";
import RootConstructionConfirmationModal, {
  type ConstructionMaterialRequirement,
} from "@/app/page/root_modals_design_menu/RootConstructionConfirmationModal";
import { calculateMaxBuildQuantity, getBulkBuildQuantityTarget } from "../../build_logic/build_logic";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface HousingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  buildingLabel: string;
  buildingDescription?: string;
  cost: number;
  waktuPembangunan?: number;
  dampakKepuasan?: number;
  produksiPerHari?: number;
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
  dampakKepuasan,
  produksiPerHari,
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
}: HousingConfirmationProps) {
  const { t } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_construction_housing.confirmation.${key}`, params);
  const maxQuantity = calculateMaxBuildQuantity(
    cost,
    anggaran,
    requirements,
    materialStocks,
    quantityTarget ?? getBulkBuildQuantityTarget(cost * 1000)
  );

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
            <div className="flex justify-between gap-3">
              <span className="text-root-muted">{tr("totalTime")}</span>
              <span className="font-semibold text-root-text">
                {waktuPembangunan * quantity} {tr(waktuPembangunan * quantity === 1 ? "day" : "days")}
              </span>
            </div>
          )}
          {produksiPerHari !== undefined && (
            <div className="flex justify-between gap-3">
              <span className="text-root-muted">{tr("productionPerDay", { building: produksiLabel || "" })}</span>
              <span className="font-bold text-emerald-400">
                +{produksiPerHari.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
              </span>
            </div>
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
