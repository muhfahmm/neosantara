"use client";
import React from "react";
import { Info } from "lucide-react";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

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
    <NotebookModalWrapper onClose={onClose}>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3 text-[#E0E0E0]">
            <div className={`shrink-0 border border-[#00FFAA]/30 bg-[#0F2424] p-1 sm:p-1.5 ${rootBorderRadius.card}`}>
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <h3 className={rootModalTypography.title}>Info Bangunan - {label}</h3>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className={`p-6 relative z-10 flex-1 overflow-y-auto space-y-4 custom-scrollbar ${rootModalTypography.body}`}>
          <div className={`space-y-2 border border-[#00FFAA]/20 bg-[#0A1A1A] p-4 ${rootBorderRadius.card}`}>
            <div className="flex justify-between items-center">
              <span className="text-[#AAB6B6]">Listrik Dikonsumsi (Satuan):</span>
              <span className="text-xs font-black text-rose-400">{konsumsiUnit.toLocaleString('id-ID', { maximumFractionDigits: 4 })} MW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#AAB6B6]">Listrik Dikonsumsi (Total):</span>
              <span className="text-xs font-black text-rose-400">{(konsumsiUnit * perCount).toLocaleString('id-ID', { maximumFractionDigits: 2 })} MW</span>
            </div>
            <div className="flex justify-between items-center border-t border-[#00FFAA]/10 pt-2 mt-2">
              <span className="text-[#AAB6B6]">Biaya Pembangunan:</span>
              <span className="text-xs font-black text-[#00FFAA]">{biaya.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span>
            </div>
            {waktu !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-[#AAB6B6]">Estimasi Waktu Pembangunan:</span>
                <span className="text-xs font-bold text-[#E0E0E0]">{waktu} hari</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-[#AAB6B6]">Jumlah Bangunan Saat Ini:</span>
              <span className="text-xs font-black text-[#00FFAA]">{perCount} unit</span>
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
    </NotebookModalWrapper>
  );
}