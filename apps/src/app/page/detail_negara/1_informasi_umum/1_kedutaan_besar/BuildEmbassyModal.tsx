"use client";
import { getWaktuPembangunanKedutaanBonusPercent } from "@/app/page/bonus_logic";
import { createPortal } from "react-dom";

import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
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

export default function BuildEmbassyModal({ isOpen, countryName, continent, currentBudget = 0, cost = 0, buildTimeDays = 60, countryDetail, onClose, onConfirm }: BuildEmbassyModalProps) {
  if (!isOpen) return null;

  const continentLabel = continent || 'Lainnya';
  const budgetAfterBuild = currentBudget - cost;
  const formattedCurrentBudget = currentBudget.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const formattedBudgetAfterBuild = budgetAfterBuild.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const hasBudget = currentBudget >= cost;

  const discountPct = getWaktuPembangunanKedutaanBonusPercent(countryDetail);
  const embassyCostDiscountPct = cost > 0 ? Math.max(0, (1 - cost / 10) * 100) : 0;
  const effectiveBuildTimeDays = discountPct > 0 
    ? Math.max(1, Math.floor(buildTimeDays * (1 - discountPct / 100))) 
    : buildTimeDays;

  const modalContent = (
    <NotebookModalWrapper compact maxWidthClass="max-w-xl" zIndexClass="z-[100000001]">
      {/* Container Modal Lebih Lebar dan Panjang */}
      <div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
        
        {/* Area Konten */}
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-black text-[#00FFAA] tracking-wide uppercase mb-6 border-b border-[#00FFAA]/20 pb-4">
            Konfirmasi Bangun Kedutaan
          </h3>
          
          <p className="text-sm sm:text-base text-[#E0E0E0] mb-4 leading-relaxed">
            Apakah Anda ingin membangun kedutaan di <strong className="text-white">{countryName}</strong>? Biaya pembangunan di <strong className="text-white">{continentLabel}</strong> adalah {
              embassyCostDiscountPct > 0 ? (
                <span><span className="line-through text-rose-400 mr-1">10 NEO</span><strong className="text-[#00FFAA]">{cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</strong></span>
              ) : <strong className="text-[#00FFAA]">{cost} NEO</strong>
            } dengan waktu pembangunan {
              discountPct > 0 ? (
                <span>
                  <span className="line-through text-rose-400 mr-1">{buildTimeDays} hari</span>
                  <strong className="text-[#00FFAA]">{effectiveBuildTimeDays} hari</strong>
                </span>
              ) : (
                <strong className="text-[#00FFAA]">{buildTimeDays} hari</strong>
              )
            }.
          </p>
          
          <p className="text-sm sm:text-base text-[#6B8A8A] leading-relaxed">
            Kas negara saat ini: <strong className="text-[#E0E0E0]">{currentBudget >= 0 ? '+' : ''}{formattedCurrentBudget} NEO</strong>. Setelah pembangunan, kas akan menjadi <strong className="text-[#00FFAA]">{budgetAfterBuild >= 0 ? '+' : ''}{formattedBudgetAfterBuild} NEO</strong>.
          </p>
        </div>

        {/* Area Tombol (Diperkecil) */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-[#00FFAA]/20">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl py-2 text-center text-[#E0E0E0] font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
          >
            Batal
          </button>

          <button
            onClick={() => { if (hasBudget) { onConfirm(); onClose(); } }}
            disabled={!hasBudget}
            className={
              `w-full sm:w-auto px-6 rounded-xl py-2 text-center font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 shadow hover:shadow-md active:scale-[0.98] ${
                hasBudget
                  ? 'bg-[#00FFAA] hover:bg-[#00e699] text-[#0A1A1A] border border-[#00FFAA] cursor-pointer'
                  : 'bg-[#0A1A1A] text-[#6B8A8A] border border-[#00FFAA]/20 opacity-40 cursor-not-allowed'
              }`
            }
          >
            {hasBudget ? 'Bangun Kedutaan' : 'Kas Tidak Mencukupi'}
          </button>
        </div>

      </div>
    </NotebookModalWrapper>
  );

  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}