"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState } from "react";
import { X, AlertCircle, Coins, Banknote } from "lucide-react";
import NeonAlertModal from "../NeonAlertModal";
import NotebookModalWrapper from "../../../../NotebookModalWrapper";
import { useIcbmMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useIcbmMenuTranslation";

interface DanaTidakCukupModalsProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  requiredBudget: number;
  // 🔥 Tambahkan prop baru untuk fungsi ambil hutang
  onTakeLoan?: () => void; 
}

export default function DanaTidakCukupModals({ 
  isOpen, 
  onClose, 
  currentBudget, 
  requiredBudget,
  onTakeLoan
}: DanaTidakCukupModalsProps) {
  const [showLoanUnavailable, setShowLoanUnavailable] = useState(false);
  const { language, translate } = useIcbmMenuTranslation();

  if (!isOpen) return null;

  const kekurangan = requiredBudget - currentBudget;

  const handleTakeLoan = () => {
    if (onTakeLoan) {
      onTakeLoan(); // Jalankan logika hutang dari parent
      onClose(); // Tutup modal setelah aksi
    } else {
      setShowLoanUnavailable(true);
    }
  };

  return (
    <>
      <NotebookModalWrapper onClose={onClose} compact zIndexClass="z-[100]">
        <div className="flex flex-col font-sans">
        {/* Header Modal */}
        <div className="px-4 sm:px-5 py-3 border-b border-root-danger/25 bg-root-canvas flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-root-danger animate-pulse drop-shadow-[0_0_6px_#FF2D55]" />
            <div>
              <h2 className="text-[length:var(--modal-font-title)] font-bold text-root-danger tracking-tight leading-none uppercase">{translate("program.insufficientTitle")}</h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-root-subtle mt-1">{translate("program.insufficientSubtitle")}</p>
            </div>
          </div>
          <SharedModalCloseButton onClick={onClose} className="p-2.5 rounded-xl border border-root-danger/40 text-root-subtle hover:text-root-danger hover:bg-root-danger/10 transition-all cursor-pointer flex items-center gap-1.5" appearance="custom">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">{translate("common.close")}</span>
            <X className="h-5 w-5" />
          </SharedModalCloseButton>
        </div>

        {/* Body Modal */}
        <div className="p-4 sm:p-5 bg-root-surface relative z-10 neon-scrollbar flex flex-col items-center">
          <div className="w-full max-w-lg space-y-4">
            <div className="text-center space-y-3">
              <div className="p-3 rounded-xl bg-root-danger/10 border border-root-danger/40 inline-block mx-auto">
                <Coins className="w-12 h-12 text-root-danger drop-shadow-[0_0_8px_#FF2D55]" />
              </div>
              <p className="text-sm font-semibold text-[#D6F5EC]">
                {translate("program.insufficientDescription")}
              </p>
              <p className="text-xs text-[#9CC9BD] leading-relaxed text-justify">
                {translate("program.insufficientGuidance")}
              </p>
            </div>

            <div className="bg-root-canvas border border-root-accent/20 p-4 rounded-xl space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#D6F5EC]">
                <span>{translate("program.currentBudget")}</span>
                <span className="text-[#FF6B88]">{currentBudget.toLocaleString(language, { maximumFractionDigits: 0 })} NEO</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#D6F5EC]">
                <span>{translate("program.requiredBudget")}</span>
                <span className="text-root-accent">{requiredBudget.toLocaleString(language, { maximumFractionDigits: 0 })} NEO</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#FF6B88] border-t border-root-danger/20 pt-3">
                <span>{translate("program.totalDeficit")}</span>
                <span>- {kekurangan.toLocaleString(language, { maximumFractionDigits: 0 })} NEO</span>
              </div>
            </div>

            {/* 🔥 Footer dengan 2 tombol (Kembali & Ambil Hutang) */}
            <div className="flex gap-3 justify-end pt-3 border-t border-root-danger/20">
              <button 
                onClick={onClose}
                className="px-5 py-2 rounded-xl border border-root-danger/50 text-[#FF6B88] hover:bg-root-danger/10 transition-all font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                {translate("common.back")}
              </button>
              <button 
                onClick={handleTakeLoan}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-root-accent text-[#04100F] font-black text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(0,255,170,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Banknote className="w-4 h-4" />
                {translate("program.borrow")}
              </button>
            </div>
          </div>
        </div>
        </div>
      </NotebookModalWrapper>
      <NeonAlertModal
        isOpen={showLoanUnavailable}
        onClose={() => setShowLoanUnavailable(false)}
        variant="info"
        title={translate("program.loanUnavailableTitle")}
        message={translate("program.loanUnavailableMessage")}
      />
    </>
  );
}