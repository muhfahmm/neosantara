"use client";
import { createPortal } from "react-dom";

import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
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
    <NotebookModalWrapper compact zIndexClass="z-[100000001]">
      {/* Container Modal Lebih Lebar dan Panjang */}
      <div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
        
        {/* Area Konten */}
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide uppercase mb-6 border-b border-amber-400/20 pb-4">
            Kedutaan Belum Dapat Dibangun
          </h3>
          
          <p className="text-sm sm:text-base text-root-text leading-relaxed">
            Hubungan dengan <strong className="text-white">{countryName}</strong> harus mencapai minimal{" "}
            <strong className="text-amber-300">{minimumRelation}</strong> untuk membangun kedutaan. Hubungan saat ini{" "}
            <strong className="text-amber-300">{currentRelation}</strong>.
          </p>
        </div>

        {/* Area Tombol (Diperkecil) */}
        <div className="flex justify-end mt-6 pt-4 border-t border-amber-400/20">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 bg-root-accent hover:bg-[#00e699] border border-root-accent rounded-xl py-2 text-center text-root-canvas font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            Mengerti
          </button>
        </div>

      </div>
    </NotebookModalWrapper>
  );

  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}