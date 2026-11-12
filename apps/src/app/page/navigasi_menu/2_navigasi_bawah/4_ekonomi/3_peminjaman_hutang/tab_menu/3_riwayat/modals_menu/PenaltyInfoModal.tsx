"use client";
import React from "react";
import { Info } from "lucide-react";
import NotebookModalWrapper from "../../../../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { LoanRecord } from "../../utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanRecord | null;
}

export default function PenaltyInfoModal({ isOpen, onClose, loan }: Props) {
  if (!isOpen || !loan) return null;

  const outstanding = Number(loan.totalRepayment) || 0;
  const missed = Number(loan.missedMonths || 0);

  return (
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[80]" frameClassName="loan-modal-frame">
      <div className="flex h-full min-w-0 w-full flex-col overflow-hidden bg-root-surface font-sans">
        <div className="loan-modal-header flex shrink-0 items-center justify-between gap-2 border-b border-root-accent/20 bg-root-canvas px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="shrink-0 rounded-lg border border-root-accent/30 bg-root-surface p-1 sm:p-1.5">
              <Info className="h-4 w-4 text-root-accent sm:h-5 sm:w-5" />
            </div>
            <h2 className={rootModalTypography.title}>Detail Denda Telat Bayar</h2>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className="loan-modal-content min-h-0 flex-1 overflow-y-auto bg-root-canvas/80 p-4 custom-scrollbar sm:p-5">
          <div className="loan-penalty-modal-copy loan-penalty-detail-copy space-y-3 text-sm font-semibold text-root-text">
            <section className="loan-penalty-detail-section">
              <h3 className="loan-penalty-detail-heading text-sm font-black text-root-accent">Data Pinjaman</h3>
              <div className="loan-penalty-detail-grid grid grid-cols-2 gap-2">
                <div className="loan-penalty-detail-item">
                  <span className="loan-penalty-detail-label">Pokok</span>
                  <span className="font-bold text-root-accent">{Number(loan.amount || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })} NEO</span>
                </div>
                <div className="loan-penalty-detail-item">
                  <span className="loan-penalty-detail-label">Bunga awal</span>
                  <span className="font-bold text-root-accent">{Number(loan.interest || 0)}%</span>
                </div>
                <div className="loan-penalty-detail-item">
                  <span className="loan-penalty-detail-label">Total saat ini</span>
                  <span className="font-bold text-root-accent">{outstanding.toLocaleString('id-ID', { maximumFractionDigits: 0 })} NEO</span>
                </div>
                <div className="loan-penalty-detail-item">
                  <span className="loan-penalty-detail-label">Sudah dibayar</span>
                  <span className="font-bold text-emerald-400">{(Number(loan.paidAmount) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })} NEO</span>
                </div>
                <div className="loan-penalty-detail-item">
                  <span className="loan-penalty-detail-label">Denda terakumulasi</span>
                  <span className="font-bold text-rose-400">{(Number(loan.accumulatedPenalty) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })} NEO</span>
                </div>
                <div className="loan-penalty-detail-item">
                  <span className="loan-penalty-detail-label">Telah terlewat</span>
                  <span className="font-bold text-rose-400">{missed} bulan</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}
