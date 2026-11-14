"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import { Eye, EyeOff, Hammer } from "lucide-react";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootModalCloseButton from "./RootModalCloseButton";
import { rootBorderRadius } from "./rootBorderRadius";
import { rootModalTypography } from "./rootModalTypography";

export interface ConstructionMaterialRequirement {
  resourceKey: string;
  label: string;
  group: string;
  amount?: number;
}

interface RootConstructionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  capacityDisplay?: string;
  cost: number;
  budget: number;
  requirements: ConstructionMaterialRequirement[];
  materialStocks: Record<string, number>;
  maxQuantity: number;
  initialQuantity?: number;
  onConfirm: (quantity: number) => void;
  onMaterialClick: (resourceKey: string, label: string) => void;
  loading: boolean;
  disabled?: boolean;
  quantityLabel?: string;
  quantityUnit?: string;
  quantityAction?: (setQuantity: (quantity: number) => void) => ReactNode;
  detailContent?: (quantity: number) => ReactNode;
  beforeCostContent?: ReactNode;
  afterCostContent?: ReactNode;
  showCurrentBalance?: boolean;
}

export default function RootConstructionConfirmationModal({
  isOpen,
  onClose,
  title = "Konfirmasi Pembangunan",
  capacityDisplay,
  cost,
  budget,
  requirements,
  materialStocks,
  maxQuantity,
  initialQuantity = 1,
  onConfirm,
  onMaterialClick,
  loading,
  disabled = false,
  quantityLabel = "Jumlah Bangunan",
  quantityUnit = "bangunan",
  quantityAction,
  detailContent,
  beforeCostContent,
  afterCostContent,
  showCurrentBalance = true,
}: RootConstructionConfirmationModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [showMaterialGrid, setShowMaterialGrid] = useState(true);
  const [selectedMaterialKey, setSelectedMaterialKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity || 1);
    } else {
      setSelectedMaterialKey(null);
      setQuantity(1);
    }
  }, [isOpen, initialQuantity]);

  if (!isOpen) return null;

  const totalCost = cost * quantity;
  const budgetIsSufficient = budget >= totalCost;
  const hasMissingMaterials = requirements.some(
    (material) =>
      (materialStocks[material.resourceKey] ?? 0) <
      (material.amount ?? 0) * quantity
  );
  const quantityExceedsAvailable = maxQuantity < 1 || quantity > maxQuantity;
  const confirmDisabled =
    loading ||
    hasMissingMaterials ||
    !budgetIsSufficient ||
    disabled ||
    quantityExceedsAvailable;

  return (
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[70]">
      <div className="root-modal-util-b74379da23 root-construction-confirm-modal">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

        <div className="satisfaction-modal-header root-modal-util-9462ce2345">
          <div className="satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar">
            <div className="root-modal-util-08dfbca033">
              <div className="root-modal-util-739d92b232">
                <Hammer aria-hidden="true" className="root-modal-util-d252947d10 text-root-accent" />
              </div>
              <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                {title}
              </h2>
            </div>
          </div>
          <div className="root-modal-util-08dfbca033">
            <RootModalCloseButton onClick={onClose} />
          </div>
        </div>

        <div className={`root-construction-confirm-content relative z-10 min-h-0 flex-1 space-y-4 overflow-y-auto bg-root-surface p-4 sm:p-5 lg:p-6 custom-scrollbar ${rootModalTypography.body}`}>
          {capacityDisplay && (
            <div className="mb-2 flex justify-end">
              <span className="shrink-0 rounded-lg border border-root-accent/30 bg-root-canvas px-3 py-1 text-sm font-black text-root-accent">
                {capacityDisplay}
              </span>
            </div>
          )}

          {beforeCostContent}

          <div className="root-construction-confirm-cost-card space-y-2.5 rounded-xl border border-root-accent/20 bg-root-canvas p-4 text-xs text-root-text">
            <div className="root-construction-confirm-cost-row flex justify-between gap-3 font-bold">
              <span className="text-root-muted">Biaya Pembangunan (Total):</span>
              <span className="shrink-0 font-black text-root-accent">
                {loading ? "Memuat..." : `${totalCost.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO`}
              </span>
            </div>
            <div className="root-construction-confirm-cost-row flex justify-between gap-3 text-xs text-root-muted">
              <span>Biaya per bangunan:</span>
              <span className="shrink-0 text-root-text">
                {cost.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
              </span>
            </div>

            <div className="root-construction-confirm-quantity-card rounded-xl border border-root-accent/30 bg-root-surface p-4">
              <label className="flex flex-col gap-2">
                <span className={rootModalTypography.sectionTitle}>{quantityLabel}</span>
                <div className="root-construction-confirm-quantity-controls flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={maxQuantity}
                    step={1}
                    disabled={maxQuantity < 1}
                    value={quantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setQuantity(
                        Number.isFinite(value)
                          ? Math.min(maxQuantity, Math.max(1, Math.floor(value)))
                          : 1
                      );
                    }}
                    className="root-construction-confirm-quantity-input h-9 min-w-0 flex-1 rounded-xl border border-root-accent/30 bg-root-canvas px-3 py-2 text-xs font-bold text-root-text focus:border-root-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(maxQuantity)}
                    disabled={maxQuantity < 1}
                    className="root-construction-confirm-quantity-max shrink-0 cursor-pointer rounded-xl bg-root-accent px-4 py-2 text-xs font-black uppercase text-root-canvas shadow-sm transition-all hover:bg-root-accent/80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Maks ({maxQuantity})
                  </button>
                  {quantityAction?.(setQuantity)}
                </div>
              </label>
            </div>

            {detailContent && (
              <div className="root-construction-confirm-details space-y-2">
                {detailContent(quantity)}
              </div>
            )}

            {requirements.length > 0 ? (
              <div className="root-construction-confirm-material-section space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className={rootModalTypography.sectionTitle}>Material Dibutuhkan</div>
                  <button
                    type="button"
                    aria-expanded={showMaterialGrid}
                    onClick={() => setShowMaterialGrid((shown) => !shown)}
                    className="root-construction-confirm-material-toggle flex cursor-pointer items-center gap-1.5 rounded-lg border border-root-accent/30 bg-root-surface px-2 py-1 text-root-muted transition-all hover:text-root-accent"
                  >
                    {showMaterialGrid ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase">Sembunyikan</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase">Tampilkan</span>
                      </>
                    )}
                  </button>
                </div>

                <div
                  className={`root-construction-confirm-material-grid grid grid-cols-4 gap-2 overflow-hidden transition-all duration-500 ease-in-out ${
                    showMaterialGrid ? "mt-2 max-h-[1500px] opacity-100" : "mt-0 max-h-0 opacity-0"
                  }`}
                >
                  {requirements.map((material) => {
                    const stock = materialStocks[material.resourceKey] ?? 0;
                    const requiredAmount = (material.amount ?? 0) * quantity;
                    const insufficient = stock < requiredAmount;
                    const materialKey = `${material.resourceKey}-${material.group}`;
                    const selected = selectedMaterialKey === materialKey;

                    return (
                      <button
                        key={materialKey}
                        type="button"
                        onClick={() => {
                          setSelectedMaterialKey(materialKey);
                          onMaterialClick(material.resourceKey, material.label);
                        }}
                        className={`root-construction-confirm-material-card flex min-h-[50px] cursor-pointer flex-col items-center justify-center rounded-xl border p-2.5 transition-all ${
                          selected
                            ? "border-root-accent bg-root-accent/15 text-root-accent"
                            : insufficient
                              ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                              : "border-root-accent/20 bg-root-surface text-root-text hover:border-root-accent/50"
                        }`}
                      >
                        <span className="root-construction-confirm-material-label text-center text-xs font-bold">{material.label}</span>
                        {material.amount !== undefined && (
                          <span className="root-construction-confirm-material-required mt-1 text-[9px] uppercase tracking-wider text-root-accent">
                            x{requiredAmount.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                          </span>
                        )}
                        <span className={`root-construction-confirm-material-stock mt-0.5 text-xs font-black ${insufficient ? "text-rose-400" : "text-root-muted"}`}>
                          {stock.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="root-construction-confirm-no-material text-root-muted">Tidak ada material yang dibutuhkan untuk bangunan ini.</div>
            )}

            {showCurrentBalance && (
              <div className="root-construction-confirm-cost-row root-construction-confirm-balance flex items-center justify-between gap-3 pt-1 text-xs font-black text-root-text">
                <span className="text-root-muted">Kas Negara Saat Ini:</span>
                <span className="shrink-0 text-root-accent">
                  {budget.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
                </span>
              </div>
            )}
          </div>

          {afterCostContent}
        </div>

        <div className="root-construction-confirm-footer relative z-10 flex shrink-0 gap-3 border-t border-root-accent/20 bg-root-canvas p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-root-accent/30 bg-root-surface py-2.5 text-center text-xs font-bold uppercase text-root-muted transition-all hover:text-root-accent"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(quantity)}
            disabled={confirmDisabled}
            className={`flex-1 cursor-pointer rounded-xl py-2.5 text-center text-xs font-black uppercase transition-all ${
              confirmDisabled
                ? "cursor-not-allowed border border-root-accent/10 bg-root-surface text-root-muted opacity-50"
                : "bg-root-accent text-root-canvas shadow-md hover:bg-root-accent/80"
            }`}
          >
            {hasMissingMaterials
              ? "Material Kurang"
              : quantityExceedsAvailable
                ? "Jumlah Melebihi Stok"
                : !budgetIsSufficient
                  ? "Dana Tidak Cukup"
                  : "Mulai Pembangunan"}
          </button>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}
