"use client";

import { AlertTriangle, ArrowDown, Info } from "lucide-react";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";

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
      contentSized
      frameClassName="trade-market-blocked-info-frame content-sized-info-frame"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-market-blocked-title"
        className="overflow-hidden text-white"
      >
        <RootInfoModalHeader
          title="Info Blokir"
          titleId="trade-market-blocked-title"
          onClose={onClose}
          size="standard"
          icon={<Info aria-hidden="true" />}
        />

        <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-xl border border-rose-500/25 bg-rose-950/20 p-4 sm:p-5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-300 sm:h-6 sm:w-6" />
            <div className="min-w-0">
              <h3 className="text-sm font-black uppercase tracking-wide text-rose-200 sm:text-lg">
                Perdagangan Diblokir
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#E1EEEE] sm:text-base">
                Skor sentralisasi melewati batas 85.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-950/20 p-4 sm:p-5">
            <ArrowDown className="mt-0.5 h-5 w-5 shrink-0 text-amber-300 sm:h-6 sm:w-6" />
            <div className="min-w-0">
              <p className="mb-1 text-xs font-black uppercase tracking-wider text-amber-200 sm:text-sm">
                Solusi
              </p>
              <p className="text-xs leading-relaxed text-[#F1F7F7] sm:text-base">
                Kurangi nasionalisasi atau sesuaikan ideologi/agama hingga skor di bawah 85.
              </p>
            </div>
          </div>
        </div>
      </section>
    </NotebookModalWrapper>
  );
}