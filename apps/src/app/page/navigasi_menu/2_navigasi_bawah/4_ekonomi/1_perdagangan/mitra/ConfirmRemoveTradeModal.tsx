// mitra/confirmRemoveTradeModals.tsx

"use client";
import React from "react";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { Handshake } from "lucide-react";

interface Props {
  isOpen: boolean;
  partnerName?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmRemoveTradeModal({ isOpen, partnerName, onClose, onConfirm }: Props) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper
      zIndexClass="z-[80]"
      compact
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-trade-title"
        className="overflow-hidden"
      >
        <RootInfoModalHeader
          title="Putus Hubungan Dagang"
          titleId="remove-trade-title"
          onClose={onClose}
          size="standard"
          icon={<Handshake aria-hidden="true" />}
        />
        <div className="space-y-5 p-4 sm:p-5">
          <p className="text-sm text-root-text">
            Apakah Anda yakin ingin memutus hubungan dagang dengan{" "}
            <strong className="text-rose-400">{partnerName}</strong>? Anda dapat menjalin kembali melalui menu Mitra.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-root-accent/30 bg-root-canvas py-2.5 text-center text-[12px] font-black uppercase tracking-widest text-root-accent transition-all duration-150 hover:bg-root-accent hover:text-root-canvas"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 rounded-lg bg-rose-600 py-2.5 text-center text-[12px] font-black uppercase tracking-widest text-white transition-all duration-150 hover:bg-rose-500"
            >
              Putus Hubungan
            </button>
          </div>
        </div>
      </section>
    </NotebookModalWrapper>
  );
}