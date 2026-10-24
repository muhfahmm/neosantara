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
    <div className="fixed inset-0 z-[100000001] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
      {/* Container Modal Lebih Lebar dan Panjang */}
      <div className="w-full max-w-2xl min-h-[450px] flex flex-col bg-[#0F2424] border border-amber-400/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(251,191,36,0.15)] relative pointer-events-auto">
        
        {/* Area Konten */}
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide uppercase mb-6 border-b border-amber-400/20 pb-4">
            Kedutaan Belum Dapat Dibangun
          </h3>
          
          <p className="text-sm sm:text-base text-[#E0E0E0] leading-relaxed">
            Hubungan dengan <strong className="text-white">{countryName}</strong> harus mencapai minimal{" "}
            <strong className="text-amber-300">{minimumRelation}</strong> untuk membangun kedutaan. Hubungan saat ini{" "}
            <strong className="text-amber-300">{currentRelation}</strong>.
          </p>
        </div>

        {/* Area Tombol (Diperkecil) */}
        <div className="flex justify-end mt-6 pt-4 border-t border-amber-400/20">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 bg-[#00FFAA] hover:bg-[#00e699] border border-[#00FFAA] rounded-xl py-2 text-center text-[#0A1A1A] font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            Mengerti
          </button>
        </div>

      </div>
    </div>
  );

  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}