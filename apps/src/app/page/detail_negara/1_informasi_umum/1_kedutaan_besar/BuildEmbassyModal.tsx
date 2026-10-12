"use client";
import { getWaktuPembangunanKedutaanBonusPercent } from "@/app/page/bonus_logic";

import { createPortal } from "react-dom";

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
  const formattedCurrentBudget = currentBudget.toLocaleString('id-ID');
  const formattedBudgetAfterBuild = budgetAfterBuild.toLocaleString('id-ID');
  const hasBudget = currentBudget >= cost;

  const discountPct = getWaktuPembangunanKedutaanBonusPercent(countryDetail);
  const embassyCostDiscountPct = cost > 0 ? Math.max(0, (1 - cost / 10) * 100) : 0;
  const effectiveBuildTimeDays = discountPct > 0 
    ? Math.max(1, Math.floor(buildTimeDays * (1 - discountPct / 100))) 
    : buildTimeDays;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 font-sans text-white pointer-events-auto">
      <div className="w-full max-w-[440px] bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl p-6 shadow-2xl relative text-white">
        <h3 className="text-lg font-black text-[#00FFAA] tracking-wide uppercase mb-3">Konfirmasi Bangun Kedutaan</h3>
        <p className="text-xs sm:text-sm text-[#E0E0E0] mb-3 leading-relaxed">
          Apakah Anda ingin membangun kedutaan di <strong className="text-white">{countryName}</strong>? Biaya pembangunan di <strong className="text-white">{continentLabel}</strong> adalah {
            embassyCostDiscountPct > 0 ? (
              <span><span className="line-through text-rose-400 mr-1">10 NEO</span><strong className="text-[#00FFAA]">{cost.toLocaleString('id-ID')} NEO</strong></span>
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
        <p className="text-xs sm:text-sm text-[#6B8A8A] mb-6 leading-relaxed">
          Kas negara saat ini: <strong className="text-[#E0E0E0]">{currentBudget >= 0 ? '+' : ''}{formattedCurrentBudget} NEO</strong>. Setelah pembangunan, kas akan menjadi <strong className="text-[#00FFAA]">{budgetAfterBuild >= 0 ? '+' : ''}{formattedBudgetAfterBuild} NEO</strong>.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="flex-1 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl py-2.5 text-center text-[#E0E0E0] font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
          >
            Batal
          </button>

          <button
            onClick={() => { if (hasBudget) { onConfirm(); onClose(); } }}
            disabled={!hasBudget}
            className={
              `flex-1 rounded-xl py-2.5 text-center font-black text-[12px] tracking-widest uppercase transition-all duration-150 shadow hover:shadow-md active:scale-[0.98] ${
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
    </div>
  );

  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
