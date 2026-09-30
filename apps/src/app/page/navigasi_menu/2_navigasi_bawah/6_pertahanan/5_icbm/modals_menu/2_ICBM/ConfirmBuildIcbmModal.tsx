"use client";
import React from "react";
import { X } from "lucide-react";

interface ConfirmBuildIcbmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quantity: number;
  totalCashCost: number;
  totalUraniumCost: number;
  totalBuildDays: number;
  completionDate: string;
}

export default function ConfirmBuildIcbmModal({
  isOpen,
  onClose,
  onConfirm,
  quantity,
  totalCashCost,
  totalUraniumCost,
  totalBuildDays,
  completionDate,
}: ConfirmBuildIcbmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-4 border-[#C4B49C] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col relative font-sans pointer-events-auto">
        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE]">
          <div>
            <h3 className="text-xl font-black text-[#5c3c10]">Konfirmasi Pembangunan ICBM</h3>
            <p className="text-[11px] text-[#8b7e66] mt-1">Pastikan sumber daya mencukupi sebelum melanjutkan.</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 bg-[#FAF6EE]/40">
          <div className="space-y-4 text-sm text-[#5c3c10]">
            <p className="font-bold">Anda akan membangun <span className="text-[#1d5c4b]">{quantity} ICBM</span> dengan biaya:</p>
            <ul className="space-y-2 pl-4 list-disc text-[#5c3c10]">
              <li>{totalCashCost.toLocaleString("id-ID")} NEO</li>
              <li>{totalUraniumCost} uranium</li>
              <li>Durasi: {totalBuildDays} hari</li>
              <li>Selesai pada: {completionDate}</li>
            </ul>
            <p className="text-[#8b7e66]">Klik Oke untuk melanjutkan dan kembali ke Komando Strategis Nuklir.</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#C4B49C]/30 bg-[#FAF6EE] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#C4B49C] bg-white text-[#5c3c10] font-bold hover:bg-[#f7f2e8] transition-all cursor-pointer">Batal</button>
          <button onClick={() => { onConfirm(); }} className="px-4 py-2 rounded-lg bg-[#1d5c4b] text-white font-bold hover:bg-[#154a3c] transition-all cursor-pointer">Oke</button>
        </div>
      </div>
    </div>
  );
}
