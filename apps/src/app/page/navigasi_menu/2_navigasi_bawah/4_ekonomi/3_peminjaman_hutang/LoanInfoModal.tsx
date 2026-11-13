"use client";

import { Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface LoanInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoanInfoModal({ isOpen, onClose }: LoanInfoModalProps) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper
      onClose={onClose}
      zIndexClass="z-[200]"
      frameClassName="loan-modal-frame"
    >
      <div className="flex h-full min-w-0 w-full flex-col overflow-hidden bg-root-surface font-sans">
        <RootInfoModalHeader
          title="Informasi Pinjaman & Hutang"
          onClose={onClose}
          size="standard"
          icon={<Info aria-hidden="true" />}
        />

        <div className="loan-modal-content min-h-0 flex-1 overflow-y-auto space-y-3 bg-root-surface p-4 sm:p-5 custom-scrollbar">
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