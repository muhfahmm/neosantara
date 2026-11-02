"use client";

import { Info, X } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";

interface TradeMarketBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TradeMarketBlockedModal({
  isOpen,
  onClose,
}: TradeMarketBlockedModalProps) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper
      zIndexClass="z-[300]"
      maxWidthClass="max-w-2xl"
      compact
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-market-blocked-title"
        className="overflow-hidden text-white"
      >
        <div className="flex items-center justify-between gap-4 rounded-t-2xl border-b border-rose-500/30 bg-[#0A1A1A] px-6 py-4">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 shrink-0 text-rose-400" />
            <h2 id="trade-market-blocked-title" className="text-base font-black uppercase tracking-wide text-rose-400 sm:text-lg">
              Informasi Blokir
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-rose-500/30 bg-[#0F2424] px-3 py-2 text-xs font-bold uppercase text-rose-400 transition-all hover:bg-rose-500 hover:text-white"
          >
            <span className="font-semibold tracking-wider">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-8 text-center sm:px-10">
          <p className="text-sm leading-relaxed text-[#A7C4C4] sm:text-lg">
            Negara Anda terisolasi dari Pasar Perdagangan Global karena skor
            sentralisasi melewati ambang blokir. Turunkan rata-rata nasionalisasi
            atau ubah ideologi/agama agar skor turun di bawah 85.
          </p>
        </div>
      </section>
    </NotebookModalWrapper>
  );
}
