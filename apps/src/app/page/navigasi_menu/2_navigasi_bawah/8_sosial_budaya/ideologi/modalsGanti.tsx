"use client"
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Coins, Shield } from "lucide-react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 pointer-events-none">
      <div className="bg-root-surface border border-root-accent/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-root-accent/10 rounded-lg border border-root-accent/30">
              <Shield className="h-5 w-5 text-root-accent" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-root-text tracking-wide uppercase">
              Konfirmasi Perubahan Ideologi
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
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-root-surface relative z-10 custom-scrollbar flex flex-col items-center justify-center">
          <div className="max-w-md w-full flex flex-col items-center bg-root-canvas border border-root-accent/20 p-5 sm:p-6 rounded-2xl shadow-xl">
            <div className="relative w-16 h-20 flex-shrink-0 rounded-xl flex items-center justify-center shadow-lg border border-root-accent/30 bg-root-canvas">
              <div className="absolute top-1 left-2 w-2 h-4 bg-root-accent/20 rounded-full" />
              <div className="absolute top-1 right-2 w-2 h-4 bg-root-accent/20 rounded-full" />
              <div className="text-root-accent transform scale-110">
                {icon}
              </div>
            </div>

            <h3 className="text-xl font-black text-root-text mt-4 text-center">{title}</h3>
            <p className="text-[#00D68F] text-sm font-semibold mt-1 text-center">{bonusText}</p>

            <div className="flex items-center gap-2.5 mt-4 text-sm font-bold text-root-text bg-[#051111] px-4 py-2 rounded-xl border border-root-accent/20">
              <Coins className="w-4 h-4 text-[#00D68F]" />
              <span>{cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex w-full gap-4 mt-6">
              {/* TOMBOL BATAL: Menggunakan border merah dan teks merah */}
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-transparent border-2 border-red-500 hover:bg-red-500/20 text-red-500 font-extrabold text-xs uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-[#00D68F] hover:bg-[#00C282] text-root-canvas font-extrabold text-xs uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
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