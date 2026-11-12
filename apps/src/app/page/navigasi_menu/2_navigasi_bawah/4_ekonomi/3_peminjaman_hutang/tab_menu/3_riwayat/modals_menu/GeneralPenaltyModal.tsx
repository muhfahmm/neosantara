"use client";
import React from "react";
import { Info } from "lucide-react";
import NotebookModalWrapper from "../../../../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function GeneralPenaltyModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[80]" frameClassName="loan-modal-frame">
      <div className="flex h-full min-w-0 w-full flex-col overflow-hidden bg-root-surface font-sans">
        <div className="loan-modal-header flex shrink-0 items-center justify-between gap-2 border-b border-root-accent/20 bg-root-canvas px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="shrink-0 rounded-lg border border-root-accent/30 bg-root-surface p-1 sm:p-1.5">
              <Info className="h-4 w-4 text-root-accent sm:h-5 sm:w-5" />
            </div>
            <h2 className={rootModalTypography.title}>Penjelasan Denda Telat Bayar</h2>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className="loan-modal-content min-h-0 flex-1 overflow-y-auto bg-root-canvas/80 p-4 custom-scrollbar sm:p-5">
          <div className="loan-penalty-modal-copy space-y-3 text-sm font-semibold leading-relaxed text-root-text">
            <p>Jika sebuah pinjaman jatuh tempo dan tidak bisa dibayar penuh, sistem akan mencoba membayar sebanyak mungkin dari kas negara.</p>
            <p>Jika masih ada sisa, sistem menandainya sebagai <strong className="text-rose-400">terlewat</strong> dan menambahkan denda setiap bulannya.</p>
            <p>Perhitungan ini sama untuk pinjaman bilateral dan multilateral di game saat ini.</p>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}
