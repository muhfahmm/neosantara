"use client"
import React from "react";
import { X, CreditCard } from "lucide-react";
import { renderFlag } from "../../utils";

interface BayarHutangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loanSource: string;
  paymentAmount: number;
  currentMoney: number;
  iso?: string | null;
}

export default function BayarHutangModal({
  isOpen,
  onClose,
  onConfirm,
  loanSource,
  paymentAmount,
  currentMoney,
  iso,
}: BayarHutangModalProps) {
  if (!isOpen) return null;

  const isFundsSufficient = currentMoney >= paymentAmount;

  const handlePayClick = () => {
    if (isFundsSufficient) {
      onConfirm();
    } else {
      // 🔥 Ganti dengan alert browser sederhana karena file modal terpisah telah dihapus
      alert("Kas negara tidak mencukupi untuk melakukan pembayaran ini.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-[480px] min-h-[440px] overflow-hidden relative font-sans pointer-events-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        <div className="flex justify-end px-6 py-4 shrink-0 border-b border-[#00FFAA]/20">
          <button onClick={onClose} className="text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/30 flex items-center justify-center mb-4">
            <CreditCard className="w-10 h-10 text-[#00FFAA]" />
          </div>

          <h3 className="text-xl font-black text-[#00FFAA] mb-2 uppercase tracking-wide">Konfirmasi Pembayaran</h3>

          <div className="flex flex-col items-center text-sm text-[#E0E0E0] mb-2 leading-relaxed max-w-sm font-medium">
            <span className="mb-1">
              Anda akan membayar <span className="font-black text-[#00FFAA]">{paymentAmount.toLocaleString('id-ID')} EM</span>
            </span>
            <div className="flex items-center gap-2 font-black text-[#00FFAA]">
              <span className="text-[#6B8A8A] font-normal">untuk pinjaman dari</span>
              {renderFlag(iso, loanSource)}
              <span>{loanSource}</span>
            </div>
          </div>

          <div className="mt-2 text-xs font-bold text-[#6B8A8A] flex flex-col items-center gap-1">
            <span>Kas Negara Saat Ini:</span>
            <span className={`text-base font-black ${isFundsSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currentMoney.toLocaleString('id-ID')} EM
            </span>
            {!isFundsSufficient && (
              <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full mt-1">
                ⚠️ Uang tidak cukup untuk membayar penuh pinjaman ini
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-8 pb-6 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#E0E0E0] transition-all font-black text-xs uppercase tracking-wider cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handlePayClick}
            className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 active:scale-95"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}