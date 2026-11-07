// mitra/confirmRemoveTradeModals.tsx

"use client";
import React from "react";
import NotebookModalWrapper from "../../../NotebookModalWrapper";

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
        <header className="border-b border-rose-500/20 bg-root-canvas px-5 py-4">
          <h2 id="remove-trade-title" className="text-sm font-black uppercase tracking-wide text-rose-400">
            Putus Hubungan Dagang
          </h2>
        </header>
        <div className="space-y-5 p-5">
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