"use client";

import React from "react";
import RootConstructionConfirmationModal, {
  type ConstructionMaterialRequirement,
} from "@/app/page/root_modals_design_menu/RootConstructionConfirmationModal";
import { calculateMaxBuildQuantity, getBulkBuildQuantityTarget } from "../../build_logic/build_logic";

interface PublicBuildingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  buildingLabel: string;
  buildingDescription?: string;
  cost: number;
  waktuPembangunan?: number;
  dampakKepuasan?: number;
  produksiPerHari?: number;
  produksiLabel?: string;
  pendapatanPerHari?: number;
  pendapatanLabel?: string;
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
}

export default function KonfirmasiPembangunanModal({
  isOpen,
  onClose,
  cost,
  waktuPembangunan,
  dampakKepuasan,
  produksiPerHari,
  produksiLabel,
  pendapatanPerHari,
  pendapatanLabel,
  requirements,
  materialStocks,
  anggaran,
  onConfirm,
  onMaterialClick,
  loadingMetadata,
  isDisabled = false,
  initialQuantity = 1,
  quantityTarget,
}: PublicBuildingConfirmationProps) {
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
      detailContent={(quantity) => (
        <>
          {waktuPembangunan !== undefined && (
            <>
              <div className="flex justify-between gap-3">
                <span className="text-root-muted">Estimasi Waktu Pembangunan per bangunan:</span>
                <span className="font-semibold text-root-text">{waktuPembangunan} Hari</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-root-muted">Estimasi Waktu Pembangunan Total:</span>
                <span className="font-semibold text-root-text">{waktuPembangunan * quantity} Hari</span>
              </div>
            </>
          )}
          {produksiPerHari !== undefined && (
            <div className="flex justify-between gap-3">
              <span className="text-root-muted">Produksi {produksiLabel || ""} per hari:</span>
              <span className="font-bold text-emerald-400">
                +{produksiPerHari.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {pendapatanPerHari !== undefined && (
            <div className="flex justify-between gap-3">
              <span className="text-root-muted">Penghasilan {pendapatanLabel || "NEO"} per hari:</span>
              <span className="font-bold text-emerald-400">
                +{pendapatanPerHari.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {dampakKepuasan !== undefined && (
            <div className="flex justify-between gap-3">
              <span className="text-root-muted">Dampak ke Kepuasan:</span>
              <span className="font-bold text-emerald-400">+{dampakKepuasan.toFixed(1)}</span>
            </div>
          )}
        </>
      )}
    />
  );
}
