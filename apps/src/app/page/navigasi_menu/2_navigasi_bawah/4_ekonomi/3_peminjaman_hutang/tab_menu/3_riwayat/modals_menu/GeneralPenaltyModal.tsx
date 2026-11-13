"use client";
import React from "react";
import { Info } from "lucide-react";
import NotebookModalWrapper from "../../../../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function GeneralPenaltyModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[80]" frameClassName="loan-modal-frame">
      <div className="flex h-full min-w-0 w-full flex-col overflow-hidden bg-root-surface font-sans">
        <RootInfoModalHeader
          title="Penjelasan Denda Telat Bayar"
          onClose={onClose}
          size="standard"
          icon={<Info aria-hidden="true" />}
        />

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
