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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
      <div className="bg-[#061312] border-2 border-[#00FFAA] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_30px_rgba(0,255,170,0.3)] flex flex-col relative font-sans">
        <div className="px-8 py-6 border-b border-[#00FFAA]/20 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-[#00FFAA] uppercase tracking-wide drop-shadow-[0_0_8px_rgba(0,255,170,0.6)]">Konfirmasi Pembangunan ICBM</h3>
            <p className="text-[11px] text-[#6B8A8A] mt-1">Pastikan sumber daya mencukupi sebelum melanjutkan.</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl border border-[#00FFAA]/40 text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#00FFAA]/10 transition-all cursor-pointer flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4 text-sm text-[#D6F5EC]">
            <p className="font-bold">Anda akan membangun <span className="text-[#00FFAA]">{quantity} ICBM</span> dengan biaya:</p>
            <ul className="space-y-2 pl-4 list-disc marker:text-[#00FFAA]">
              <li>{totalCashCost.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</li>
              <li>{totalUraniumCost} uranium</li>
              <li>Durasi: {totalBuildDays} hari</li>
              <li>Selesai pada: {completionDate}</li>
            </ul>
            <p className="text-[#6B8A8A]">Klik Oke untuk melanjutkan dan kembali ke Komando Strategis Nuklir.</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#00FFAA]/20 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg border border-[#00FFAA]/40 text-[#9CC9BD] font-bold hover:bg-[#00FFAA]/10 transition-all cursor-pointer">Batal</button>
          <button onClick={() => { onConfirm(); }} className="px-5 py-2 rounded-lg bg-[#00FFAA] text-[#04100F] font-black shadow-[0_0_16px_rgba(0,255,170,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer">Oke</button>
        </div>
      </div>
    </div>
  );
}
