"use client";
import React from "react";
import { createPortal } from "react-dom";

interface DestroyAliansiModalProps {
  isOpen: boolean;
  countryName?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DestroyAliansiModal({ isOpen, countryName, onClose, onConfirm }: DestroyAliansiModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    // 🔥 PERBAIKAN: Menghapus bg-black/60 agar tidak ada backdrop
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
      {/* Container Modal Lebih Lebar dan Panjang */}
      <div className="w-full max-w-2xl min-h-[450px] flex flex-col bg-[#0F2424] border border-rose-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(225,29,72,0.15)] relative pointer-events-auto">
        
        {/* Area Konten */}
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-black text-rose-400 tracking-wide uppercase mb-6 border-b border-rose-500/20 pb-4">
            Konfirmasi Putus Aliansi Pertahanan
          </h3>
          
          <p className="text-sm sm:text-base text-[#E0E0E0] mb-6 leading-relaxed">
            Apakah Anda yakin ingin memutus aliansi pertahanan dengan <strong className="text-white">{countryName}</strong>? Ini dapat berdampak pada dukungan militer di masa depan.
          </p>
        </div>

        {/* Area Tombol di bagian paling bawah (Diperkecil) */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-rose-500/20">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl py-2 text-center text-[#E0E0E0] font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
          >
            Batal
          </button>

          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="w-full sm:w-auto px-6 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-500 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            Putus Aliansi
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