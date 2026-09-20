"use client";
import React from "react";
import { X } from "lucide-react";
import { LoanRecord } from "../../utils";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        <div className="px-8 py-6 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10">
          <div>
            <h3 className="text-2xl font-black text-[#00FFAA] tracking-tight leading-none uppercase">Detail Denda Telat Bayar</h3>
            <p className="text-xs text-[#6B8A8A] font-semibold mt-1">Penjelasan lengkap denda yang akan dikenakan jika pembayaran terlewat.</p>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <div className="space-y-3 text-[#E0E0E0] font-semibold">
            <div className="text-sm font-black text-[#00FFAA]">Sumber Pinjaman</div>
            <div className="text-sm">{loan.source} {loan.iso ? `(${loan.iso.toUpperCase()})` : ''}</div>

            <div className="text-sm font-black text-[#00FFAA] mt-3">Data Pinjaman</div>
            <div className="text-sm">Pokok: <span className="text-[#00FFAA] font-bold">{Number(loan.amount || 0).toLocaleString('id-ID')} EM</span></div>
            <div className="text-sm">Bunga awal: <span className="text-[#00FFAA] font-bold">{Number(loan.interest || 0)}%</span></div>
            <div className="text-sm">Total saat ini: <span className="text-[#00FFAA] font-bold">{outstanding.toLocaleString('id-ID')} EM</span></div>
            <div className="text-sm">Sudah dibayar: <span className="text-emerald-400 font-bold">{(Number(loan.paidAmount) || 0).toLocaleString('id-ID')} EM</span></div>
            <div className="text-sm">Denda terakumulasi: <span className="text-rose-400 font-bold">{(Number(loan.accumulatedPenalty) || 0).toLocaleString('id-ID')} EM</span></div>
            <div className="text-sm">Telah terlewat: <span className="text-rose-400 font-bold">{missed} bulan</span></div>

            <div className="text-sm font-black text-[#00FFAA] mt-4 pt-4 border-t border-[#00FFAA]/20">Estimasi Denda Jika Terlambat Sekali Lagi</div>
            <div className="text-xs text-[#6B8A8A]">Rumus: denda = outstanding × (0.015 × jumlah_bulan_terlewat)</div>
            <div className="text-sm">Jika melewatkan pembayaran lagi (bulan terlewat menjadi <span className="text-rose-400 font-bold">{nextMissed}</span>):</div>
            <div className="text-sm">Tarif denda terpakai: <span className="text-amber-400 font-bold">{ratePercent}%</span></div>
            <div className="text-sm font-black text-rose-400">Perkiraan denda tambahan: {nextPenalty.toLocaleString('id-ID')} EM</div>
          </div>
        </div>

      </div>
    </div>
  );
}
