"use client";
import React from "react";
import { createPortal } from "react-dom";

import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
interface DestroyPaktaModalProps {
  isOpen: boolean;
  countryName?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DestroyPaktaModal({ isOpen, countryName, onClose, onConfirm }: DestroyPaktaModalProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const modalContent = (
    <NotebookModalWrapper compact zIndexClass="z-[100000001]" frameClassName="root-confirm-modal-frame">
      <div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
        <RootInfoModalHeader title={t("detail_negara_ai.pact.destroyTitle")} onClose={onClose} size="compact" />
        <p className="text-xs sm:text-sm text-root-text mb-6 leading-relaxed">{t("detail_negara_ai.pact.destroyPromptPrefix")} <strong className="text-white">{countryName}</strong>? {t("detail_negara_ai.pact.destroyPromptSuffix")}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="flex-1 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2.5 text-center text-root-text font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
          >
            {t("detail_negara_ai.common.cancel")}
          </button>

          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-500 rounded-xl py-2.5 text-center text-white font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            {t("detail_negara_ai.pact.destroyConfirm")}
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