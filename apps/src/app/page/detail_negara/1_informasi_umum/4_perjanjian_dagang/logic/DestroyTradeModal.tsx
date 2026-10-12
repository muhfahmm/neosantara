"use client";
import React from "react";
import { createPortal } from "react-dom";

interface DestroyTradeModalProps {
  isOpen: boolean;
  countryName?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DestroyTradeModal({ isOpen, countryName, onClose, onConfirm }: DestroyTradeModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 font-sans text-white pointer-events-auto">
      <div className="w-full max-w-[440px] bg-[#0F2424] border border-rose-500/40 rounded-2xl p-6 shadow-2xl relative">
        <h3 className="text-lg font-black text-rose-400 tracking-wide uppercase mb-3">Konfirmasi Putus Hubungan Dagang</h3>
        <p className="text-xs sm:text-sm text-[#E0E0E0] mb-6 leading-relaxed">Apakah Anda yakin ingin memutus hubungan dagang dengan <strong className="text-white">{countryName}</strong>? Anda dapat menjalin kembali melalui menu Mitra.</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="flex-1 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl py-2.5 text-center text-[#E0E0E0] font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
          >
            Batal
          </button>

          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-500 rounded-xl py-2.5 text-center text-white font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            Putus Hubungan
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
