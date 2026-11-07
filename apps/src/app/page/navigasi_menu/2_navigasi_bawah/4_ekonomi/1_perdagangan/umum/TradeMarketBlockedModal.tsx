"use client";

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import { Info, X } from "lucide-react";
import NotebookModalWrapper from "../../../NotebookModalWrapper";

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
        <div className="flex items-center justify-between gap-4 rounded-t-2xl border-b border-rose-500/30 bg-root-canvas px-6 py-4">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 shrink-0 text-rose-400" />
            <h2 id="trade-market-blocked-title" className="text-base font-black uppercase tracking-wide text-rose-400 sm:text-lg">
              Informasi Blokir
            </h2>
          </div>
          <SharedModalCloseButton
            type="button"
            onClick={onClose}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-rose-500/30 bg-root-surface px-3 py-2 text-xs font-bold uppercase text-rose-400 transition-colors hover:border-rose-500 hover:bg-root-surface hover:text-rose-400 hover:shadow-none"
           appearance="custom">
            <span className="font-semibold tracking-wider">Tutup</span>
            <X className="h-4 w-4" />
          </SharedModalCloseButton>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-8">
          <div className="mx-auto max-w-prose space-y-2 text-center">
            <h3 className="text-sm font-black uppercase tracking-wide text-rose-300 sm:text-base">
              Akses Pasar Global Ditolak
            </h3>
            <p className="text-xs leading-relaxed text-[#A7C4C4] sm:text-sm">
              Negara Anda diblokir dari perdagangan global karena skor sentralisasi
              melewati ambang batas.
            </p>
          </div>
          <div className="mx-auto max-w-prose rounded-xl border border-amber-400/20 bg-amber-950/20 px-4 py-3">
            <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
              Cara membuka akses
            </p>
            <p className="text-xs leading-relaxed text-[#D4E1E1] sm:text-sm">
              Turunkan rata-rata nasionalisasi atau sesuaikan ideologi dan agama
              hingga skor sentralisasi di bawah 85.
            </p>
          </div>
        </div>
      </section>
    </NotebookModalWrapper>
  );
}