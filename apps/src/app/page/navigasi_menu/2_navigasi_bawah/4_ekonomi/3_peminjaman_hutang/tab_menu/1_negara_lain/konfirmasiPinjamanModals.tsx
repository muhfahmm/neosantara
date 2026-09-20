"use client"
import React from "react";
import { X, CreditCard } from "lucide-react";
import { renderFlag } from "../utils";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] overflow-hidden relative font-sans pointer-events-auto flex flex-col">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10">
          <div>
            <h3 className="text-xl font-black text-[#00FFAA] uppercase tracking-tight">Konfirmasi Pinjaman</h3>
            <p className="text-[10px] text-[#6B8A8A]">Verifikasi detail pinjaman sebelum disetujui.</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1.5"
          >
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#0F2424] custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[#0F2424] border border-[#00FFAA]/30">
                    <CreditCard className="h-6 w-6 text-[#00FFAA]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#00FFAA]">Sumber Pinjaman</h4>
                    <p className="text-[10px] text-[#6B8A8A]">Negara atau lembaga yang memberi pinjaman.</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0F2424] border border-[#00FFAA]/30 p-5">
                  <div className="flex items-center gap-3 mb-4 text-[#00FFAA] font-black">
                    {renderFlag(iso, loanSource)}
                    <span>{loanSource}</span>
                  </div>
                  <div className="text-xs text-[#E0E0E0] space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#6B8A8A]">Jumlah Pinjaman</span>
                      <span className="font-bold text-[#E0E0E0]">{maxLoan.toLocaleString("id-ID")} EM</span>
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
                      <span className="font-black text-[#00FFAA]">{totalPayment.toLocaleString("id-ID")} EM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-6 text-[#E0E0E0]">
                <div>
                  <h4 className="text-base font-black text-[#00FFAA] uppercase tracking-wider">Ringkasan Pinjaman</h4>
                  <p className="text-[10px] text-[#6B8A8A] mt-1">Pinjaman ini akan menambah kas negara saat dikonfirmasi.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 text-xs">
                  <div className="rounded-2xl bg-[#0F2424] border border-[#00FFAA]/30 p-4">
                    <p className="text-[#6B8A8A]">Saldo Kas Negara</p>
                    <p className="mt-1 text-xl font-black text-[#00FFAA]">{currentMoney.toLocaleString("id-ID")} EM</p>
                  </div>
                  <div className="rounded-2xl bg-[#0F2424] border border-[#00FFAA]/30 p-4">
                    <p className="text-[#6B8A8A]">Total Outstanding</p>
                    <p className="mt-1 text-xl font-black text-[#00FFAA]">{totalPayment.toLocaleString("id-ID")} EM</p>
                  </div>
                  <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <p className="font-bold uppercase text-[10px] tracking-wider">Pinjaman siap dikonfirmasi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-6 pb-6 pt-3 lg:flex-row lg:items-center lg:justify-end bg-[#0A1A1A] border-t border-[#00FFAA]/30">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 lg:flex-1">
            Pinjaman akan langsung ditambahkan ke kas negara saat disetujui.
          </div>

          <button
            onClick={onClose}
            className="w-full lg:w-auto px-5 py-3 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#E0E0E0] hover:border-[#00FFAA] transition-all font-bold text-xs uppercase cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="w-full lg:w-auto px-5 py-3 rounded-xl font-bold text-xs uppercase cursor-pointer bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 transition-all"
          >
            Konfirmasi Pinjaman
          </button>
        </div>
      </div>
    </div>
  );
}
