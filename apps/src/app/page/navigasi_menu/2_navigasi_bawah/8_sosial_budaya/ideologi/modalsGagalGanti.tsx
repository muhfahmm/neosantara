"use client"
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 pointer-events-none">
      <div className="bg-root-surface border border-rose-500/40 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-500/10 rounded-lg border border-rose-500/30">
              <AlertCircle className="h-5 w-5 text-rose-400" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-root-text tracking-wide uppercase">
              Dana Tidak Cukup
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 bg-root-surface relative z-10 custom-scrollbar flex flex-col items-center justify-center">
          <div className="max-w-md w-full flex flex-col items-center bg-root-canvas border border-rose-500/30 p-8 rounded-2xl shadow-xl">
            <div className="w-20 h-20 rounded-full bg-rose-950/50 border border-rose-500/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>

            <h3 className="text-2xl font-black text-root-text mb-2 text-center">Dana Tidak Cukup!</h3>
            <p className="text-sm text-root-subtle text-center mb-6 leading-relaxed">
              Anda memerlukan <span className="font-black text-root-accent">{cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span> untuk perubahan ini.
              <br />
              Kas negara Anda saat ini: <span className="font-black text-rose-400">{currentMoney.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span>
            </p>

            {/* BUTTONS */}
            <div className="flex flex-col gap-3 w-full">
              {onBorrow && (
                <button
                  onClick={() => {
                    onBorrow();
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-black text-xs uppercase shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Ambil Hutang
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-root-accent/30 bg-root-accent/10 text-root-accent font-bold text-xs uppercase shadow-md hover:bg-root-accent/20 active:scale-95 transition-all cursor-pointer"
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