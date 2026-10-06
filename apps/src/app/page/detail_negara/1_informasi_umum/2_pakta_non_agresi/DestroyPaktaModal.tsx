"use client";
import React from "react";

interface DestroyPaktaModalProps {
  isOpen: boolean;
  countryName?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DestroyPaktaModal({ isOpen, countryName, onClose, onConfirm }: DestroyPaktaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] bg-white rounded-2xl p-6 shadow-lg border border-[#E5DCCF]">
        <h3 className="text-lg font-black text-[#3d2911] mb-3">Konfirmasi Putus Pakta Non-Agresi</h3>
        <p className="text-sm text-[#5c3c10] mb-6">Apakah Anda yakin ingin memutus pakta non-agresi dengan <strong>{countryName}</strong>? Tindakan ini dapat memengaruhi hubungan diplomatik.</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="flex-1 bg-white/70 border border-[#C4B49C]/30 rounded py-2.5 text-center text-[#5c3c10] font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer hover:shadow-md"
          >
            Batal
          </button>

          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-700 rounded py-2.5 text-center text-white font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            Putus Pakta
          </button>
        </div>
      </div>
    </div>
  );
}
