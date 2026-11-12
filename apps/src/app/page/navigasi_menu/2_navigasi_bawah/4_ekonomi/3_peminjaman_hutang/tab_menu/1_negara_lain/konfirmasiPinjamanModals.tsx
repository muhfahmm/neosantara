"use client"
import React from "react";
import { CreditCard } from "lucide-react";
import { renderFlag } from "../utils";
import NotebookModalWrapper from "../../../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface KonfirmasiPinjamanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loanSource: string;
  iso?: string | null;
  maxLoan: number;
  interest: number;
  term: number;
  totalPayment: number;
  currentMoney: number;
}

export default function KonfirmasiPinjamanModal({
  isOpen,
  onClose,
  onConfirm,
  loanSource,
  iso,
  maxLoan,
  interest,
  term,
  totalPayment,
  currentMoney,
}: KonfirmasiPinjamanModalProps) {
  if (!isOpen) return null;

  const isFundsSufficient = true;

  return (
    <NotebookModalWrapper zIndexClass="z-[70]" frameClassName="loan-confirm-modal-frame">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-root-surface font-sans pointer-events-auto">
        {/* HEADER */}
        <div className="loan-confirm-header relative z-10 flex items-center justify-between gap-3 border-b border-root-accent/20 bg-root-canvas px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className={`shrink-0 border border-root-accent/30 bg-root-surface p-1.5 ${rootBorderRadius.card}`}>
              <CreditCard className="h-4 w-4 text-root-accent sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h3 className={rootModalTypography.title}>Konfirmasi Pinjaman</h3>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className="loan-confirm-content min-h-0 flex-1 overflow-y-auto p-6 bg-root-surface custom-scrollbar">
          <div className="loan-confirm-columns grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className={`loan-confirm-panel flex flex-col justify-between border border-root-accent/30 bg-root-canvas p-6 ${rootBorderRadius.card}`}>
              <div className="loan-confirm-panel-content space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`border border-root-accent/30 bg-root-surface p-3 ${rootBorderRadius.card}`}>
                    <CreditCard className="h-6 w-6 text-root-accent" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-root-accent">Sumber Pinjaman</h4>
                  </div>
                </div>

                <div className={`loan-confirm-details border border-root-accent/30 bg-root-surface p-5 ${rootBorderRadius.card}`}>
                  <div className="flex items-center gap-3 mb-4 text-root-accent font-black">
                    {renderFlag(iso, loanSource)}
                    <span>{loanSource}</span>
                  </div>
                  <div className="text-xs text-root-text space-y-3">
                    <div className="flex justify-between">
                      <span className="text-root-subtle">Jumlah Pinjaman</span>
                      <span className="font-bold text-root-text">{maxLoan.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-root-subtle">Bunga</span>
                      <span className="font-bold text-root-text">{interest}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-root-subtle">Masa Tenggang</span>
                      <span className="font-bold text-root-text">{term} Hari</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-root-accent/20">
                      <span className="font-bold text-root-accent">Total Pembayaran</span>
                      <span className="font-black text-root-accent">{totalPayment.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`loan-confirm-panel flex flex-col justify-between border border-root-accent/30 bg-root-canvas p-6 ${rootBorderRadius.card}`}>
              <div className="loan-confirm-panel-content space-y-6 text-root-text">
                <div>
                  <h4 className="text-base font-black text-root-accent uppercase tracking-wider">Ringkasan Pinjaman</h4>
                </div>

                <div className="loan-confirm-summary-grid grid grid-cols-1 gap-4 text-xs">
                  <div className={`border border-root-accent/30 bg-root-surface p-4 ${rootBorderRadius.card}`}>
                    <p className="text-root-subtle">Saldo Kas Negara</p>
                    <p className="mt-1 font-black text-root-accent">{currentMoney.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</p>
                  </div>
                  <div className={`border border-root-accent/30 bg-root-surface p-4 ${rootBorderRadius.card}`}>
                    <p className="text-root-subtle">Total Outstanding</p>
                    <p className="mt-1 font-black text-root-accent">{totalPayment.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</p>
                  </div>
                  <div className={`border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 ${rootBorderRadius.card}`}>
                    <p className="font-bold uppercase text-[10px] tracking-wider">Pinjaman siap dikonfirmasi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="loan-confirm-footer flex flex-col gap-3 px-6 pb-6 pt-3 lg:flex-row lg:items-center lg:justify-end bg-root-canvas border-t border-root-accent/30">
          <button
            onClick={onClose}
            className={`w-full cursor-pointer border border-root-accent/30 bg-root-surface px-5 py-3 text-xs font-bold uppercase text-root-text transition-all hover:border-root-accent lg:w-auto ${rootBorderRadius.card}`}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`w-full cursor-pointer bg-root-accent px-5 py-3 text-xs font-bold uppercase text-root-canvas transition-all hover:bg-root-accent/80 lg:w-auto ${rootBorderRadius.card}`}
          >
            Konfirmasi Pinjaman
          </button>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}