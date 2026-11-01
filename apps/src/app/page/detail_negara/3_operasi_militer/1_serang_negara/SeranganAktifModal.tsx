"use client";

import { createPortal } from "react-dom";

interface SeranganAktifModalProps {
  isOpen: boolean;
  targetCountry?: string;
  onClose: () => void;
}

export default function SeranganAktifModal({
  isOpen,
  targetCountry,
  onClose,
}: SeranganAktifModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100000001] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
      <div className="w-full max-w-2xl min-h-[450px] flex flex-col bg-[#0F2424] border border-amber-400/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(251,191,36,0.15)] relative pointer-events-auto">
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide uppercase mb-6 border-b border-amber-400/20 pb-4">
            Operasi Militer Masih Berlangsung
          </h3>

          <p className="text-sm sm:text-base text-[#E0E0E0] leading-relaxed">
            Negara Anda masih berperang dengan{" "}
            <strong className="text-amber-300">{targetCountry || "negara lain"}</strong>.
            Selesaikan perang tersebut terlebih dahulu sebelum menyerang negara lain.
          </p>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-amber-400/20">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 bg-[#00FFAA] hover:bg-[#00e699] border border-[#00FFAA] rounded-xl py-2 text-center text-[#0A1A1A] font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
