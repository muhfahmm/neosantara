"use client";
import React from "react";
import { createPortal } from "react-dom";

import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
interface DestroyKontrakModalProps {
  isOpen: boolean;
  countryName?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DestroyKontrakModal({ isOpen, countryName, onClose, onConfirm }: DestroyKontrakModalProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const modalContent = (
    <NotebookModalWrapper compact zIndexClass="z-[100000001]" frameClassName="root-confirm-modal-frame">
      {/* Container Modal Lebih Lebar dan Panjang */}
      <div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
        
        {/* Area Konten */}
        <div className="flex-1">
          <RootInfoModalHeader title={t("detail_negara_ai.research.destroyTitle")} onClose={onClose} size="compact" />
          
          <p className="text-sm sm:text-base text-root-text mb-6 leading-relaxed">
            {t("detail_negara_ai.research.destroyPromptPrefix")} <strong className="text-white">{countryName}</strong>? {t("detail_negara_ai.research.destroyPromptSuffix")}
          </p>
        </div>

        {/* Area Tombol di bagian paling bawah (Diperkecil) */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-rose-500/20">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2 text-center text-root-text font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
          >
            {t("detail_negara_ai.common.cancel")}
          </button>

          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="w-full sm:w-auto px-6 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-500 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            {t("detail_negara_ai.research.destroyConfirm")}
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