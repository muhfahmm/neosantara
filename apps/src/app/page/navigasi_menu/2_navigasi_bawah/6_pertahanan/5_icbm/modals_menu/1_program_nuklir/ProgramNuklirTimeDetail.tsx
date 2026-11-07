"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from "react";
import { X, Clock3 } from "lucide-react";
import NotebookModalWrapper from "../../../../NotebookModalWrapper";

interface ProgramNuklirTimeDetailProps {
  isOpen: boolean;
  onClose: () => void;
  durationLabel?: string;
  durationDays?: number;
}

export default function ProgramNuklirTimeDetail({
  isOpen,
  onClose,
  durationLabel = "1 Tahun",
  durationDays = 1,
}: ProgramNuklirTimeDetailProps) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper onClose={onClose} compact maxWidthClass="max-w-xl" zIndexClass="z-[100]">
      <div className="flex flex-col font-sans">
        <div className="px-4 sm:px-5 py-3 border-b border-[#FBBF24]/25 bg-root-canvas flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock3 className="h-6 w-6 text-[#FBBF24] drop-shadow-[0_0_6px_#FBBF24]" />
            <div>
              <h2 className="text-2xl font-bold text-[#FBBF24] uppercase tracking-tight">Waktu Pembangunan Program Nuklir</h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-root-subtle mt-1">Estimasi pembangunan selama program nuklir aktif</p>
            </div>
          </div>
          <SharedModalCloseButton
            onClick={onClose}
            className="p-2.5 rounded-xl border border-[#FBBF24]/40 text-root-subtle hover:text-[#FBBF24] hover:bg-[#FBBF24]/10 transition-all cursor-pointer flex items-center gap-1.5"
           appearance="custom">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </SharedModalCloseButton>
        </div>

        <div className="p-4 sm:p-5 bg-root-surface">
          <div className="rounded-2xl border border-[#FBBF24]/25 bg-[#FBBF24]/5 p-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/50 text-[#FBBF24]">
                <Clock3 className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-root-subtle font-bold">Durasi Pembangunan</p>
                <h3 className="text-3xl font-black text-[#FBBF24] mt-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">{durationLabel}</h3>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-[#D6F5EC]">
              <div className="rounded-2xl bg-[#0A1D1B] p-4 border border-root-accent/15">
                <p className="font-bold text-root-accent">Total Waktu:</p>
                <p className="mt-2 text-base">{durationDays.toLocaleString("id-ID", { maximumFractionDigits: 0 })} Hari</p>
              </div>
              <div className="rounded-2xl bg-[#0A1D1B] p-4 border border-root-accent/15">
                <p className="font-bold text-root-accent">Keterangan:</p>
                <p className="mt-2 text-[#9CC9BD] leading-relaxed">Program nuklir memerlukan waktu pembangunan selama satu tahun penuh (365 hari) untuk menyelesaikan riset, pengayaan bahan bakar, dan pembangunan fasilitas strategis.</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-[#FBBF24] text-[#04100F] font-black text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(251,191,36,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}