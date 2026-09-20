"use client"
import React from "react";
import { X, AlertCircle } from "lucide-react";

interface IdeologiGagalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBorrow?: () => void;
  cost: number;
  currentMoney: number;
}

export default function IdeologiGagalModal({
  isOpen,
  onClose,
  onBorrow,
  cost,
  currentMoney,
}: IdeologiGagalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
      {/* 🔥 STRUKTUR 3 BAGIAN (flex flex-col, min-h-[440px]) */}
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-[480px] min-h-[440px] overflow-hidden shadow-2xl relative font-sans animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        
        {/* HEADER (shrink-0) */}
        <div className="flex justify-end px-6 py-4 shrink-0 border-b border-[#00FFAA]/20">
          <button onClick={onClose} className="text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT (flex-1 untuk mengisi ruang kosong) */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-20 h-20 rounded-full bg-rose-950/50 border border-rose-500/30 flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>

          <h3 className="text-xl font-black text-[#E0E0E0] mb-2 text-center">Dana Tidak Cukup!</h3>
          <p className="text-sm text-[#6B8A8A] text-center mb-6 leading-relaxed max-w-sm">
            Anda memerlukan <span className="font-black text-[#00FFAA]">{cost.toLocaleString('id-ID')} EM</span> untuk perubahan ini.
            <br />
            Kas negara Anda saat ini: <span className="font-black text-rose-400">{currentMoney.toLocaleString('id-ID')} EM</span>
          </p>
        </div>

        {/* FOOTER (shrink-0) */}
        <div className="flex flex-col gap-3 px-8 pb-6 shrink-0">
          {onBorrow && (
            <button
              onClick={() => {
                onBorrow();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-black text-sm uppercase shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Ambil Hutang
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#0A1A1A] hover:bg-[#00FFAA]/10 text-[#E0E0E0] border border-[#00FFAA]/30 font-black text-sm uppercase shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}