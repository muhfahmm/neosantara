"use client";
import React from "react";
import { createPortal } from "react-dom";

import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
interface DestroyPaktaModalProps {
  isOpen: boolean;
  countryName?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DestroyPaktaModal({ isOpen, countryName, onClose, onConfirm }: DestroyPaktaModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <NotebookModalWrapper compact maxWidthClass="max-w-sm" zIndexClass="z-[100000001]">
      <div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
        <h3 className="text-lg font-black text-rose-400 tracking-wide uppercase mb-3">Konfirmasi Putus Pakta Non-Agresi</h3>
        <p className="text-xs sm:text-sm text-root-text mb-6 leading-relaxed">Apakah Anda yakin ingin memutus pakta non-agresi dengan <strong className="text-white">{countryName}</strong>? Tindakan ini dapat memengaruhi hubungan diplomatik.</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="flex-1 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2.5 text-center text-root-text font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
          >
            Batal
          </button>

          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-500 rounded-xl py-2.5 text-center text-white font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            Putus Pakta
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