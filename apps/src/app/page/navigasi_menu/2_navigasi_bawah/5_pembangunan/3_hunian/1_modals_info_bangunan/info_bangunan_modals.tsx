"use client";
import React from "react";
import { X, Info } from "lucide-react";

interface InfoBangunanModalProps {
  label: string;
  perCount: number;
  konsumsiUnit: number;
  biaya: number;
  waktu?: number;
  onClose: () => void;
}

export default function InfoBangunanModal({
  label,
  perCount,
  konsumsiUnit,
  biaya,
  waktu,
  onClose,
}: InfoBangunanModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div
        className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3 text-[#E0E0E0]">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <h3 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Info Bangunan - {label}</h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
            aria-label="Tutup info"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 relative z-10 flex-1 overflow-y-auto space-y-4 text-xs font-semibold text-[#E0E0E0] custom-scrollbar">
          <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#6B8A8A]">Listrik Dikonsumsi (Satuan):</span>
              <span className="text-rose-400 font-black text-sm">{konsumsiUnit.toLocaleString('id-ID')} MW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#6B8A8A]">Listrik Dikonsumsi (Total):</span>
              <span className="text-rose-400 font-black text-sm">{(konsumsiUnit * perCount).toLocaleString('id-ID')} MW</span>
            </div>
            <div className="flex justify-between items-center border-t border-[#00FFAA]/10 pt-2 mt-2">
              <span className="text-[#6B8A8A]">Biaya Pembangunan:</span>
              <span className="text-[#00FFAA] font-black text-sm">{biaya.toLocaleString('id-ID')} EM</span>
            </div>
            {waktu !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-[#6B8A8A]">Estimasi Waktu Pembangunan:</span>
                <span className="text-[#E0E0E0] font-bold text-sm">{waktu} hari</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-[#6B8A8A]">Jumlah Bangunan Saat Ini:</span>
              <span className="text-[#00FFAA] font-black text-sm">{perCount} unit</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex justify-end relative z-10 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="py-2.5 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center cursor-pointer bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 shadow-md"
          >
            Tutup Info
          </button>
        </div>
      </div>
    </div>
  );
}