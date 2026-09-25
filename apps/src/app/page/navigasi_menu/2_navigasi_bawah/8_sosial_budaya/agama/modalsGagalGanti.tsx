"use client"
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 pointer-events-none">
      <div className="bg-[#0F2424] border border-rose-500/40 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-500/10 rounded-lg border border-rose-500/30">
              <AlertCircle className="h-5 w-5 text-rose-400" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#E0E0E0] tracking-wide uppercase">
              Dana Tidak Cukup
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
        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 bg-[#0F2424] relative z-10 custom-scrollbar flex flex-col items-center justify-center">
          <div className="max-w-md w-full flex flex-col items-center bg-[#0A1A1A] border border-rose-500/30 p-8 rounded-2xl shadow-xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>

            <h3 className="text-2xl font-bold text-[#E0E0E0] mb-2 text-center">Dana Tidak Cukup!</h3>
            <p className="text-sm text-[#6B8A8A] text-center mb-6 leading-relaxed">
              Anda memerlukan <span className="font-bold text-[#00FFAA]">{cost.toLocaleString('id-ID')} EM</span> untuk perubahan ini.
              <br />
              Kas negara Anda saat ini: <span className="font-bold text-rose-400">{currentMoney.toLocaleString('id-ID')} EM</span>
            </p>

            {/* BUTTONS */}
            <div className="flex flex-col gap-3 w-full">
              {onBorrow && (
                <button
                  onClick={() => {
                    onBorrow();
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 text-[#0A1A1A] font-black text-xs uppercase shadow-md hover:bg-amber-400 active:scale-95 transition-all cursor-pointer"
                >
                  Ambil Hutang
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-[#00FFAA]/30 bg-[#00FFAA]/10 text-[#00FFAA] font-bold text-xs uppercase shadow-md hover:bg-[#00FFAA]/20 active:scale-95 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}