"use client"
import React from "react";
import { X, CreditCard } from "lucide-react";
import { renderFlag } from "../../utils";

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
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10">
          <div>
            <h3 className="text-2xl font-black text-[#00FFAA] uppercase tracking-tight">Konfirmasi Pinjaman</h3>
            <p className="text-xs text-[#6B8A8A] font-semibold mt-1">Verifikasi detail pinjaman sebelum disetujui.</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#0A1A1A]/80 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30">
                    <CreditCard className="h-6 w-6 text-[#00FFAA]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#00FFAA] uppercase">Sumber Pinjaman</h4>
                    <p className="text-xs text-[#6B8A8A] font-medium">Negara atau lembaga yang memberi pinjaman.</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/20 p-6">
                  <div className="flex items-center gap-3 mb-4 text-[#00FFAA] font-black">
                    {renderFlag(iso, loanSource)}
                    <span>{loanSource}</span>
                  </div>
                  <div className="text-sm text-[#E0E0E0] space-y-3 font-semibold">
                    <div className="flex justify-between">
                      <span className="text-[#6B8A8A]">Jumlah Pinjaman</span>
                      <span className="font-black text-[#00FFAA]">{maxLoan.toLocaleString("id-ID")} EM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B8A8A]">Bunga</span>
                      <span className="font-black text-[#00FFAA]">{interest}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B8A8A]">Masa Tenggang</span>
                      <span className="font-black text-[#00FFAA]">{term} Hari</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-[#00FFAA]/20">
                      <span className="font-black">Total Pembayaran</span>
                      <span className="font-black text-[#00FFAA]">{totalPayment.toLocaleString("id-ID")} EM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl p-8 flex flex-col justify-between">
              <div className="space-y-6 text-[#E0E0E0]">
                <div>
                  <h4 className="text-lg font-black text-[#00FFAA] uppercase tracking-wider">Ringkasan Pinjaman</h4>
                  <p className="text-xs text-[#6B8A8A] font-medium mt-2">Pinjaman ini akan menambah kas negara saat dikonfirmasi.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/20 p-4">
                    <p className="text-[#6B8A8A] text-xs font-bold uppercase">Saldo Kas Negara</p>
                    <p className="mt-2 text-2xl font-black text-[#00FFAA]">{currentMoney.toLocaleString("id-ID")} EM</p>
                  </div>
                  <div className="rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/20 p-4">
                    <p className="text-[#6B8A8A] text-xs font-bold uppercase">Total Outstanding</p>
                    <p className="mt-2 text-2xl font-black text-rose-400">{totalPayment.toLocaleString("id-ID")} EM</p>
                  </div>
                  <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <p className="font-black uppercase text-[10px] tracking-wider">Pinjaman siap dikonfirmasi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-8 pb-8 pt-4 lg:flex-row lg:items-center lg:justify-end bg-[#0A1A1A] border-t border-[#00FFAA]/20">
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-bold text-emerald-400 lg:flex-1">
            Pinjaman akan langsung ditambahkan ke kas negara saat disetujui.
          </div>

          <button
            onClick={onClose}
            className="w-full lg:w-auto px-6 py-4 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#E0E0E0] transition-all font-black text-xs uppercase tracking-wider cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="w-full lg:w-auto px-6 py-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80"
          >
            Konfirmasi Pinjaman
          </button>
        </div>
      </div>
    </div>
  );
}
