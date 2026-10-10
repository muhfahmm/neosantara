"use client";
import { createPortal } from "react-dom";
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

export default function BuildEmbassyModal({ isOpen, countryName, continent, currentBudget = 0, cost = 0, buildTimeDays = 60, countryDetail, onClose, onConfirm }: BuildEmbassyModalProps) {
  if (!isOpen) return null;

  const continentLabel = continent || 'Lainnya';
  const budgetAfterBuild = currentBudget - cost;
  const formattedCurrentBudget = currentBudget.toLocaleString('id-ID');
  const formattedBudgetAfterBuild = budgetAfterBuild.toLocaleString('id-ID');
  const hasBudget = currentBudget >= cost;

  const discountPct = getWaktuPembangunanKedutaanBonusPercent(countryDetail);
  const effectiveBuildTimeDays = discountPct > 0 
    ? Math.max(1, Math.floor(buildTimeDays * (1 - discountPct / 100))) 
    : buildTimeDays;

  return typeof window !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-[420px] bg-white rounded-2xl p-6 shadow-2xl border border-[#E5DCCF] relative font-sans">
        <h3 className="text-lg font-black text-[#3d2911] mb-3">Konfirmasi Bangun Kedutaan</h3>
        <p className="text-sm text-[#5c3c10] mb-3">
          Apakah Anda ingin membangun kedutaan di <strong>{countryName}</strong>? Biaya pembangunan di <strong>{continentLabel}</strong> adalah <strong>{cost} NEO</strong> dengan waktu pembangunan {
            discountPct > 0 ? (
              <span>
                <span className="line-through text-red-500 mr-1">{buildTimeDays} hari</span>
                <strong className="text-emerald-600">{effectiveBuildTimeDays} hari</strong>
              </span>
            ) : (
              <strong>{buildTimeDays} hari</strong>
            )
          }.
        </p>
        <p className="text-sm text-[#5c3c10] mb-6">
          Kas negara saat ini: <strong>{currentBudget >= 0 ? '+' : ''}{formattedCurrentBudget} NEO</strong>. Setelah pembangunan, kas akan menjadi <strong>{budgetAfterBuild >= 0 ? '+' : ''}{formattedBudgetAfterBuild} NEO</strong>.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="flex-1 bg-white/70 border border-[#C4B49C]/30 rounded py-2.5 text-center text-[#5c3c10] font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer hover:shadow-md"
          >
            Batal
          </button>

          <button
            onClick={() => { if (hasBudget) { onConfirm(); onClose(); } }}
            disabled={!hasBudget}
            className={
              `flex-1 rounded py-2.5 text-center text-white font-black text-[12px] tracking-widest uppercase transition-all duration-150 shadow hover:shadow-md active:scale-[0.98] ${
                hasBudget
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-700 cursor-pointer'
                  : 'bg-gray-300 border border-gray-400 cursor-not-allowed'
              }`
            }
          >
            {hasBudget ? 'Bangun Kedutaan' : 'Kas Tidak Mencukupi'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;
}
