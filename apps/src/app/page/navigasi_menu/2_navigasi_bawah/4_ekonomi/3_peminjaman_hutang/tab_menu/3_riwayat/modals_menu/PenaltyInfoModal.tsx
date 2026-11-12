"use client";
import React from "react";
import { Info } from "lucide-react";
import NotebookModalWrapper from "../../../../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { LoanRecord, formatLoanSourceName } from "../../utils";
import {
  calculateDelayedInterestAmountForBilateralLoan,
} from "../../logic/loanInterestRiseNegara";
import {
  calculateDelayedInterestAmountForMultilateralLoan,
} from "../../logic/loanInterestRiseWorldBank";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanRecord | null;
}

export default function PenaltyInfoModal({ isOpen, onClose, loan }: Props) {
  if (!isOpen || !loan) return null;

  const outstanding = Number(loan.totalRepayment) || 0;
  const missed = Number(loan.missedMonths || 0);
  const nextMissed = missed + 1;

  const nextPenalty = loan.type === "multilateral"
    ? calculateDelayedInterestAmountForMultilateralLoan(outstanding, nextMissed)
    : calculateDelayedInterestAmountForBilateralLoan(outstanding, nextMissed);

  const ratePercent = (0.015 * nextMissed * 100).toFixed(2);

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
          <div className="loan-penalty-modal-copy space-y-3 text-sm font-semibold text-root-text">
            <div className="text-sm font-black text-root-accent">Sumber Pinjaman</div>
            <div className="text-sm">{formatLoanSourceName(loan.source)}</div>

            <div className="mt-3 text-sm font-black text-root-accent">Data Pinjaman</div>
            <div className="text-sm">Pokok: <span className="font-bold text-root-accent">{Number(loan.amount || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })} NEO</span></div>
            <div className="text-sm">Bunga awal: <span className="font-bold text-root-accent">{Number(loan.interest || 0)}%</span></div>
            <div className="text-sm">Total saat ini: <span className="font-bold text-root-accent">{outstanding.toLocaleString('id-ID', { maximumFractionDigits: 0 })} NEO</span></div>
            <div className="text-sm">Sudah dibayar: <span className="font-bold text-emerald-400">{(Number(loan.paidAmount) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })} NEO</span></div>
            <div className="text-sm">Denda terakumulasi: <span className="font-bold text-rose-400">{(Number(loan.accumulatedPenalty) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })} NEO</span></div>
            <div className="text-sm">Telah terlewat: <span className="font-bold text-rose-400">{missed} bulan</span></div>

            <div className="mt-4 border-t border-root-accent/20 pt-4 text-sm font-black text-root-accent">Estimasi Denda Jika Terlambat Sekali Lagi</div>
            <div className="text-xs text-root-subtle">Rumus: denda = outstanding × (0.015 × jumlah_bulan_terlewat)</div>
            <div className="text-sm">Jika melewatkan pembayaran lagi (bulan terlewat menjadi <span className="font-bold text-rose-400">{nextMissed}</span>):</div>
            <div className="text-sm">Tarif denda terpakai: <span className="font-bold text-amber-400">{ratePercent}%</span></div>
            <div className="text-sm font-black text-rose-400">Perkiraan denda tambahan: {nextPenalty.toLocaleString('id-ID', { maximumFractionDigits: 0 })} NEO</div>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}
