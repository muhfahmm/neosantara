"use client";
import React from "react";
import { createPortal } from "react-dom";

import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
interface DestroyEmbassyModalProps {
  isOpen: boolean;
  countryName?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DestroyEmbassyModal({ isOpen, countryName, onClose, onConfirm }: DestroyEmbassyModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <NotebookModalWrapper compact zIndexClass="z-[100000001]">
      {/* Container Modal Lebih Lebar dan Panjang */}
      <div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
        
        {/* Area Konten */}
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-black text-rose-400 tracking-wide uppercase mb-6 border-b border-rose-500/20 pb-4">
            Konfirmasi Hancurkan Kedutaan
          </h3>
          
          <p className="text-sm sm:text-base text-root-text mb-6 leading-relaxed">
            Apakah Anda yakin ingin menghancurkan kedutaan di <strong className="text-white">{countryName}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        {/* Area Tombol di bagian paling bawah (Diperkecil) */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-rose-500/20">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2 text-center text-root-text font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
          >
            Batal
          </button>

          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="w-full sm:w-auto px-6 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-500 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            Hancurkan Kedutaan
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