"use client"
import React from "react";
import { X, AlertCircle, Banknote } from "lucide-react";

interface IcbmInsufficientFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  requiredBudget: number;
  // 🔥 Tambahkan prop untuk membuka menu Pinjaman & Hutang
  onOpenDebt?: () => void; 
}

export default function IcbmInsufficientFundsModal({
  isOpen,
  onClose,
  currentBudget,
  requiredBudget,
  onOpenDebt,
}: IcbmInsufficientFundsModalProps) {
  if (!isOpen) return null;

  const deficit = Math.max(0, requiredBudget - currentBudget);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
      <div className="bg-[#061312] border-2 border-[#FF2D55] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_30px_rgba(255,45,85,0.35)] flex flex-col relative font-sans">
        <div className="px-8 py-6 border-b border-[#FF2D55]/25 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-[#FF2D55] drop-shadow-[0_0_6px_#FF2D55]" />
            <div>
              <h3 className="text-xl font-black text-[#FF2D55] uppercase tracking-wide">Dana Tidak Cukup</h3>
              <p className="text-[11px] text-[#6B8A8A] mt-1">Kas negara Anda tidak mencukupi untuk membangun ICBM.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl border border-[#FF2D55]/40 text-[#6B8A8A] hover:text-[#FF2D55] hover:bg-[#FF2D55]/10 transition-all cursor-pointer flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4 text-sm text-[#D6F5EC]">
            <div className="rounded-2xl border border-[#FF2D55]/40 bg-[#FF2D55]/10 p-4">
              <p className="text-sm font-bold text-[#FF6B88]">Dana saat ini tidak mencukupi</p>
              <p className="text-xs text-[#9CC9BD] mt-1">Silakan kumpulkan lebih banyak sumber daya sebelum memulai pembangunan.</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#9CC9BD]">Kas Negara Sekarang:</span>
                <span>{currentBudget.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#9CC9BD]">Biaya Pembangunan ICBM:</span>
                <span className="text-[#00FFAA]">{requiredBudget.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#FF6B88] border-t border-[#FF2D55]/20 pt-3">
                <span>Kekurangan Dana:</span>
                <span>-{deficit.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#FF2D55]/25 flex w-full gap-3">
          <button
            onClick={() => {
              onOpenDebt?.(); // Buka modal Pinjaman & Hutang
              onClose();      // Tutup modal kekurangan dana ini
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-[#00FFAA] text-[#04100F] font-black text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(0,255,170,0.45)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Banknote className="h-4 w-4" />
            Pinjam Dana
          </button>

          <button 
            onClick={onClose} 
            className="flex-1 py-3 rounded-lg border border-[#FF2D55]/50 text-[#FF6B88] font-black text-xs uppercase tracking-wider hover:bg-[#FF2D55]/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}