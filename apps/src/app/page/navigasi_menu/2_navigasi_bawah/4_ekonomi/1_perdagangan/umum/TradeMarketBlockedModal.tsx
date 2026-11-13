"use client";

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import { AlertTriangle, ArrowDown, Info, X } from "lucide-react";
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
      compact
      frameClassName="trade-market-blocked-info-frame"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-market-blocked-title"
        className="overflow-hidden text-white"
      >
        <div className="flex items-center justify-between gap-2 rounded-t-2xl border-b border-rose-500/30 bg-root-canvas px-3 py-2 sm:px-5 sm:py-2.5">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-rose-400" />
            <h2 id="trade-market-blocked-title" className="text-xs font-black uppercase tracking-wide text-rose-400 sm:text-sm">
              Info Blokir
            </h2>
          </div>
          <SharedModalCloseButton
            type="button"
            onClick={onClose}
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-rose-500/30 bg-root-surface px-2 py-1 text-[10px] font-bold uppercase text-rose-400 transition-colors hover:border-rose-500 hover:bg-root-surface hover:text-rose-400 hover:shadow-none"
           appearance="custom">
            <span className="font-semibold tracking-wide">Tutup</span>
            <X className="h-3 w-3" />
          </SharedModalCloseButton>
        </div>

        <div className="space-y-2 px-3 py-3 sm:px-4">
          <div className="mx-auto flex max-w-prose items-center gap-2 rounded-lg border border-rose-500/25 bg-rose-950/20 px-3 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-300" />
            <div className="min-w-0">
              <h3 className="text-xs font-black uppercase tracking-wide text-rose-200 sm:text-sm">
                Perdagangan Diblokir
              </h3>
              <p className="text-[10px] leading-relaxed text-[#E1EEEE] sm:text-xs">
                Skor sentralisasi melewati batas 85.
              </p>
            </div>
          </div>
          <div className="mx-auto flex max-w-prose items-start gap-2 rounded-lg border border-amber-400/25 bg-amber-950/20 px-3 py-2">
            <ArrowDown className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div className="min-w-0">
              <p className="mb-0.5 text-[9px] font-black uppercase tracking-wider text-amber-200">
                Solusi
              </p>
              <p className="text-[10px] leading-relaxed text-[#F1F7F7] sm:text-xs">
                Kurangi nasionalisasi atau sesuaikan ideologi/agama hingga skor di bawah 85.
              </p>
            </div>
          </div>
        </div>
      </section>
    </NotebookModalWrapper>
  );
}