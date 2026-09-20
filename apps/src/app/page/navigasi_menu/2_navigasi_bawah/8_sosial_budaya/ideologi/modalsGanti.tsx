"use client"
import React from "react";
import { X, Coins } from "lucide-react";

interface IdeologiConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  icon: React.ReactNode;
  bonusText: string;
  cost: number;
}

export default function IdeologiConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  icon,
  bonusText,
  cost,
}: IdeologiConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-[480px] overflow-hidden shadow-2xl relative font-sans animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <div className="relative w-20 h-24 flex-shrink-0 rounded-xl flex items-center justify-center shadow-lg border border-[#00FFAA]/30 bg-[#0A1A1A] mt-2">
          <div className="absolute top-1 left-2 w-2 h-4 bg-[#00FFAA]/20 rounded-full" />
          <div className="absolute top-1 right-2 w-2 h-4 bg-[#00FFAA]/20 rounded-full" />
          <div className="text-[#00FFAA] transform scale-125">
            {icon}
          </div>
        </div>

        <h3 className="text-xl font-black text-[#E0E0E0] mt-6 text-center">{title}</h3>
        <p className="text-[#00FFAA] text-sm font-semibold mt-1 text-center">{bonusText}</p>

        <div className="flex items-center gap-3 mt-4 text-sm font-bold text-[#E0E0E0] bg-[#0A1A1A] px-4 py-2 rounded-xl border border-[#00FFAA]/20">
          <Coins className="w-5 h-5 text-amber-400" />
          <span>{cost.toLocaleString('id-ID')} EM</span>
        </div>

        <div className="flex w-full gap-4 mt-6">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-b from-[#ffe07d] via-[#fcae1e] to-[#c77a00] text-[#0A1A1A] font-black text-sm uppercase shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Seketika
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black text-sm uppercase shadow-md hover:bg-[#00FFAA]/80 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Ubah
          </button>
        </div>
        
        <p className="text-[10px] text-[#6B8A8A] font-bold mt-4 tracking-widest uppercase">
          * Biaya akan dipotong dari kas negara
        </p>
      </div>
    </div>
  );
}