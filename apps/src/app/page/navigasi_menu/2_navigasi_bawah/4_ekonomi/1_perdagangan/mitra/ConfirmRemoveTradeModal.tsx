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
      maxWidthClass="max-w-md"
      compact
      backdropClassName="bg-black/80"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-trade-title"
        className="overflow-hidden"
      >
        <header className="border-b border-rose-500/20 bg-[#0A1A1A] px-5 py-4">
          <h2 id="remove-trade-title" className="text-sm font-black uppercase tracking-wide text-rose-400">
            Putus Hubungan Dagang
          </h2>
        </header>
        <div className="space-y-5 p-5">
          <p className="text-sm text-[#E0E0E0]">
            Apakah Anda yakin ingin memutus hubungan dagang dengan{" "}
            <strong className="text-rose-400">{partnerName}</strong>? Anda dapat menjalin kembali melalui menu Mitra.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] py-2.5 text-center text-[12px] font-black uppercase tracking-widest text-[#00FFAA] transition-all duration-150 hover:bg-[#00FFAA] hover:text-[#0A1A1A]"
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
