"use client";

import { Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface LoanInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoanInfoModal({ isOpen, onClose }: LoanInfoModalProps) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper
      compact
      maxWidthClass="max-w-2xl"
      onClose={onClose}
      zIndexClass="z-[200]"
    >
      <div className="flex min-w-0 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-root-accent/20 bg-root-canvas px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="shrink-0 rounded-lg border border-root-accent/30 bg-root-surface p-1 sm:p-1.5">
              <Info className="h-4 w-4 text-root-accent sm:h-5 sm:w-5" />
            </div>
            <h2 className={rootModalTypography.title}>Informasi Pinjaman &amp; Hutang</h2>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className="space-y-3 bg-root-surface p-4 sm:p-5">
          <p className={`${rootModalTypography.body} ${rootModalTypography.muted} break-words`}>
            Pinjaman dari negara lain atau lembaga dunia menambah kas sekaligus
            total hutang negara. Setiap pinjaman memiliki bunga dan tanggal jatuh
            tempo, jadi periksa ketentuannya sebelum menyetujui.
          </p>
          <p className={`${rootModalTypography.body} ${rootModalTypography.muted} break-words`}>
            Rasio hutang terhadap PDB membandingkan total hutang dengan ukuran
            ekonomi negara. Batas aman dasarnya 60% dan dapat berubah karena
            bonus yang aktif. Pantau riwayat pinjaman dan lakukan pembayaran
            sebelum jatuh tempo untuk menghindari denda.
          </p>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}