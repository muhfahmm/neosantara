"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from "react";
import { X, AlertCircle, Banknote } from "lucide-react";
import NotebookModalWrapper from "../../../../NotebookModalWrapper";

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
    <NotebookModalWrapper onClose={onClose} compact maxWidthClass="max-w-lg" zIndexClass="z-[100]">
      <div className="flex flex-col font-sans">
        <div className="px-4 sm:px-5 py-3 border-b border-root-danger/25 bg-root-canvas flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-root-danger drop-shadow-[0_0_6px_#FF2D55]" />
            <div>
              <h3 className="text-xl font-black text-root-danger uppercase tracking-wide">Dana Tidak Cukup</h3>
              <p className="text-[11px] text-root-subtle mt-1">Kas negara Anda tidak mencukupi untuk membangun ICBM.</p>
            </div>
          </div>
          <SharedModalCloseButton onClick={onClose} className="p-2.5 rounded-xl border border-root-danger/40 text-root-subtle hover:text-root-danger hover:bg-root-danger/10 transition-all cursor-pointer flex items-center gap-1.5" appearance="custom">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </SharedModalCloseButton>
        </div>

        <div className="p-4 sm:p-5 bg-root-surface">
          <div className="space-y-4 text-sm text-[#D6F5EC]">
            <div className="rounded-2xl border border-root-danger/40 bg-root-danger/10 p-4">
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
                <span className="text-root-accent">{requiredBudget.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#FF6B88] border-t border-root-danger/20 pt-3">
                <span>Kekurangan Dana:</span>
                <span>-{deficit.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-5 py-3 border-t border-root-danger/25 bg-root-canvas flex w-full gap-3">
          <SharedModalCloseButton
            onClick={() => {
              onOpenDebt?.(); // Buka modal Pinjaman & Hutang
              onClose();      // Tutup modal kekurangan dana ini
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-root-accent text-[#04100F] font-black text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(0,255,170,0.45)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
           appearance="custom">
            <Banknote className="h-4 w-4" />
            Pinjam Dana
          </SharedModalCloseButton>

          <button 
            onClick={onClose} 
            className="flex-1 py-3 rounded-lg border border-root-danger/50 text-[#FF6B88] font-black text-xs uppercase tracking-wider hover:bg-root-danger/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            Kembali
          </button>
        </div>
    </div>
    </NotebookModalWrapper>
  );
}