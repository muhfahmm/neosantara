"use client"
import React from "react";
import { X, AlertCircle } from "lucide-react";

interface AgamaGagalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBorrow?: () => void;
  cost: number;
  currentMoney: number;
}

export default function AgamaGagalModal({
  isOpen,
  onClose,
  onBorrow,
  cost,
  currentMoney,
}: AgamaGagalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-[#0F2424] border border-rose-500/40 rounded-2xl w-full max-w-[480px] min-h-[400px] overflow-hidden shadow-2xl relative font-sans animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-end px-6 py-4 shrink-0 border-b border-[#00FFAA]/20 bg-[#0A1A1A]">
          <button onClick={onClose} className="text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">
          <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>

          <h3 className="text-xl font-bold text-[#E0E0E0] mb-2 text-center">Dana Tidak Cukup!</h3>
          <p className="text-sm text-[#6B8A8A] text-center mb-6 leading-relaxed max-w-sm">
            Anda memerlukan <span className="font-bold text-[#00FFAA]">{cost.toLocaleString('id-ID')} EM</span> untuk perubahan ini.
            <br />
            Kas negara Anda saat ini: <span className="font-bold text-rose-400">{currentMoney.toLocaleString('id-ID')} EM</span>
          </p>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-3 px-6 pb-6 shrink-0 bg-[#0A1A1A] pt-4 border-t border-[#00FFAA]/20">
          {onBorrow && (
            <button
              onClick={() => {
                onBorrow();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-[#0A1A1A] font-black text-xs uppercase shadow-md hover:bg-amber-400 active:scale-95 transition-all cursor-pointer"
            >
              Ambil Hutang
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#00FFAA]/10 text-[#00FFAA] font-bold text-xs uppercase shadow-md hover:bg-[#00FFAA]/20 active:scale-95 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}