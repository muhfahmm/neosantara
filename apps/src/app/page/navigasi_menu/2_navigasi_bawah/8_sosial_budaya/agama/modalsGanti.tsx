"use client"
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Coins, Church } from "lucide-react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/30">
              <Church className="h-5 w-5 text-[#00FFAA]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#E0E0E0] tracking-wide uppercase">
              Konfirmasi Perubahan Agama
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-[#0F2424] relative z-10 custom-scrollbar flex flex-col items-center justify-center">
          <div className="max-w-md w-full flex flex-col items-center bg-[#0A1A1A] border border-[#00FFAA]/20 p-5 sm:p-6 rounded-2xl shadow-xl">
            <div className="relative w-16 h-20 flex-shrink-0 rounded-md flex items-center justify-center shadow-lg border-b-[4px] bg-[#051111] border-[#00FFAA]/40">
              <div className="absolute top-1 left-2 w-2 h-4 bg-[#00FFAA]/20 rounded-full" />
              <div className="absolute top-1 right-2 w-2 h-4 bg-[#00FFAA]/20 rounded-full" />
              <div className="text-[#00FFAA] transform scale-110">
                {icon}
              </div>
            </div>

            <h3 className="text-xl font-bold text-[#E0E0E0] mt-4 text-center">{title}</h3>
            <p className="text-[#00D68F] text-sm font-semibold mt-1 text-center">{bonusText}</p>

            <div className="flex items-center gap-2.5 mt-4 text-sm font-bold text-[#E0E0E0] bg-[#051111] px-4 py-2 rounded-xl border border-[#00FFAA]/20">
              <Coins className="w-4 h-4 text-[#00D68F]" />
              <span>{cost.toLocaleString('id-ID')} EM</span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex w-full gap-4 mt-6">
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-[#00D68F] hover:bg-[#00C282] text-[#0A1A1A] font-extrabold text-xs uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Seketika
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-[#00D68F] hover:bg-[#00C282] text-[#0A1A1A] font-extrabold text-xs uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Ubah
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
