"use client"
import React from "react";
import { X, Coins } from "lucide-react";

interface AgamaConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  icon: React.ReactNode;
  bonusText: string;
  cost: number;
}

export default function AgamaConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  icon,
  bonusText,
  cost,
}: AgamaConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-[480px] min-h-[420px] overflow-hidden shadow-2xl relative font-sans animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-end px-6 py-4 shrink-0 border-b border-[#00FFAA]/20 bg-[#0A1A1A]">
          <button onClick={onClose} className="text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">
          <div className="relative w-20 h-24 flex-shrink-0 rounded-md flex items-center justify-center shadow-lg border-b-[4px] bg-[#051111] border-[#00FFAA]/40 mt-2">
            <div className="absolute top-1 left-2 w-2 h-4 bg-[#00FFAA]/20 rounded-full" />
            <div className="absolute top-1 right-2 w-2 h-4 bg-[#00FFAA]/20 rounded-full" />
            <div className="text-[#00FFAA] transform scale-125">
              {icon}
            </div>
          </div>

          <h3 className="text-xl font-bold text-[#E0E0E0] mt-6 text-center">{title}</h3>
          <p className="text-[#00FFAA] text-sm font-semibold mt-1 text-center">{bonusText}</p>

          <div className="flex items-center gap-3 mt-4 text-sm font-bold text-[#E0E0E0]">
            <Coins className="w-5 h-5 text-[#00FFAA]" />
            <span>{cost.toLocaleString('id-ID')} EM</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex w-full gap-4 px-6 pb-6 shrink-0 bg-[#0A1A1A] pt-4 border-t border-[#00FFAA]/20">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black text-xs uppercase shadow-md hover:bg-[#00FFAA]/80 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Seketika
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#00FFAA]/10 text-[#00FFAA] font-bold text-xs uppercase shadow-md hover:bg-[#00FFAA]/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Ubah
          </button>
        </div>
      </div>
    </div>
  );
}