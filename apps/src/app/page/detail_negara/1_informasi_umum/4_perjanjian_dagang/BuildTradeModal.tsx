"use client";
import React from "react";
import { createPortal } from "react-dom";

interface BuildTradeModalProps {
  isOpen: boolean;
  countryName?: string | null;
  chancePercent?: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BuildTradeModal({ isOpen, countryName, chancePercent, onClose, onConfirm }: BuildTradeModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 font-sans pointer-events-auto">
      <div className="w-full max-w-[440px] bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl p-6 shadow-2xl relative text-white">
        <h3 className="text-lg font-black text-[#00FFAA] tracking-wide uppercase mb-3">Konfirmasi Perjanjian Dagang</h3>
        <p className="text-xs sm:text-sm text-[#E0E0E0] mb-3 leading-relaxed">Apakah Anda ingin mengajukan perjanjian dagang kepada <strong className="text-white">{countryName}</strong>? Ini akan membuka jalur perdagangan antara kedua negara jika diterima.</p>
        {chancePercent !== undefined && (
          <p className="text-xs sm:text-sm font-bold text-[#00FFAA] mb-6">
            Peluang diterima: {Math.round(chancePercent)}% (berdasarkan hubungan bilateral, kabinet, dan riset).
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="flex-1 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl py-2.5 text-center text-[#E0E0E0] font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
          >
            Batal
          </button>

          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 bg-[#00FFAA] hover:bg-[#00e699] border border-[#00FFAA] rounded-xl py-2.5 text-center text-[#0A1A1A] font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            Jalin Perjanjian
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
