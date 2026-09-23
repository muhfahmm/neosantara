"use client";
import React, { useState } from "react";
import { X, Hammer, Eye, EyeOff } from "lucide-react";

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
  konsumsiListrik,
  requirements,
  materialStocks,
  anggaran,
  missingMaterials,
  onConfirm,
  onMaterialClick,
  loadingMetadata,
  isDisabled = false,
  initialQuantity = 1,
}: KonfirmasiPembangunanProps) {
  const [showMaterialGrid, setShowMaterialGrid] = useState(true);
  const [buildQuantity, setBuildQuantity] = useState<number>(initialQuantity || 1);
  const [selectedMaterialKey, setSelectedMaterialKey] = useState<string | null>(null);

  // Sync or reset selection when modal opens/closes or initialQuantity changes
  React.useEffect(() => {
    if (isOpen) {
      setBuildQuantity(initialQuantity || 1);
    } else {
      setSelectedMaterialKey(null);
      setBuildQuantity(1);
    }
  }, [isOpen, initialQuantity]);

  if (!isOpen) return null;

  const hasMissingMaterials = missingMaterials.length > 0;
  const totalCost = cost * buildQuantity;
  const isAnggaranCukup = anggaran >= totalCost;
  const totalTime = (waktuPembangunan || 1) * buildQuantity;

  // 🔥 Fungsi kalkulasi jumlah bangunan maksimal
  const calculateMaxBuildings = (): number => {
    let maxByBudget = Math.floor(anggaran / cost);
    if (maxByBudget < 1) return 1;

    // Cek batasan berdasarkan material
    let maxByMaterials = Infinity;
    for (const req of requirements) {
      const availableStock = materialStocks[req.resourceKey] ?? 0;
      const costPerBuilding = req.amount ?? 0;
      if (costPerBuilding > 0) {
        const maxForThisMaterial = Math.floor(availableStock / costPerBuilding);
        maxByMaterials = Math.min(maxByMaterials, maxForThisMaterial);
      }
    }

    if (maxByMaterials === Infinity) {
      maxByMaterials = maxByBudget;
    }

    return Math.max(1, Math.min(maxByBudget, maxByMaterials));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl">

        {/* Header disamakan persis dengan Info Bangunan */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3 text-[#E0E0E0]">
            <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Hammer className="h-5 w-5 text-[#00FFAA]" />
            </div>
            <h3 className="text-base font-black uppercase tracking-wider">Konfirmasi Pembangunan</h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
            aria-label="Tutup konfirmasi"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 relative z-10 flex-1 overflow-y-auto space-y-4 text-xs font-semibold text-[#E0E0E0] custom-scrollbar">
          <div>
            <h4 className="text-lg font-black text-[#00FFAA]">{buildingLabel}</h4>
            <p className="text-xs text-[#6B8A8A] mt-1">{buildingDescription || 'Tidak ada deskripsi tersedia.'}</p>
          </div>

          <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-4 space-y-2.5 text-xs text-[#E0E0E0]">
            <div className="flex justify-between font-bold">
              <span className="text-[#6B8A8A]">Biaya Pembangunan (Total):</span>
              <span className="text-[#00FFAA] font-black">
                {loadingMetadata ? 'Memuat...' : `${totalCost.toLocaleString('id-ID')} EM`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#6B8A8A]">
              <span>Biaya per bangunan:</span>
              <span className="text-[#E0E0E0]">{cost.toLocaleString('id-ID')} EM</span>
            </div>

            <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-xl p-4 mt-3 text-xs text-[#E0E0E0]">
              <label className="flex flex-col gap-2">
                <span className="font-black uppercase tracking-wider text-[#00FFAA]">Jumlah Bangunan</span>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={buildQuantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setBuildQuantity(Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1);
                    }}
                    className="flex-1 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] px-3 py-2 text-sm font-bold text-[#E0E0E0] focus:outline-none focus:border-[#00FFAA]"
                  />
                  <button
                    type="button"
                    onClick={() => setBuildQuantity(calculateMaxBuildings())}
                    className="px-4 py-2 rounded-xl bg-[#00FFAA] hover:bg-[#00FFAA]/80 text-[#0A1A1A] text-xs font-black uppercase cursor-pointer transition-all shadow-sm"
                  >
                    Maks
                  </button>
                </div>
              </label>
            </div>

            {hasMissingMaterials && (
              <div className="pt-2 border-t border-rose-500/20">
                <p className="font-bold text-rose-400 mb-2">Material Kurang:</p>
                {missingMaterials.map((mat, idx) => {
                  const requiredAmount = (mat.amount ?? 0) * buildQuantity;
                  return (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-[#E0E0E0]">{mat.label} (x{requiredAmount.toLocaleString('id-ID')})</span>
                      <span className="text-rose-400 font-black">0</span>
                    </div>
                  );
                })}
              </div>
            )}

            {waktuPembangunan !== undefined && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Estimasi Waktu Pembangunan per bangunan:</span>
                  <span className="text-[#E0E0E0] font-semibold">{waktuPembangunan} Hari</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Estimasi Waktu Pembangunan Total:</span>
                  <span className="text-[#E0E0E0] font-semibold">{totalTime} Hari</span>
                </div>
              </>
            )}

            {produksiPerHari !== undefined && (
              <div className="flex justify-between">
                <span className="text-[#6B8A8A]">Produksi {produksiLabel || ''} per hari:</span>
                <span className="text-emerald-400 font-bold">+{produksiPerHari.toLocaleString('id-ID')}</span>
              </div>
            )}

            {dampakKepuasan !== undefined && (
              <div className="flex justify-between">
                <span className="text-[#6B8A8A]">Dampak ke Kepuasan:</span>
                <span className="text-emerald-400 font-bold">+{dampakKepuasan.toFixed(1)}</span>
              </div>
            )}

            {konsumsiListrik !== undefined && konsumsiListrik !== null && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Konsumsi Listrik per bangunan:</span>
                  <span className="text-[#E0E0E0] font-semibold">{konsumsiListrik} MW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Konsumsi Listrik Total ({buildQuantity} unit):</span>
                  <span className="text-[#E0E0E0] font-semibold">{(konsumsiListrik * buildQuantity).toFixed(4).replace(/\.?0+$/, '')} MW</span>
                </div>
              </>
            )}

            {requirements && requirements.length > 0 ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-black uppercase tracking-wider text-[#00FFAA]">Material Dibutuhkan</div>
                  <button
                    onClick={() => setShowMaterialGrid(!showMaterialGrid)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-[#0F2424] border border-[#00FFAA]/30 rounded-lg text-[#6B8A8A] hover:text-[#00FFAA] transition-all cursor-pointer"
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
                    const isStockZero = stock <= 0;
                    const requiredAmount = (material.amount ?? 0) * buildQuantity;
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
                            ? 'border-[#00FFAA] bg-[#00FFAA]/15 text-[#00FFAA]'
                            : isStockZero
                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                            : 'border-[#00FFAA]/20 bg-[#0F2424] text-[#E0E0E0] hover:border-[#00FFAA]/50'
                        }`}
                      >
                        <div className="font-bold text-[10px] text-center">{material.label}</div>
                        {material.amount !== undefined && (
                          <div className="text-[9px] uppercase tracking-wider text-[#00FFAA] mt-1">
                            x{requiredAmount.toLocaleString('id-ID')}
                          </div>
                        )}
                        <div className={`text-[10px] font-black mt-0.5 ${isStockZero ? 'text-rose-400' : 'text-[#6B8A8A]'}`}>
                          {stock.toLocaleString('id-ID')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-[#6B8A8A]">Tidak ada material yang dibutuhkan untuk bangunan ini.</div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs font-black text-[#E0E0E0] pt-1">
            <span className="text-[#6B8A8A]">Kas Negara Saat Ini:</span>
            <span className="text-[#00FFAA]">{anggaran.toLocaleString('id-ID')} EM</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex gap-3 relative z-10 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] text-xs font-bold uppercase cursor-pointer transition-all text-center"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(buildQuantity)}
            disabled={loadingMetadata || hasMissingMaterials || !isAnggaranCukup || isDisabled}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all text-center cursor-pointer ${
              hasMissingMaterials || !isAnggaranCukup || loadingMetadata || isDisabled
                ? 'bg-[#0F2424] text-[#6B8A8A] border border-[#00FFAA]/10 cursor-not-allowed opacity-50'
                : 'bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 shadow-md'
            }`}
          >
            {hasMissingMaterials ? 'Material Kurang' : !isAnggaranCukup ? 'Dana Tidak Cukup' : 'Mulai Pembangunan'}
          </button>
        </div>
      </div>
    </div>
  );
}