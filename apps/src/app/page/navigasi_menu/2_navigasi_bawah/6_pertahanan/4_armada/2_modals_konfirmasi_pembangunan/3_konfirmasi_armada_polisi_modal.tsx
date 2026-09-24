"use client";
import React, { useState } from "react";
import { X, Hammer, Eye, EyeOff } from "lucide-react";
import { KonfirmasiPembangunanModalProps } from "../requirements_logic/konfirmasi_pembangunan_types";

// Simplified modal for Armada Polisi (no capacity logic yet - placeholder for future expansion)
export default function KonfirmasiArmadaPolisiModal({
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
}: KonfirmasiPembangunanModalProps) {
  const [showMaterialGrid, setShowMaterialGrid] = useState(true);
  const [buildQuantity, setBuildQuantity] = useState<number>(1);

  if (!isOpen) return null;

  const totalCost = cost * buildQuantity;
  const totalTime = waktuPembangunan !== undefined ? waktuPembangunan * buildQuantity : undefined;
  const hasMissingMaterials = missingMaterials.length > 0;
  const isAnggaranCukup = anggaran >= totalCost;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3 text-[#E0E0E0]">
            <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Hammer className="h-5 w-5 text-[#00FFAA]" />
            </div>
            <h3 className="text-base font-black uppercase tracking-wider text-[#00FFAA]">Pembangunan Armada Polisi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 relative z-10 flex-1 overflow-y-auto space-y-4 text-xs font-semibold text-[#E0E0E0] custom-scrollbar bg-[#0F2424]">
          <div>
            <h4 className="text-lg font-black text-[#00FFAA] uppercase tracking-wider mb-2">{buildingLabel}</h4>
            <p className="text-xs text-[#6B8A8A]">{buildingDescription || 'Tidak ada deskripsi tersedia.'}</p>
          </div>

          <div className="bg-[#0A1A1A]/60 border border-[#00FFAA]/20 rounded-xl p-4 space-y-2.5 text-xs text-[#E0E0E0]">
            <div className="flex justify-between font-bold">
              <span className="text-[#6B8A8A]">Biaya Pembangunan (Total):</span>
              <span className="text-[#00FFAA]">
                {loadingMetadata ? 'Memuat...' : `${totalCost.toLocaleString('id-ID')} EM`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#6B8A8A]">
              <span>Biaya per unit:</span>
              <span className="text-white">{cost.toLocaleString('id-ID')} EM</span>
            </div>

            <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-xl p-4 mt-3 text-xs text-[#E0E0E0]">
              <label className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase tracking-[0.2em] text-[#00FFAA]">Jumlah Bangunan</span>
                  <button
                    type="button"
                    onClick={() => {
                      const maxQuantity = Math.floor(anggaran / cost);
                      setBuildQuantity(Math.max(1, maxQuantity));
                    }}
                    className="px-3 py-1 bg-[#00FFAA]/10 hover:bg-[#00FFAA]/20 text-[#00FFAA] text-[9px] font-black uppercase rounded-lg transition-colors cursor-pointer border border-[#00FFAA]/30"
                  >
                    Maks
                  </button>
                </div>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={buildQuantity}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setBuildQuantity(Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1);
                  }}
                  className="w-full rounded-xl border border-[#00FFAA]/40 bg-[#0F2424] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FFAA]"
                />
              </label>
            </div>

            {hasMissingMaterials && (
              <div className="pt-2 border-t border-[#00FFAA]/20">
                <p className="font-bold text-rose-400 mb-2">Material Kurang:</p>
                {missingMaterials.map((mat, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-[#E0E0E0]">{mat.label} (x{mat.amount ?? 0})</span>
                    <span className="text-rose-400 font-black">0</span>
                  </div>
                ))}
              </div>
            )}

            {waktuPembangunan !== undefined && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Estimasi Waktu Pembangunan per unit:</span>
                  <span className="text-white font-semibold">{waktuPembangunan} Hari</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Estimasi Waktu Pembangunan Total:</span>
                  <span className="text-white font-semibold">{totalTime} Hari</span>
                </div>
              </>
            )}

            {produksiPerHari !== undefined && (
              <div className="flex justify-between">
                <span className="text-[#6B8A8A]">Produksi {produksiLabel || ''} per hari:</span>
                <span className="text-[#00FFAA] font-bold">+{produksiPerHari.toLocaleString('id-ID')}</span>
              </div>
            )}

            {dampakKepuasan !== undefined && (
              <div className="flex justify-between">
                <span className="text-[#6B8A8A]">Dampak ke Kepuasan:</span>
                <span className="text-[#00FFAA] font-bold">+{dampakKepuasan.toFixed(1)}</span>
              </div>
            )}

            {/* Kondisional Listrik */}
            {konsumsiListrik !== undefined && konsumsiListrik !== null && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Konsumsi Listrik per unit:</span>
                  <span className="text-white font-semibold">{konsumsiListrik} MW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Konsumsi Listrik Total ({buildQuantity} unit):</span>
                  <span className="text-white font-semibold">{(konsumsiListrik * buildQuantity).toFixed(4).replace(/\.?0+$/, '')} MW</span>
                </div>
              </>
            )}

            {requirements && requirements.length > 0 ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-black uppercase tracking-[0.2em] text-[#00FFAA]">Material Dibutuhkan</div>
                  <button
                    onClick={() => setShowMaterialGrid(!showMaterialGrid)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-lg text-[#00FFAA] hover:bg-[#00FFAA]/10 transition-all cursor-pointer"
                  >
                    {showMaterialGrid ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span className="text-[8px] font-bold uppercase">Sembunyikan</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span className="text-[8px] font-bold uppercase">Tampilkan</span>
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

                    return (
                      <button
                        key={`${material.resourceKey}-${material.group}`}
                        type="button"
                        onClick={() => onMaterialClick(material.resourceKey, material.label)}
                        className={`flex flex-col items-center justify-center border rounded-xl p-2.5 min-h-[50px] cursor-pointer hover:border-[#00FFAA] transition-all ${
                          isStockZero ? 'border-red-500/50 bg-red-950/30 text-red-300' : 'border-[#00FFAA]/30 bg-[#0A1A1A] text-white'
                        }`}
                      >
                        <div className="font-bold text-[10px] text-center">{material.label}</div>
                        {material.amount !== undefined && (
                          <div className="text-[9px] uppercase tracking-[0.15em] text-[#6B8A8A] mt-1">
                            x{material.amount}
                          </div>
                        )}
                        <div className={`text-[10px] font-black mt-0.5 ${isStockZero ? 'text-red-400' : 'text-[#00FFAA]'}`}>
                          {stock.toLocaleString('id-ID')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-[#6B8A8A]">Tidak ada material yang dibutuhkan untuk unit ini.</div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs font-black text-[#E0E0E0] pt-1">
            <span className="text-[#6B8A8A]">Kas Negara Saat Ini:</span>
            <span className="text-[#00FFAA] font-bold">{anggaran.toLocaleString('id-ID')} EM</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex gap-3 relative z-10 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-white text-[10px] font-black uppercase cursor-pointer hover:bg-[#1A3838] transition-all text-center"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(buildQuantity)}
            disabled={loadingMetadata || hasMissingMaterials || !isAnggaranCukup || isDisabled || buildQuantity <= 0}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all text-center cursor-pointer ${
              hasMissingMaterials || !isAnggaranCukup || loadingMetadata || isDisabled
                ? 'bg-[#1A3838] text-[#6B8A8A] border border-[#00FFAA]/10 cursor-not-allowed opacity-60'
                : 'bg-[#00FFAA] text-[#0A1A1A] font-extrabold hover:bg-[#00FFAA]/90 hover:shadow-lg shadow-[#00FFAA]/20'
            }`}
          >
            {hasMissingMaterials ? 'Material Kurang' : !isAnggaranCukup ? 'Dana Tidak Cukup' : 'Mulai Pembangunan'}
          </button>
        </div>
      </div>
    </div>
  );
}