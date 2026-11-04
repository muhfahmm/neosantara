"use client";
import React, { useState } from "react";
import { Hammer, Eye, EyeOff } from "lucide-react";
import { calculateMaxBuildQuantity, getBulkBuildQuantityTarget } from "../../build_logic/build_logic";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface MaterialRequirement {
  resourceKey: string;
  label: string;
  group: string;
  amount?: number;
}

interface KonfirmasiPembangunanProps {
  isOpen: boolean;
  onClose: () => void;
  buildingLabel: string;
  buildingDescription?: string;
  cost: number;
  waktuPembangunan?: number;
  dampakKepuasan?: number;      // Untuk Tempat Umum & Hunian
  produksiPerHari?: number;     // Untuk Bangunan Produksi
  produksiLabel?: string;
  pendapatanPerHari?: number;   // Untuk Bangunan Tempat Umum / Komersial
  pendapatanLabel?: string;
  konsumsiListrik?: number;
  requirements: MaterialRequirement[];
  materialStocks: Record<string, number>;
  anggaran: number;
  missingMaterials: MaterialRequirement[];
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
  buildingLabel,
  buildingDescription,
  cost,
  waktuPembangunan,
  dampakKepuasan,
  produksiPerHari,
  produksiLabel,
  pendapatanPerHari,
  pendapatanLabel,
  konsumsiListrik,
  requirements,
  materialStocks,
  anggaran,
  onConfirm,
  onMaterialClick,
  loadingMetadata,
  isDisabled = false,
  initialQuantity = 1,
  quantityTarget,
}: KonfirmasiPembangunanProps) {
  const [showMaterialGrid, setShowMaterialGrid] = useState(true);
  const [buildQuantity, setBuildQuantity] = useState<number>(initialQuantity);
  const [selectedMaterialKey, setSelectedMaterialKey] = useState<string | null>(null);

  // Reset selection when modal opens/closes or initialQuantity changes
  React.useEffect(() => {
    if (isOpen) {
      setBuildQuantity(initialQuantity || 1);
    } else {
      setSelectedMaterialKey(null);
      setBuildQuantity(1);
    }
  }, [isOpen, initialQuantity]);

  if (!isOpen) return null;

  const totalCost = cost * buildQuantity;
  const isAnggaranCukup = anggaran >= totalCost;
  const totalTime = (waktuPembangunan || 1) * buildQuantity;

  const maxBuildQuantity = calculateMaxBuildQuantity(
    cost,
    anggaran,
    requirements,
    materialStocks,
    quantityTarget ?? getBulkBuildQuantityTarget(cost * 1000)
  );
  const hasMissingMaterials = requirements.some(
    (material) =>
      (materialStocks[material.resourceKey] ?? 0) <
      (material.amount ?? 0) * buildQuantity
  );
  const quantityExceedsAvailable = maxBuildQuantity < 1 || buildQuantity > maxBuildQuantity;

  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="flex h-full flex-col overflow-hidden">

        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
              <Hammer className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
            </div>
            <div>
              <h3 className={rootModalTypography.title}>Konfirmasi Pembangunan</h3>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className={`p-6 relative z-10 flex-1 overflow-y-auto space-y-4 custom-scrollbar ${rootModalTypography.body}`}>
          <div>
            <h4 className={rootModalTypography.sectionTitle}>{buildingLabel}</h4>
            <p className={`mt-1 text-xs ${rootModalTypography.muted}`}>{buildingDescription || 'Tidak ada deskripsi tersedia.'}</p>
          </div>

          <div className="bg-root-canvas border border-root-accent/20 rounded-xl p-4 space-y-2.5 text-xs text-root-text">
            <div className="flex justify-between font-bold">
              <span className="text-root-muted">Biaya Pembangunan (Total):</span>
              <span className="text-root-accent font-black">
                {loadingMetadata ? 'Memuat...' : `${totalCost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-root-muted">
              <span>Biaya per bangunan:</span>
              <span className="text-root-text">{cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span>
            </div>

            <div className="bg-root-surface border border-root-accent/30 rounded-xl p-4 mt-3 text-xs text-root-text">
              <label className="flex flex-col gap-2">
                <span className={rootModalTypography.sectionTitle}>Jumlah Bangunan</span>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min={1}
                    max={maxBuildQuantity}
                    step={1}
                    disabled={maxBuildQuantity < 1}
                    value={buildQuantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setBuildQuantity(
                        Number.isFinite(value)
                          ? Math.min(maxBuildQuantity, Math.max(1, Math.floor(value)))
                          : 1
                      );
                    }}
                    className="h-9 flex-1 rounded-xl border border-root-accent/30 bg-root-canvas px-3 py-2 text-xs font-bold text-root-text focus:outline-none focus:border-root-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setBuildQuantity(maxBuildQuantity)}
                    disabled={maxBuildQuantity < 1}
                    className="px-4 py-2 rounded-xl bg-root-accent hover:bg-root-accent/80 text-root-canvas text-xs font-black uppercase cursor-pointer transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Maks ({maxBuildQuantity})
                  </button>
                </div>
              </label>
            </div>


            {waktuPembangunan !== undefined && (
              <>
                <div className="flex justify-between">
                  <span className="text-root-muted">Estimasi Waktu Pembangunan per bangunan:</span>
                  <span className="text-root-text font-semibold">{waktuPembangunan} Hari</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-root-muted">Estimasi Waktu Pembangunan Total:</span>
                  <span className="text-root-text font-semibold">{totalTime} Hari</span>
                </div>
              </>
            )}

            {produksiPerHari !== undefined && (
              <div className="flex justify-between">
                <span className="text-root-muted">Produksi {produksiLabel || ''} per hari:</span>
                <span className="text-emerald-400 font-bold">+{produksiPerHari.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
              </div>
            )}

            {pendapatanPerHari !== undefined && (
              <div className="flex justify-between">
                <span className="text-root-muted">Penghasilan {pendapatanLabel || 'NEO'} per hari:</span>
                <span className="text-emerald-400 font-bold">+{pendapatanPerHari.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
              </div>
            )}

            {dampakKepuasan !== undefined && (
              <div className="flex justify-between">
                <span className="text-root-muted">Dampak ke Kepuasan:</span>
                <span className="text-emerald-400 font-bold">+{dampakKepuasan.toFixed(1)}</span>
              </div>
            )}



            {requirements && requirements.length > 0 ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className={rootModalTypography.sectionTitle}>Material Dibutuhkan</div>
                  <button
                    onClick={() => setShowMaterialGrid(!showMaterialGrid)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-root-surface border border-root-accent/30 rounded-lg text-root-muted hover:text-root-accent transition-all cursor-pointer"
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
                  className={`grid grid-cols-4 gap-2 overflow-hidden transition-all duration-500 ease-in-out ${
                    showMaterialGrid ? 'max-h-[1500px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
                  }`}
                >
                  {requirements.map((material) => {
                    const stock = materialStocks[material.resourceKey] ?? 0;
                    const requiredAmount = (material.amount ?? 0) * buildQuantity;
                    const isStockInsufficient = stock < requiredAmount;
                    const materialKey = `${material.resourceKey}-${material.group}`;
                    const isSelected = selectedMaterialKey === materialKey;

                    return (
                      <button
                        key={materialKey}
                        type="button"
                        onClick={() => {
                          setSelectedMaterialKey(materialKey);
                          onMaterialClick(material.resourceKey, material.label);
                        }}
                        className={`flex flex-col items-center justify-center border rounded-xl p-2.5 min-h-[50px] cursor-pointer transition-all ${
                          isSelected
                            ? 'border-root-accent bg-root-accent/15 text-root-accent'
                            : isStockInsufficient
                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                            : 'border-root-accent/20 bg-root-surface text-root-text hover:border-root-accent/50'
                        }`}
                      >
                        <div className="text-center text-xs font-bold">{material.label}</div>
                        {material.amount !== undefined && (
                          <div className="text-[9px] uppercase tracking-wider text-root-accent mt-1">
                            x{requiredAmount.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                          </div>
                        )}
                        <div className={`mt-0.5 text-xs font-black ${isStockInsufficient ? 'text-rose-400' : 'text-root-muted'}`}>
                          {stock.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-root-muted">Tidak ada material yang dibutuhkan untuk bangunan ini.</div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs font-black text-root-text pt-1">
            <span className="text-root-muted">Kas Negara Saat Ini:</span>
            <span className="text-root-accent">{anggaran.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span>
          </div>
        </div>

        <div className="p-4 bg-root-canvas border-t border-root-accent/20 flex gap-3 relative z-10 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-root-accent/30 bg-root-surface text-root-muted hover:text-root-accent text-xs font-bold uppercase cursor-pointer transition-all text-center"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(buildQuantity)}
            disabled={loadingMetadata || hasMissingMaterials || !isAnggaranCukup || isDisabled || quantityExceedsAvailable}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all text-center cursor-pointer ${
              hasMissingMaterials || !isAnggaranCukup || loadingMetadata || isDisabled || quantityExceedsAvailable
                ? 'bg-root-surface text-root-muted border border-root-accent/10 cursor-not-allowed opacity-50'
                : 'bg-root-accent text-root-canvas hover:bg-root-accent/80 shadow-md'
            }`}
          >
            {hasMissingMaterials ? 'Material Kurang' : quantityExceedsAvailable ? 'Jumlah Melebihi Stok' : !isAnggaranCukup ? 'Dana Tidak Cukup' : 'Mulai Pembangunan'}
          </button>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}