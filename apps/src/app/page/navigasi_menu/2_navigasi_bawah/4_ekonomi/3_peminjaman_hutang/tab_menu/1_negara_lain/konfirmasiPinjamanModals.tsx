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
    <NotebookModalWrapper zIndexClass="z-[70]">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0F2424] font-sans pointer-events-auto">
        {/* HEADER */}
        <div className="relative z-10 flex items-center justify-between gap-3 border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className={`shrink-0 border border-[#00FFAA]/30 bg-[#0F2424] p-1.5 ${rootBorderRadius.card}`}>
              <CreditCard className="h-4 w-4 text-[#00FFAA] sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h3 className={rootModalTypography.title}>Konfirmasi Pinjaman</h3>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#0F2424] custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className={`flex flex-col justify-between border border-[#00FFAA]/30 bg-[#0A1A1A] p-6 ${rootBorderRadius.card}`}>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`border border-[#00FFAA]/30 bg-[#0F2424] p-3 ${rootBorderRadius.card}`}>
                    <CreditCard className="h-6 w-6 text-[#00FFAA]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#00FFAA]">Sumber Pinjaman</h4>
                    <p className="text-[10px] text-[#6B8A8A]">Negara atau lembaga yang memberi pinjaman.</p>
                  </div>
                </div>

                <div className={`border border-[#00FFAA]/30 bg-[#0F2424] p-5 ${rootBorderRadius.card}`}>
                  <div className="flex items-center gap-3 mb-4 text-[#00FFAA] font-black">
                    {renderFlag(iso, loanSource)}
                    <span>{loanSource}</span>
                  </div>
                  <div className="text-xs text-[#E0E0E0] space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#6B8A8A]">Jumlah Pinjaman</span>
                      <span className="font-bold text-[#E0E0E0]">{maxLoan.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B8A8A]">Bunga</span>
                      <span className="font-bold text-[#E0E0E0]">{interest}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B8A8A]">Masa Tenggang</span>
                      <span className="font-bold text-[#E0E0E0]">{term} Hari</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-[#00FFAA]/20">
                      <span className="font-bold text-[#00FFAA]">Total Pembayaran</span>
                      <span className="font-black text-[#00FFAA]">{totalPayment.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`flex flex-col justify-between border border-[#00FFAA]/30 bg-[#0A1A1A] p-6 ${rootBorderRadius.card}`}>
              <div className="space-y-6 text-[#E0E0E0]">
                <div>
                  <h4 className="text-base font-black text-[#00FFAA] uppercase tracking-wider">Ringkasan Pinjaman</h4>
                  <p className="text-[10px] text-[#6B8A8A] mt-1">Pinjaman ini akan menambah kas negara saat dikonfirmasi.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 text-xs">
                  <div className={`border border-[#00FFAA]/30 bg-[#0F2424] p-4 ${rootBorderRadius.card}`}>
                    <p className="text-[#6B8A8A]">Saldo Kas Negara</p>
                    <p className="mt-1 text-xl font-black text-[#00FFAA]">{currentMoney.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</p>
                  </div>
                  <div className={`border border-[#00FFAA]/30 bg-[#0F2424] p-4 ${rootBorderRadius.card}`}>
                    <p className="text-[#6B8A8A]">Total Outstanding</p>
                    <p className="mt-1 text-xl font-black text-[#00FFAA]">{totalPayment.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</p>
                  </div>
                  <div className={`border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 ${rootBorderRadius.card}`}>
                    <p className="font-bold uppercase text-[10px] tracking-wider">Pinjaman siap dikonfirmasi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-6 pb-6 pt-3 lg:flex-row lg:items-center lg:justify-end bg-[#0A1A1A] border-t border-[#00FFAA]/30">
          <div className={`border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 lg:flex-1 ${rootBorderRadius.card}`}>
            Pinjaman akan langsung ditambahkan ke kas negara saat disetujui.
          </div>

          <button
            onClick={onClose}
            className={`w-full cursor-pointer border border-[#00FFAA]/30 bg-[#0F2424] px-5 py-3 text-xs font-bold uppercase text-[#E0E0E0] transition-all hover:border-[#00FFAA] lg:w-auto ${rootBorderRadius.card}`}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`w-full cursor-pointer bg-[#00FFAA] px-5 py-3 text-xs font-bold uppercase text-[#0A1A1A] transition-all hover:bg-[#00FFAA]/80 lg:w-auto ${rootBorderRadius.card}`}
          >
            Konfirmasi Pinjaman
          </button>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}
