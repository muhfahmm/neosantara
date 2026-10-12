"use client";
import { createPortal } from "react-dom";

interface EmbassyRelationRequirementModalProps {
  isOpen: boolean;
  countryName?: string | null;
  currentRelation: number;
  minimumRelation: number;
  onClose: () => void;
}

export default function EmbassyRelationRequirementModal({
  isOpen,
  countryName,
  currentRelation,
  minimumRelation,
  onClose,
}: EmbassyRelationRequirementModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 font-sans text-white pointer-events-auto">
      <div className="w-full max-w-[440px] bg-[#0F2424] border border-amber-400/40 rounded-2xl p-6 shadow-2xl relative">
        <h3 className="text-lg font-black text-amber-300 tracking-wide uppercase mb-3">Kedutaan Belum Dapat Dibangun</h3>
        <p className="text-xs sm:text-sm text-[#E0E0E0] mb-6 leading-relaxed">
          Hubungan dengan <strong className="text-white">{countryName}</strong> harus mencapai minimal{" "}
          <strong className="text-amber-300">{minimumRelation}</strong> untuk membangun kedutaan. Hubungan saat ini{" "}
          <strong className="text-amber-300">{currentRelation}</strong>.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#00FFAA] hover:bg-[#00e699] border border-[#00FFAA] rounded-xl py-2.5 text-center text-[#0A1A1A] font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
        >
          Mengerti
        </button>
      </div>
    </div>
  );

  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
