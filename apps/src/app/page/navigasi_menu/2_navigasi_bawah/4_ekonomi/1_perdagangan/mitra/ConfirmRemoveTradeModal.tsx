// mitra/confirmRemoveTradeModals.tsx

"use client";
import React from "react";

interface Props {
  isOpen: boolean;
  partnerName?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmRemoveTradeModal({ isOpen, partnerName, onClose, onConfirm }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[420px] bg-[#0F2424] rounded-2xl p-6 border border-[#00FFAA]/30">
        <h3 className="text-lg font-black text-[#00FFAA] mb-3">Putus Hubungan Dagang</h3>
        <p className="text-sm text-[#E0E0E0] mb-6">Apakah Anda yakin ingin memutus hubungan dagang dengan <strong className="text-[#00FFAA]">{partnerName}</strong>? Anda dapat menjalin kembali melalui menu Mitra.</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="flex-1 bg-[#0A1A1A] border border-[#00FFAA]/30 hover:bg-[#00FFAA] hover:text-[#0A1A1A] rounded py-2.5 text-center text-[#00FFAA] font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 bg-rose-600 hover:bg-rose-500 rounded py-2.5 text-center text-white font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer"
          >
            Putus Hubungan
          </button>
        </div>
      </div>
    </div>
  );
}
